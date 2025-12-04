<?php

namespace TmrEcosystem\Stock\Application\Services;

use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use Illuminate\Support\Facades\DB;

class StockPickingService
{
    public function __construct(
        protected StockLevelRepositoryInterface $stockRepository
    ) {}

    /**
     * (Backward Compatibility) ให้ Controller เก่าเรียกใช้ได้โดยไม่ต้องแก้โค้ดเยอะ
     */
    public function suggestPickingLocations(string $itemUuid, string $warehouseUuid, float $qtyNeeded): array
    {
        return $this->calculatePickingPlan($itemUuid, $warehouseUuid, $qtyNeeded);
    }

    /**
     * ✅ [Picking Phase] คำนวณแผนการหยิบสินค้า (Picking Plan)
     * Logic: หาจาก "Available Stock" (On Hand - Reserved) เพื่อไม่ให้หยิบซ้อนกับออเดอร์อื่น
     * ใช้สำหรับ: แสดงใน Picking Slip / หน้าจอ Picking Process
     */
    public function calculatePickingPlan(string $itemUuid, string $warehouseUuid, float $qtyNeeded): array
    {
        // 1. ดึงสต็อกทั้งหมดที่มี เรียงตาม Priority (Picking > Bulk)
        $stocks = $this->stockRepository->findPickableStocks($itemUuid, $warehouseUuid);

        $plan = [];
        $remainingNeeded = $qtyNeeded;

        foreach ($stocks as $stock) {
            if ($remainingNeeded <= 0) break;

            // Picking ต้องดูยอด Available เท่านั้น
            $available = $stock->getAvailableQuantity();

            if ($available <= 0) continue;

            // จะหยิบเท่าไหร่?
            $qtyToPick = min($available, $remainingNeeded);

            // ดึง Location Code
            $locationCode = DB::table('warehouse_storage_locations')
                ->where('uuid', $stock->locationUuid())
                ->value('code');

            $plan[] = [
                'location_uuid' => $stock->locationUuid(),
                'location_code' => $locationCode,
                'quantity' => $qtyToPick
            ];

            $remainingNeeded -= $qtyToPick;
        }

        // ถ้าของไม่พอ (Backorder)
        if ($remainingNeeded > 0) {
            $plan[] = [
                'location_uuid' => null,
                'location_code' => 'NOT_ENOUGH_STOCK',
                'quantity' => $remainingNeeded
            ];
        }

        return $plan;
    }

    /**
     * ✅ [Shipment Phase] คำนวณจุดตัดสต็อก (Deduction Plan)
     * Logic: เน้นหาจุดที่มี "Reserved" เยอะๆ ก่อน แล้วค่อยดู "On Hand"
     * ใช้สำหรับ: ตัดสต็อกจริงเมื่อกด Shipped (Shipment/Delivery Controller)
     */
    public function calculateShipmentDeductionPlan(string $itemUuid, string $warehouseUuid, float $qtyNeeded): array
    {
        // 1. ดึงสต็อกทั้งหมดที่มี OnHand
        $stocks = $this->stockRepository->findPickableStocks($itemUuid, $warehouseUuid);

        // 2. เรียงลำดับใหม่: เอาที่มียอด Reserved เยอะสุดขึ้นก่อน (เพราะนั่นคือที่ที่เราจองไว้ตอน Picking)
        $stocks = $stocks->sortByDesc(fn($s) => $s->getQuantityReserved());

        $plan = [];
        $remaining = $qtyNeeded;

        foreach ($stocks as $stock) {
            if ($remaining <= 0) break;

            $onHand = $stock->getQuantityOnHand(); // Shipment ต้องดูของที่มีอยู่จริง (On Hand)
            if ($onHand <= 0) continue;

            // ตัดเท่าที่มี หรือ เท่าที่ต้องการ
            $deduct = min($onHand, $remaining);

            $plan[] = [
                'location_uuid' => $stock->locationUuid(),
                'quantity' => $deduct
            ];

            $remaining -= $deduct;
        }

        return $plan;
    }
}
