<?php

namespace TmrEcosystem\Stock\Application\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use TmrEcosystem\Sales\Domain\Events\OrderCancelled;
use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;

class ReleaseStockOnOrderCancelled implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private StockLevelRepositoryInterface $stockRepo,
        private ItemLookupServiceInterface $itemLookupService // ✅ Inject Service ดีกว่า Query เอง
    ) {}

    public function handle(OrderCancelled $event): void
    {
        $order = $event->order;
        $warehouseUuid = $order->getWarehouseId();
        $companyId = $order->getCompanyId();

        Log::info("Stock: Releasing Soft Reserve for Cancelled Order: {$order->getOrderNumber()}");

        DB::transaction(function () use ($order, $warehouseUuid, $companyId) {

            // 1. ✅ หา Location UUID ของ "GENERAL"
            $locationUuid = DB::table('warehouse_storage_locations')
                ->where('warehouse_uuid', $warehouseUuid)
                ->where('code', 'GENERAL')
                ->value('uuid');

            if (!$locationUuid) {
                Log::error("Stock: Cannot release stock. GENERAL location not found.");
                return;
            }

            foreach ($order->getItems() as $item) {
                // 2. แปลง Product ID -> Item UUID
                $itemDto = $this->itemLookupService->findByPartNumber($item->productId);
                if (!$itemDto) continue;

                // 3. ✅ ค้นหา StockLevel ที่ GENERAL
                $stockLevel = $this->stockRepo->findByLocation(
                    $itemDto->uuid,
                    $locationUuid,
                    $companyId
                );

                if ($stockLevel) {
                    // 4. คืนยอดจอง
                    $stockLevel->releaseSoftReservation((float) $item->quantity);
                    $this->stockRepo->save($stockLevel, []);

                    Log::info("Stock: Released {$item->quantity} of {$item->productId} from GENERAL");
                }
            }
        });
    }
}
