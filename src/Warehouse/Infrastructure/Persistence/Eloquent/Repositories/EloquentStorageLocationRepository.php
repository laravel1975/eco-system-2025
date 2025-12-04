<?php

namespace TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Repositories;

use Illuminate\Support\Str;
use TmrEcosystem\Warehouse\Domain\Aggregates\StorageLocation;
use TmrEcosystem\Warehouse\Domain\Repositories\StorageLocationRepositoryInterface;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\StorageLocationModel;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\StorageLocationMapper;

class EloquentStorageLocationRepository implements StorageLocationRepositoryInterface
{
    public function nextUuid(): string
    {
        return (string) Str::uuid();
    }

    public function save(StorageLocation $location): void
    {
        $data = StorageLocationMapper::toPersistence($location);

        StorageLocationModel::updateOrCreate(
            ['uuid' => $location->uuid()],
            $data
        );
    }

    public function findByCode(string $warehouseUuid, string $code): ?StorageLocation
    {
        $model = StorageLocationModel::where('warehouse_uuid', $warehouseUuid)
            ->where('code', $code)
            ->first();

        return $model ? StorageLocationMapper::toDomain($model) : null;
    }

    public function findByUuid(string $uuid): ?StorageLocation
    {
        $model = StorageLocationModel::where('uuid', $uuid)->first();
        return $model ? StorageLocationMapper::toDomain($model) : null;
    }

    public function findByBarcode(string $warehouseUuid, string $barcode): ?StorageLocation
    {
        $model = StorageLocationModel::where('warehouse_uuid', $warehouseUuid)
            ->where('barcode', $barcode)
            ->first();

        return $model ? StorageLocationMapper::toDomain($model) : null;
    }
}
