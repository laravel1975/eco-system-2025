<?php

namespace TmrEcosystem\Warehouse\Application\DTOs;

/**
 * DTO (Data Transfer Object) สำหรับการ "สร้าง" หรือ "อัปเดต" Warehouse
 * (นี่คือ POPO ธรรมดา ไม่ใช่ Spatie)
 */
class WarehouseData
{
    public function __construct(
        public string $companyId,
        public string $name,
        public string $code,
        public bool $isActive,
        public ?string $description
    ) {
    }
}
