<?php

namespace TmrEcosystem\Stock\Application\Listeners;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use TmrEcosystem\Sales\Domain\Events\OrderConfirmed;
use TmrEcosystem\Stock\Domain\Exceptions\InsufficientStockException;
use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use TmrEcosystem\Stock\Domain\Aggregates\StockLevel;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;
use TmrEcosystem\Stock\Application\Services\StockPickingService;

class ReserveStockOnOrderConfirmed
{
    public function __construct(
        private StockLevelRepositoryInterface $stockRepo,
        private ItemLookupServiceInterface $itemLookupService,
        private StockPickingService $pickingService
    ) {}

    public function handle(OrderConfirmed $event): void
    {
        $order = $event->order;
        $items = $order->getItems();
        $warehouseUuid = $order->getWarehouseId();
        $companyId = $order->getCompanyId();

        Log::info("Stock: Processing Smart Reserve for Order: {$order->getOrderNumber()}");

        DB::transaction(function () use ($order, $items, $warehouseUuid, $companyId) {

            // 1. เตรียม Cache ของ GENERAL UUID
            $generalLocationUuid = DB::table('warehouse_storage_locations')
                ->where('warehouse_uuid', $warehouseUuid)
                ->where('code', 'GENERAL')
                ->value('uuid');

            // ⚠️ ถ้าไม่มี GENERAL ให้สร้างเดี๋ยวนั้นเลย (Fail-safe)
            if (!$generalLocationUuid) {
                $generalLocationUuid = \Illuminate\Support\Str::uuid()->toString();
                DB::table('warehouse_storage_locations')->insert([
                    'uuid' => $generalLocationUuid,
                    'warehouse_uuid' => $warehouseUuid,
                    'code' => 'GENERAL',
                    'barcode' => 'GENERAL-' . substr($warehouseUuid, 0, 4),
                    'type' => 'BULK',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                Log::warning("Stock: Auto-created GENERAL location for Warehouse {$warehouseUuid}");
            }

            foreach ($items as $item) {
                $inventoryItemDto = $this->itemLookupService->findByPartNumber($item->productId);
                if (!$inventoryItemDto) continue;

                // 2. คำนวณแผนการจอง
                $plan = $this->pickingService->calculatePickingPlan(
                    $inventoryItemDto->uuid,
                    $warehouseUuid,
                    (float) $item->quantity
                );

                // 3. วนลูปจอง
                foreach ($plan as $step) {
                    $locationUuid = $step['location_uuid'];
                    $qtyToReserve = $step['quantity'];

                    // ✅ FIX: บังคับเปลี่ยน NULL เป็น GENERAL ทันที
                    if (is_null($locationUuid)) {
                        $locationUuid = $generalLocationUuid;
                        Log::info("Stock: Backorder fallback to GENERAL for {$item->productId}");
                    }

                    // 4. ค้นหา Stock Level (ตอนนี้ $locationUuid ไม่มีทางเป็น NULL แล้ว)
                    $stockLevel = $this->stockRepo->findByLocation(
                        $inventoryItemDto->uuid,
                        $locationUuid,
                        $companyId
                    );

                    if (!$stockLevel) {
                        $stockLevel = StockLevel::create(
                            uuid: $this->stockRepo->nextUuid(),
                            companyId: $companyId,
                            itemUuid: $inventoryItemDto->uuid,
                            warehouseUuid: $warehouseUuid,
                            locationUuid: $locationUuid
                        );
                        $this->stockRepo->save($stockLevel, []);
                    }

                    try {
                        $stockLevel->reserveSoft($qtyToReserve);
                        $this->stockRepo->save($stockLevel, []);
                        Log::info("Stock: Reserved {$qtyToReserve} at location {$locationUuid}");
                    } catch (InsufficientStockException $e) {
                        Log::error("Stock Reserve Failed: " . $e->getMessage());
                    }
                }
            }
        });
    }
}
