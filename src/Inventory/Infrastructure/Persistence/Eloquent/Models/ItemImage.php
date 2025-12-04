<?php

namespace TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemImage extends Model
{
    protected $table = 'inventory_item_images';

    protected $fillable = [
        'item_uuid',
        'path',
        'original_name',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(ItemModel::class, 'item_uuid', 'uuid');
    }

    // Accessor: สร้าง Full URL ให้ Frontend ใช้ง่ายๆ
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }
}
