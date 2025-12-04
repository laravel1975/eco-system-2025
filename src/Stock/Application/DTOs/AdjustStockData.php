<?php

namespace TmrEcosystem\Stock\Application\DTOs;

/**
 * DTO (Data Transfer Object) สำหรับการ "ปรับยอด" สต็อก
 */
class AdjustStockData
{
    /**
     * @param string $companyId ID ของบริษัท
     * @param string $itemUuid UUID ของ Item
     * @param string $warehouseUuid UUID ของ Warehouse (สำคัญมาก)
     * @param string $locationUuid ต้องระบุว่าจะนับสต็อกที่พิกัดไหน
     * @param float $newQuantity ยอดใหม่ที่นับได้ (ไม่ใช่ส่วนต่าง)
     * @param string|null $userId ID ของ User ที่ทำรายการ
     * @param string|null $reason เหตุผลในการปรับยอด (สำหรับ Movement Log)
     */
    public function __construct(
        public string $companyId,
        public string $itemUuid,
        public string $warehouseUuid,
        public string $locationUuid, // ✅ เพิ่ม: ต้องระบุว่าจะนับสต็อกที่พิกัดไหน
        public float $newQuantity,
        public ?string $userId = null,
        public ?string $reason = null // (เหตุผล)
    ) {
    }
}
