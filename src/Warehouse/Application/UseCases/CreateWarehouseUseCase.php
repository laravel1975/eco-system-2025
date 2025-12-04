<?php

namespace TmrEcosystem\Warehouse\Application\UseCases;

use TmrEcosystem\Warehouse\Application\DTOs\WarehouseData;
use TmrEcosystem\Warehouse\Domain\Aggregates\Warehouse;
use TmrEcosystem\Warehouse\Domain\Exceptions\WarehouseCodeAlreadyExistsException;
use TmrEcosystem\Warehouse\Domain\Repositories\WarehouseRepositoryInterface;

class CreateWarehouseUseCase
{
    public function __construct(
        protected WarehouseRepositoryInterface $warehouseRepository
    ) {
    }

    /**
     * @throws WarehouseCodeAlreadyExistsException
     */
    public function __invoke(WarehouseData $data): Warehouse
    {
        // (1) Business Logic: เช็ก Code ซ้ำ
        $existing = $this->warehouseRepository->findByCode($data->code, $data->companyId);

        if ($existing) {
            throw new WarehouseCodeAlreadyExistsException(
                "Warehouse code '{$data->code}' already exists for this company."
            );
        }

        // (2) สร้าง UUID
        $uuid = $this->warehouseRepository->nextUuid();

        // (3) สร้าง Domain Aggregate (POPO)
        $warehouse = Warehouse::create(
            uuid: $uuid,
            companyId: $data->companyId,
            name: $data->name,
            code: $data->code,
            isActive: $data->isActive,
            description: $data->description
        );

        // (4) สั่งบันทึก
        $this->warehouseRepository->save($warehouse);

        // (5) คืนค่า POPO
        return $warehouse;
    }
}
