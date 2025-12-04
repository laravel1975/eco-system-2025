<?php

namespace TmrEcosystem\Warehouse\Application\DTOs;

use Spatie\LaravelData\Data;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\WarehouseModel;

/**
 * DTO สำหรับแสดงผลในหน้า Index (หน้า List)
 */
class WarehouseIndexData extends Data
{
    public function __construct(
        public string $uuid,
        public string $name,
        public string $code,
        public bool $is_active
    ) {
    }

    /**
     * Helper สำหรับสร้าง DTO นี้จาก Eloquent Model
     */
    public static function fromModel(WarehouseModel $model): self
    {
        return new self(
            uuid: $model->uuid,
            name: $model->name,
            code: $model->code,
            is_active: (bool) $model->is_active
        );
    }
}
