<?php

namespace TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Repositories;

use Illuminate\Support\Str;
use Illuminate\Pagination\LengthAwarePaginator;
// (Domain)
use TmrEcosystem\Warehouse\Domain\Aggregates\Warehouse as WarehouseAggregate;
use TmrEcosystem\Warehouse\Domain\Repositories\WarehouseRepositoryInterface;
// (Infrastructure)
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\WarehouseModel;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\WarehouseMapper;
// (Application)
use TmrEcosystem\Warehouse\Application\DTOs\WarehouseIndexData;

class EloquentWarehouseRepository implements WarehouseRepositoryInterface
{
    public function nextUuid(): string
    {
        return (string) Str::uuid();
    }

    public function save(WarehouseAggregate $warehouse): void
    {
        // 1. แปลง POPO -> Array
        $data = WarehouseMapper::toPersistence($warehouse);

        // 2. บันทึก (สร้างใหม่ หรือ อัปเดต)
        WarehouseModel::updateOrCreate(
            ['uuid' => $warehouse->uuid()], // ค้นหาด้วย UUID
            $data                         // ข้อมูลที่จะบันทึก
        );
    }

    public function findByUuid(string $uuid): ?WarehouseAggregate
    {
        // (Migration เราใช้ id เป็น PK แต่ uuid เป็น unique)
        $model = WarehouseModel::where('uuid', $uuid)->first();

        if (is_null($model)) {
            return null;
        }

        // แปลง Eloquent -> POPO
        return WarehouseMapper::toDomain($model);
    }

    public function findByCode(string $code, string $companyId): ?WarehouseAggregate
    {
        $model = WarehouseModel::where('code', $code)
                        ->where('company_id', $companyId)
                        ->first();

        if (is_null($model)) {
            return null;
        }

        // แปลง Eloquent -> POPO
        return WarehouseMapper::toDomain($model);
    }

    public function getPaginatedList(string $companyId, array $filters = []): LengthAwarePaginator
    {
        $query = WarehouseModel::query()
            ->where('company_id', $companyId)
            ->orderBy('code', 'asc');

        // (ตัวอย่าง Filter)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // (ดึงข้อมูลแบบแบ่งหน้า)
        $paginatedModels = $query->paginate(15)->withQueryString();

        // (สำคัญ) "แปล" Eloquent Models ไปเป็น DTOs (Read Path)
        $paginatedModels->setCollection(
            $paginatedModels->getCollection()->map(function (WarehouseModel $model) {
                return WarehouseIndexData::fromModel($model);
            })
        );

        return $paginatedModels;
    }

    public function delete(WarehouseAggregate $warehouse): void
    {
        // (Migration เราใช้ id เป็น PK, uuid เป็น unique)
        $model = WarehouseModel::where('uuid', $warehouse->uuid())->first();

        if ($model) {
            $model->delete(); // (Soft Delete)
        }
    }
}
