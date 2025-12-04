<?php

namespace TmrEcosystem\Stock\Infrastructure\Persistence\Eloquent;

use TmrEcosystem\Stock\Domain\Aggregates\StockLevel as StockLevelAggregate;
use TmrEcosystem\Stock\Domain\Aggregates\StockMovement as StockMovementAggregate;
use TmrEcosystem\Stock\Infrastructure\Persistence\Eloquent\Models\StockLevelModel;
use TmrEcosystem\Stock\Infrastructure\Persistence\Eloquent\Models\StockMovementModel;

class StockLevelMapper
{
    public static function toDomain(StockLevelModel $model): StockLevelAggregate
    {
        return new StockLevelAggregate(
            dbId: $model->id,
            uuid: $model->uuid,
            companyId: $model->company_id,
            itemUuid: $model->item_uuid,
            warehouseUuid: $model->warehouse_uuid,
            locationUuid: $model->location_uuid,
            quantityOnHand: (float) $model->quantity_on_hand,
            quantityReserved: (float) $model->quantity_reserved,
            quantitySoftReserved: (float) ($model->quantity_soft_reserved ?? 0) // ✅ เพิ่ม Mapping
        );
    }

    public static function toPersistence(StockLevelAggregate $stockLevel): array
    {
        return [
            'uuid' => $stockLevel->uuid(),
            'company_id' => $stockLevel->companyId(),
            'item_uuid' => $stockLevel->itemUuid(),
            'warehouse_uuid' => $stockLevel->warehouseUuid(),
            'location_uuid' => $stockLevel->locationUuid(),
            'quantity_on_hand' => $stockLevel->getQuantityOnHand(),
            'quantity_reserved' => $stockLevel->getQuantityReserved(),
            'quantity_soft_reserved' => $stockLevel->getQuantitySoftReserved(), // ✅ เพิ่ม Mapping
        ];
    }

    public static function movementToPersistence(StockMovementAggregate $movement): StockMovementModel
    {
        // ใช้ Reflection เพื่อเข้าถึง Private Properties ของ POPO (หรือใช้ Getter ถ้ามี)
        $reflection = new \ReflectionObject($movement);

        // Helper function to get property value
        $getVal = fn($name) => $reflection->getProperty($name)->getValue($movement);

        return new StockMovementModel([
            'uuid' => $getVal('uuid'),
            'stock_level_uuid' => $getVal('stockLevelUuid'),
            'user_id' => $getVal('userId'),
            'type' => $getVal('type'),
            'quantity_change' => $getVal('quantityChange'),
            'quantity_after_move' => $getVal('quantityAfterMove'),
            'reference' => $getVal('reference'),
        ]);
    }
}
