<?php

namespace TmrEcosystem\Warehouse\Domain\Repositories;

use TmrEcosystem\Warehouse\Domain\Aggregates\Warehouse;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * "สัญญา" (Interface) สำหรับ Warehouse Repository
 */
interface WarehouseRepositoryInterface
{
    /**
     * สร้าง UUID ใหม่
     */
    public function nextUuid(): string;

    /**
     * บันทึก Aggregate (ทั้งสร้างใหม่และอัปเดต)
     */
    public function save(Warehouse $warehouse): void;

    /**
     * ค้นหาด้วย UUID
     */
    public function findByUuid(string $uuid): ?Warehouse;

    /**
     * ค้นหาด้วย Code (สำหรับเช็กซ้ำ)
     */
    public function findByCode(string $code, string $companyId): ?Warehouse;

    /**
     * ดึงข้อมูลแบบแบ่งหน้า (สำหรับหน้า List)
     */
    public function getPaginatedList(string $companyId, array $filters = []): LengthAwarePaginator;

    /**
     * ลบ Aggregate
     */
    public function delete(Warehouse $warehouse): void;
}
