<?php

namespace TmrEcosystem\Warehouse\Domain\Aggregates;

/**
 * นี่คือ Domain Aggregate (POPO) ที่บริสุทธิ์สำหรับ Warehouse
 * ไม่รู้จักฐานข้อมูล, ไม่ extends อะไรทั้งสิ้น
 */
class Warehouse
{
    /**
     * @param int|null $dbId (ID ฐานข้อมูล)
     * @param string $uuid (Domain ID)
     * @param string $companyId (Tenant ID)
     * @param string $name
     * @param string $code
     * @param bool $isActive
     * @param string|null $description
     */
    public function __construct(
        private ?int $dbId,
        private string $uuid,
        private string $companyId,
        private string $name,
        private string $code,
        private bool $isActive,
        private ?string $description
    ) {
        // (สามารถเพิ่ม Invariants (กฎ) ที่นี่ได้)
        // if (empty($name)) { ... }
    }

    /**
     * Factory Method สำหรับ "สร้าง" Warehouse ใหม่
     */
    public static function create(
        string $uuid,
        string $companyId,
        string $name,
        string $code,
        bool $isActive,
        ?string $description
    ): self {
        return new self(
            dbId: null, // ยังไม่มี ID ฐานข้อมูล
            uuid: $uuid,
            companyId: $companyId,
            name: $name,
            code: $code,
            isActive: $isActive,
            description: $description
        );
    }

    /**
     * Business Logic สำหรับการอัปเดต
     */
    public function updateDetails(
        string $name,
        string $code,
        bool $isActive,
        ?string $description
    ): void {
        $this->name = $name;
        $this->code = $code;
        $this->isActive = $isActive;
        $this->description = $description;
    }

    // --- Getters ---
    public function dbId(): ?int { return $this->dbId; }
    public function uuid(): string { return $this->uuid; }
    public function companyId(): string { return $this->companyId; }
    public function name(): string { return $this->name; }
    public function code(): string { return $this->code; }
    public function isActive(): bool { return $this->isActive; }
    public function description(): ?string { return $this->description; }
}
