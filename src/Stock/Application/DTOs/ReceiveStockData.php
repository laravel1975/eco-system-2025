<?php

namespace TmrEcosystem\Stock\Application\DTOs;

/**
 * DTO (Data Transfer Object) สำหรับการ "รับเข้า" สต็อก
 */
class ReceiveStockData
{
    /**
     * @param string $companyId ID ของบริษัท
     * @param string $itemUuid UUID ของ Item
     * @param string $warehouseUuid UUID ของ Warehouse (ปลายทาง)
     * @param string $locationUuid ต้องระบุว่าจะรับของเข้าพิกัดไหน
     * @param float $quantity จำนวนที่รับ (ต้องเป็นบวก)
     * @param string|null $userId ID ของ User ที่ทำรายการ
     * @param string|null $reference เลขที่อ้างอิง (เช่น PO-123)
     */
    public function __construct(
        public string $companyId,
        public string $itemUuid,
        public string $warehouseUuid,
        public string $locationUuid, // ✅ เพิ่ม: ต้องระบุว่าจะรับของเข้าพิกัดไหน
        public float $quantity,
        public ?string $userId = null,
        public ?string $reference = null
    ) {
    }
}
