<?php

namespace TmrEcosystem\Stock\Application\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use TmrEcosystem\Sales\Domain\Events\OrderUpdated;
use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\PickingSlip;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;

class SyncStockOnOrderUpdated implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private StockLevelRepositoryInterface $stockRepo,
        private ItemLookupServiceInterface $itemLookupService
    ) {}

    public function handle(OrderUpdated $event): void
    {
        $order = $event->order;
        $warehouseUuid = $order->getWarehouseId();
        $companyId = $order->getCompanyId();

        Log::info("Stock: Syncing Soft Reserve for Updated Order: {$order->getOrderNumber()}");

        // ... (Logic หา PickingSlip เหมือนเดิม) ...
        $pickingSlip = PickingSlip::with('items')
            ->where('order_id', $order->getId())
            ->whereIn('status', ['pending', 'assigned'])
            ->first();

        if (!$pickingSlip) return;

        DB::transaction(function () use ($order, $pickingSlip, $warehouseUuid, $companyId) {

            // 1. ✅ หา Location UUID ของ "GENERAL"
            $locationUuid = DB::table('warehouse_storage_locations')
                ->where('warehouse_uuid', $warehouseUuid)
                ->where('code', 'GENERAL')
                ->value('uuid');

            if (!$locationUuid) return;

            // ... (Logic คำนวณ Diff เหมือนเดิม) ...
            $newItems = $order->getItems();
            $oldItems = $pickingSlip->items;
            $newQtyMap = [];
            foreach ($newItems as $item) $newQtyMap[$item->productId] = $item->quantity;
            $oldQtyMap = [];
            foreach ($oldItems as $item) $oldQtyMap[$item->product_id] = $item->quantity_requested;
            $allProductIds = array_unique(array_merge(array_keys($newQtyMap), array_keys($oldQtyMap)));

            foreach ($allProductIds as $productId) {
                $newQty = $newQtyMap[$productId] ?? 0;
                $oldQty = $oldQtyMap[$productId] ?? 0;
                $diff = $newQty - $oldQty;

                if ($diff == 0) continue;

                // 2. แปลง Product ID -> Item UUID
                $itemDto = $this->itemLookupService->findByPartNumber($productId);
                if (!$itemDto) continue;

                // 3. ✅ ค้นหา StockLevel ที่ GENERAL
                $stockLevel = $this->stockRepo->findByLocation(
                    $itemDto->uuid,
                    $locationUuid,
                    $companyId
                );

                if (!$stockLevel) {
                    if ($diff > 0) {
                        // ถ้าต้องจองเพิ่ม แต่ไม่มี Record -> สร้างใหม่
                         $stockLevel = \TmrEcosystem\Stock\Domain\Aggregates\StockLevel::create(
                            uuid: $this->stockRepo->nextUuid(),
                            companyId: $companyId,
                            itemUuid: $itemDto->uuid,
                            warehouseUuid: $warehouseUuid,
                            locationUuid: $locationUuid
                        );
                        $this->stockRepo->save($stockLevel, []);
                    } else {
                        continue;
                    }
                }

                if ($diff > 0) {
                    try {
                        $stockLevel->reserveSoft((float) $diff);
                        Log::info("Stock: Increased Reserve for {$productId} at GENERAL");
                    } catch (Exception $e) {
                         Log::error("Stock: Reserve failed: " . $e->getMessage());
                    }
                } else {
                    $stockLevel->releaseSoftReservation((float) abs($diff));
                    Log::info("Stock: Released Reserve for {$productId} at GENERAL");
                }

                $this->stockRepo->save($stockLevel, []);
            }
        });
    }
}
