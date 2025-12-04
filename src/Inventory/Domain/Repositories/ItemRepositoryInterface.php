<?php

namespace TmrEcosystem\Inventory\Domain\Repositories;

use Illuminate\Pagination\LengthAwarePaginator;
use TmrEcosystem\Inventory\Domain\Aggregates\Item;

interface ItemRepositoryInterface
{
    /**
     * สร้าง UUID ใหม่ (Repository เป็นคนจัดการเรื่องนี้)
     */
    public function nextUuid(): string;

    /**
     * ตรวจสอบว่า Part Number นี้มีอยู่แล้วใน Company นี้หรือไม่
     * (นี่คือ Business Rule ที่สำคัญ)
     */
    public function partNumberExists(string $partNumber, string $companyId): bool;

    /**
     * บันทึก Domain Aggregate (ทั้งสร้างใหม่และอัปเดต)
     */
    public function save(Item $item): void;

    /**
     * ค้นหาด้วย UUID
     */
    public function findByUuid(string $uuid): ?Item;

    // (เพิ่มเมธอดค้นหาอื่นๆ ที่จำเป็นในอนาคต)
    // public function findByPartNumber(string $partNumber, string $companyId): ?Item;

    /**
     * (เมธอดใหม่) ดึงข้อมูลแบบแบ่งหน้าสำหรับหน้า List
     *
     * @param string $companyId
     * @param array $filters (เช่น ['search' => '...'])
     * @return LengthAwarePaginator (ที่บรรจุ ItemIndexData DTOs)
     */
    public function getPaginatedList(string $companyId, array $filters = []): LengthAwarePaginator;

    /**
     * (เมธอดใหม่) ค้นหา Item ด้วย Part Number ภายใน Company
     * (จำเป็นสำหรับ Use Case การอัปเดต)
     *
     * @param string $partNumber
     * @param string $companyId
     * @return Item|null (คืนค่า POPO)
     */
    public function findByPartNumber(string $partNumber, string $companyId): ?Item;

    /**
     * (เมธอดใหม่) ลบ Item (Soft Delete)
     *
     * @param Item $item (รับ POPO ที่จะลบ)
     * @return void
     */
    public function delete(Item $item): void;
}
