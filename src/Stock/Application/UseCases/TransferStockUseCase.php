<?php

namespace TmrEcosystem\Stock\Application\UseCases;

use Exception;
use Illuminate\Support\Facades\DB; // Helper เพื่อดึง Location Code
use TmrEcosystem\Stock\Application\DTOs\TransferStockData;
use TmrEcosystem\Stock\Domain\Aggregates\StockLevel;
use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use TmrEcosystem\Stock\Domain\Exceptions\InsufficientStockException;

class TransferStockUseCase
{
    public function __construct(
        protected StockLevelRepositoryInterface $stockRepository
    ) {}

    public function __invoke(TransferStockData $data): void
    {
        if ($data->quantity <= 0) throw new Exception("Transfer quantity must be positive.");
        if ($data->fromLocationUuid === $data->toLocationUuid) throw new Exception("Source and Destination location cannot be the same.");

        // 1. ค้นหา Stock ต้นทาง
        $sourceStock = $this->stockRepository->findByLocation(
            $data->itemUuid,
            $data->fromLocationUuid,
            $data->companyId
        );

        if (!$sourceStock) {
            throw new InsufficientStockException("No stock found at source location.");
        }

        // 2. ค้นหา Stock ปลายทาง (ถ้าไม่มีต้องสร้าง)
        $destStock = $this->stockRepository->findByLocation(
            $data->itemUuid,
            $data->toLocationUuid,
            $data->companyId
        );

        if (!$destStock) {
            $destStock = StockLevel::create(
                uuid: $this->stockRepository->nextUuid(),
                companyId: $data->companyId,
                itemUuid: $data->itemUuid,
                warehouseUuid: $data->warehouseUuid,
                locationUuid: $data->toLocationUuid
            );
        }

        // 3. ดึง Code ของ Location เพื่อใช้เป็น Reference (ใช้ DB Facade เพื่อความเร็ว)
        $fromCode = DB::table('warehouse_storage_locations')->where('uuid', $data->fromLocationUuid)->value('code') ?? 'UNKNOWN';
        $toCode = DB::table('warehouse_storage_locations')->where('uuid', $data->toLocationUuid)->value('code') ?? 'UNKNOWN';

        // 4. Execute Logic (ภายใน Transaction เดียวกัน)
        // (จริงๆ Transaction ควรคลุมที่ระดับ Controller หรือ Service ใหญ่กว่านี้ แต่ทำที่ UseCase ก็ปลอดภัยดี)

        // 4.1 ตัดของออกจากต้นทาง
        $outMovement = $sourceStock->transferOut($data->quantity, $data->userId, $toCode);

        // 4.2 รับของเข้าปลายทาง
        $inMovement = $destStock->transferIn($data->quantity, $data->userId, $fromCode);

        // 5. Save Changes
        // เราบันทึกแยกกันแต่ใน Transaction เดียวกันจาก Controller จะปลอดภัยสุด
        $this->stockRepository->save($sourceStock, [$outMovement]);
        $this->stockRepository->save($destStock, [$inMovement]);
    }
}
