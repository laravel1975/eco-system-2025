<?php

namespace TmrEcosystem\Stock\Application\UseCases;

use TmrEcosystem\Stock\Application\DTOs\AdjustStockData;
use TmrEcosystem\Stock\Domain\Aggregates\StockLevel; // (Import POPO)
use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use Exception;

class AdjustStockUseCase
{
    public function __construct(
        protected StockLevelRepositoryInterface $stockRepository
    ) {
    }

    /**
     * @throws Exception
     */
    public function __invoke(AdjustStockData $data): void
    {
        // 1. ✅ ค้นหาด้วย Location
        $stockLevel = $this->stockRepository->findByLocation(
            $data->itemUuid,
            $data->locationUuid,
            $data->companyId
        );

        // 2. ถ้าไม่เคยมี -> สร้างใหม่ (ยอด 0) รอปรับยอด
        if (is_null($stockLevel)) {
            $stockLevel = StockLevel::create(
                uuid: $this->stockRepository->nextUuid(),
                companyId: $data->companyId,
                itemUuid: $data->itemUuid,
                warehouseUuid: $data->warehouseUuid,
                locationUuid: $data->locationUuid // ✅ ระบุ Location
            );
        }

        try {
            // 3. ปรับยอด
            $movement = $stockLevel->adjust(
                newQuantity: $data->newQuantity,
                userId: $data->userId,
                reason: $data->reason
            );

            // 4. บันทึก
            $this->stockRepository->save($stockLevel, [$movement]);

        } catch (Exception $e) {
            if ($e->getMessage() === "No adjustment needed.") {
                return;
            }
            throw $e;
        }
    }
}
