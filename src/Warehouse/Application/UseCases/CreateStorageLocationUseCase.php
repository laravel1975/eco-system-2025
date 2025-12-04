<?php

namespace TmrEcosystem\Warehouse\Application\UseCases;

use Exception;
use TmrEcosystem\Warehouse\Application\DTOs\CreateLocationData;
use TmrEcosystem\Warehouse\Domain\Aggregates\StorageLocation;
use TmrEcosystem\Warehouse\Domain\Repositories\StorageLocationRepositoryInterface;

class CreateStorageLocationUseCase
{
    public function __construct(
        private StorageLocationRepositoryInterface $repository
    ) {}

    public function __invoke(CreateLocationData $data): StorageLocation
    {
        // 1. Validate Business Rule: ชื่อ Code ห้ามซ้ำในคลังเดียวกัน
        $existing = $this->repository->findByCode($data->warehouseUuid, $data->code);
        if ($existing) {
            throw new Exception("Location code '{$data->code}' already exists in this warehouse.");
        }

        // 2. Create Aggregate
        $location = StorageLocation::create(
            uuid: $this->repository->nextUuid(),
            warehouseUuid: $data->warehouseUuid,
            code: $data->code,
            barcode: $data->barcode,
            type: $data->type,
            description: $data->description
        );

        // 3. Persist
        $this->repository->save($location);

        return $location;
    }
}
