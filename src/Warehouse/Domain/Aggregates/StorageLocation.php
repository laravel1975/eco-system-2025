<?php

namespace TmrEcosystem\Warehouse\Domain\Aggregates;

use TmrEcosystem\Warehouse\Domain\Enums\LocationType; // (ควรสร้าง Enum นี้ด้วย)
use Exception;

/**
 * StorageLocation Aggregate
 * เป็นตัวแทนของ "ตำแหน่งจัดเก็บ" ในทางธุรกิจ
 */
class StorageLocation
{
    public function __construct(
        private ?int $dbId,
        private string $uuid,
        private string $warehouseUuid,
        private string $code,
        private string $barcode,
        private string $type, // เก็บเป็น String หรือ Enum
        private ?string $description,
        private bool $isActive
    ) {}

    /**
     * Factory Method: สร้าง Location ใหม่
     * มี Logic การตรวจสอบเบื้องต้น หรือสร้าง Barcode อัตโนมัติได้
     */
    public static function create(
        string $uuid,
        string $warehouseUuid,
        string $code,
        ?string $barcode = null, // ถ้าไม่ส่งมา ใช้ code เป็น barcode
        string $type = 'PICKING',
        ?string $description = null
    ): self {
        // Business Rule: Barcode ต้องมีค่า
        $finalBarcode = $barcode ?? $code;

        return new self(
            dbId: null,
            uuid: $uuid,
            warehouseUuid: $warehouseUuid,
            code: strtoupper(trim($code)), // บังคับตัวใหญ่เสมอ
            barcode: strtoupper(trim($finalBarcode)),
            type: $type,
            description: $description,
            isActive: true
        );
    }

    /**
     * Business Logic: เปลี่ยนประเภทพื้นที่
     */
    public function changeType(string $newType): void
    {
        // Validation: อาจเช็คว่า Type นี้อนุญาตไหม
        $this->type = $newType;
    }

    // --- Getters ---
    public function uuid(): string { return $this->uuid; }
    public function warehouseUuid(): string { return $this->warehouseUuid; }
    public function code(): string { return $this->code; }
    public function barcode(): string { return $this->barcode; }
    public function type(): string { return $this->type; }
    public function description(): ?string { return $this->description; }
    public function isActive(): bool { return $this->isActive; }
}
