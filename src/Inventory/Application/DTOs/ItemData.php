<?php

namespace TmrEcosystem\Inventory\Application\DTOs;

/**
 * DTO (Data Transfer Object) สำหรับการส่งข้อมูล Item
 * ใช้สำหรับการ Create และ Update
 */
class ItemData
{
    public function __construct(
        public string $companyId,
        public string $partNumber,
        public string $name,

        // ✅ เปลี่ยนจาก string $uom เป็น string $uomId (UUID)
        public string $uomId,

        public float $averageCost,

        // ✅ เปลี่ยนจาก string $category เป็น string $categoryId (UUID)
        public ?string $categoryId,

        public ?string $description,
        public ?array $images = [] // ✅ รับค่ามาจาก Controller และเก็บไว้ที่นี่
    ) {
    }
}
