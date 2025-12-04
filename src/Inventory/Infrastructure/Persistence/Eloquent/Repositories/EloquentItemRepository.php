<?php

namespace TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\Repositories;


use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use TmrEcosystem\Inventory\Application\DTOs\ItemIndexData;
use TmrEcosystem\Inventory\Domain\Aggregates\Item as ItemAggregate;
use TmrEcosystem\Inventory\Domain\Repositories\ItemRepositoryInterface;
use TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\ItemMapper;
use TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\Models\ItemModel;

class EloquentItemRepository implements ItemRepositoryInterface
{
    public function nextUuid(): string
    {
        return (string) Str::uuid();
    }

    public function partNumberExists(string $partNumber, string $companyId): bool
    {
        // (เช็กกับ Eloquent Model โดยตรง)
        return ItemModel::where('part_number', $partNumber)
            ->where('company_id', $companyId)
            ->exists();
    }

    public function save(ItemAggregate $item): void
    {
        // (ใช้ Mapper แปลง POPO -> Array)
        $data = ItemMapper::toPersistence($item);

        // (ใช้ updateOrCreate เพื่อจัดการทั้งสร้างใหม่และอัปเดต)
        ItemModel::updateOrCreate(
            ['uuid' => $item->uuid()], // ค้นหาด้วย UUID
            $data                    // ข้อมูลที่จะบันทึก
        );
    }

    public function findByUuid(string $uuid): ?ItemAggregate
    {
        $model = ItemModel::find($uuid); // (PK คือ UUID)

        if (!$model) {
            return null;
        }

        // (ใช้ Mapper แปลง Eloquent -> POPO)
        return ItemMapper::toDomain($model);
    }

    /**
     * (เมธอดใหม่) ดึงข้อมูลแบบแบ่งหน้าสำหรับหน้า List
     */
    /**
     * ดึงข้อมูลแบบแบ่งหน้า พร้อม Filter และ Sorting
     */
    public function getPaginatedList(string $companyId, array $filters = []): LengthAwarePaginator
    {
        // 1. เริ่ม Query และ Eager Load Relations
        $query = ItemModel::query()
            ->with(['category', 'uom', 'images']) // ✅ โหลดข้อมูลสัมพันธ์มารอไว้เลย
            ->where('inventory_items.company_id', $companyId); // ✅ ระบุ Table ชัดเจนกันสับสน

        // 2. Filter: Search (ค้นหาจาก Part No หรือ Name)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('inventory_items.part_number', 'like', "%{$search}%")
                  ->orWhere('inventory_items.name', 'like', "%{$search}%");
            });
        }

        // 3. ✅ Filter: Category (กรองตามชื่อหมวดหมู่)
        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            // ใช้ whereHas เพื่อเช็คเงื่อนไขในตารางลูก (Categories)
            $query->whereHas('category', function ($q) use ($filters) {
                $q->where('name', $filters['category']);
            });
        }

        // 4. ✅ Sorting (จัดเรียงข้อมูล)
        $sort = $filters['sort'] ?? 'created_at';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        switch ($sort) {
            case 'part_number':
            case 'name':
            case 'created_at':
                // เรียงตามคอลัมน์ปกติของ Items
                $query->orderBy("inventory_items.{$sort}", $direction);
                break;

            case 'category':
                // ✅ เรียงตามชื่อหมวดหมู่ (ต้อง Join Table)
                $query->select('inventory_items.*') // เลือกเฉพาะข้อมูล Item กลับมา (ไม่เอาข้อมูลจากตาราง Join)
                      ->leftJoin('inventory_categories', 'inventory_items.category_id', '=', 'inventory_categories.id')
                      ->orderBy('inventory_categories.name', $direction);
                break;

            default:
                // Default Sort
                $query->orderBy('inventory_items.created_at', 'desc');
                break;
        }

        // 5. ดึงข้อมูลแบบแบ่งหน้า
        $paginatedModels = $query->paginate(15)->withQueryString();

        // 6. แปลง Model -> DTO
        // (ItemIndexData จะจัดการดึงชื่อ Category ออกมาแสดง)
        $paginatedModels->setCollection(
            $paginatedModels->getCollection()->map(function (ItemModel $model) {
                return ItemIndexData::fromModel($model);
            })
        );

        return $paginatedModels;
    }

    /**
     * (Implement เมธอดใหม่)
     * ค้นหาด้วย Part Number และ Company ID
     */
    public function findByPartNumber(string $partNumber, string $companyId): ?ItemAggregate
    {
        // 1. ค้นหา Eloquent Model
        $model = ItemModel::where('part_number', $partNumber)
                        ->where('company_id', $companyId)
                        ->first();

        if (is_null($model)) {
            return null;
        }

        // 2. แปลง Eloquent -> POPO
        return ItemMapper::toDomain($model);
    }

    /**
     * (Implement เมธอดใหม่)
     * เราจะค้นหา Model ด้วย UUID ของ POPO แล้วสั่ง delete
     */
    public function delete(ItemAggregate $item): void
    {
        // เราใช้ UUID เป็น Primary Key ตาม Migration
        $model = ItemModel::find($item->uuid());

        if ($model) {
            // (นี่คือ Soft Delete เพราะ ItemModel ของเราใช้ SoftDeletes Trait)
            $model->delete();
        }
    }
}
