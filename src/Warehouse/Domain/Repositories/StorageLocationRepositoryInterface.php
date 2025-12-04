<?php

namespace TmrEcosystem\Warehouse\Domain\Repositories;

use TmrEcosystem\Warehouse\Domain\Aggregates\StorageLocation;

interface StorageLocationRepositoryInterface
{
    public function nextUuid(): string;
    public function save(StorageLocation $location): void;

    // ค้นหาเพื่อตรวจสอบ Business Rule (ห้ามซ้ำ)
    public function findByCode(string $warehouseUuid, string $code): ?StorageLocation;

    // ค้นหาด้วย UUID
    public function findByUuid(string $uuid): ?StorageLocation;

    // ค้นหาด้วย Barcode (สำหรับหน้างานตอนยิง)
    public function findByBarcode(string $warehouseUuid, string $barcode): ?StorageLocation;
}
