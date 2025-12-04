<?php

namespace TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent;

use TmrEcosystem\Warehouse\Domain\Aggregates\Warehouse as WarehouseAggregate;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\WarehouseModel;

class WarehouseMapper
{
    /**
     * แปลงจาก Eloquent Model (DB) -> Domain Aggregate (POPO)
     */
    public static function toDomain(WarehouseModel $model): WarehouseAggregate
    {
        return new WarehouseAggregate(
            dbId: $model->id, // (Migration ของเรามี 'id' เป็น PK)
            uuid: $model->uuid,
            companyId: $model->company_id,
            name: $model->name,
            code: $model->code,
            isActive: (bool) $model->is_active,
            description: $model->description
        );
    }

    /**
     * แปลงจาก Domain (POPO) -> Array (สำหรับบันทึกลง DB)
     */
    public static function toPersistence(WarehouseAggregate $warehouse): array
    {
        return [
            'uuid' => $warehouse->uuid(),
            'company_id' => $warehouse->companyId(),
            'name' => $warehouse->name(),
            'code' => $warehouse->code(),
            'is_active' => $warehouse->isActive(),
            'description' => $warehouse->description(),
        ];
    }
}
