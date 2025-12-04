<?php

namespace TmrEcosystem\Stock\Application\UseCases;

use TmrEcosystem\Stock\Application\DTOs\ReceiveStockData;
use TmrEcosystem\Stock\Domain\Aggregates\StockLevel; // (Import POPO)
use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use Exception;

class ReceiveStockUseCase
{
    public function __construct(
        protected StockLevelRepositoryInterface $stockRepository
    ) {
    }

    /**
     * @throws Exception
     */
    public function __invoke(ReceiveStockData $data): void
    {
        if ($data->quantity <= 0) {
            throw new Exception("Quantity to receive must be positive.");
        }

        // 1. ✅ ค้นหาด้วย Location (เจาะจงพิกัด)
        $stockLevel = $this->stockRepository->findByLocation(
            $data->itemUuid,
            $data->locationUuid,
            $data->companyId
        );

        // 2. ถ้ายังไม่มี Stock ใน Location นี้ -> สร้างใหม่
        if (is_null($stockLevel)) {
            $stockLevel = StockLevel::create(
                uuid: $this->stockRepository->nextUuid(),
                companyId: $data->companyId,
                itemUuid: $data->itemUuid,
                warehouseUuid: $data->warehouseUuid,
                locationUuid: $data->locationUuid // ✅ ระบุ Location
            );
        }

        // 3. ทำรายการรับเข้า
        $movement = $stockLevel->receive(
            quantityToReceive: $data->quantity,
            userId: $data->userId,
            reference: $data->reference
        );

        // 4. บันทึก
        $this->stockRepository->save($stockLevel, [$movement]);
    }
}
