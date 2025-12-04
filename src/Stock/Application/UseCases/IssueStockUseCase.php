<?php

namespace TmrEcosystem\Stock\Application\UseCases;

use TmrEcosystem\Stock\Application\DTOs\IssueStockData;
use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use TmrEcosystem\Stock\Domain\Exceptions\InsufficientStockException;
use Exception;

class IssueStockUseCase
{
    // "ขอ" Interface (Domain)
    public function __construct(
        protected StockLevelRepositoryInterface $stockRepository
    ) {
    }

    /**
     * ทำให้เป็น Invokable
     * @throws InsufficientStockException | Exception
     */
    public function __invoke(IssueStockData $data): void
    {
        if ($data->quantity <= 0) {
            throw new Exception("Quantity to issue must be positive.");
        }

        // 1. ✅ ค้นหาจาก Location ที่ระบุ
        $stockLevel = $this->stockRepository->findByLocation(
            $data->itemUuid,
            $data->locationUuid,
            $data->companyId
        );

        // 2. ถ้าไม่มี Record แปลว่าไม่มีของใน Location นี้เลย
        if (is_null($stockLevel)) {
            throw new InsufficientStockException("No stock record found at this location.");
        }

        // 3. ตัดของออก (Domain จะเช็คเองว่าพอไหม)
        $movement = $stockLevel->issue(
            quantityToIssue: $data->quantity,
            userId: $data->userId,
            reference: $data->reference
        );

        // 4. บันทึก
        $this->stockRepository->save($stockLevel, [$movement]);
    }
}
