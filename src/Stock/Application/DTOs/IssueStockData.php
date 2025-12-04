<?php

namespace TmrEcosystem\Stock\Application\DTOs;

/**
 * DTO (Data Transfer Object) สำหรับการ "เบิก" สต็อก
 */
class IssueStockData
{
    /**
     * @param string $companyId ID ของบริษัท
     * @param string $itemUuid UUID ของ Item
     * @param string $warehouseUuid UUID ของ Warehouse (ต้นทาง)
     * @param string $locationUuid ต้องระบุว่าจะหยิบจากพิกัดไหน
     * @param float $quantity จำนวนที่เบิก (ต้องเป็นบวก)
     * @param string|null $userId ID ของ User ที่ทำรายการ
     * @param string|null $reference เลขที่อ้างอิง (เช่น SO-123, WO-456)
     */
    public function __construct(
        public string $companyId,
        public string $itemUuid,
        public string $warehouseUuid,
        public string $locationUuid,
        public float $quantity,
        public ?string $userId = null,
        public ?string $reference = null
    ) {
    }
}
