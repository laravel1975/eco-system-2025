<?php

namespace TmrEcosystem\Inventory\Application\DTOs;

use Spatie\LaravelData\Data;
use TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\Models\ItemModel;
use Illuminate\Support\Facades\Storage;

class ItemIndexData extends Data
{
    public function __construct(
        public string $uuid,
        public string $part_number,
        public string $name,
        public string $uom,
        public string $category,
        public array $images // ✅ เปลี่ยนเป็น Array เพื่อรองรับหลายรูป
    ) {
    }

    public static function fromModel(ItemModel $model): self
    {
        // ✅ ดึง URL ของทุกรูปออกมาเป็น Array
        // เรียงลำดับ: ให้รูป Primary ขึ้นก่อน, ตามด้วยรูปอื่นๆ ตาม sort_order
        $imageUrls = $model->images
            ->sortBy([['is_primary', 'desc'], ['sort_order', 'asc']])
            ->map(function ($img) {
                return asset('storage/' . $img->path);
            })
            ->values()
            ->toArray();

        return new self(
            uuid: $model->uuid,
            part_number: $model->part_number,
            name: $model->name,
            uom: $model->uom ? $model->uom->symbol : 'N/A',
            category: $model->category ? $model->category->name : 'Uncategorized',
            images: $imageUrls // ✅ ส่ง Array กลับไป
        );
    }
}
