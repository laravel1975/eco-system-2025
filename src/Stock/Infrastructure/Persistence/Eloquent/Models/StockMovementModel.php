<?php

namespace TmrEcosystem\Stock\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use TmrEcosystem\IAM\Domain\Models\User;

class StockMovementModel extends Model
{
    // (Movement ไม่ควรถูก Soft Delete)
    use HasFactory, HasUuids;

    /**
     * ชื่อตาราง
     */
    protected $table = 'stock_movements';

    /**
     * (Movement สร้างแล้วห้ามแก้ เราจึงปิด updated_at)
     */
    public const UPDATED_AT = null;

    /**
     * $fillable: Fields ที่อนุญาตให้กรอก (ต้องตรงกับ Migration)
     */
    protected $fillable = [
        'uuid',
        'stock_level_uuid',
        'user_id',
        'type',
        'quantity_change',
        'quantity_after_move',
        'reference',
        'notes',
    ];

    /**
     * $casts: แปลง Types
     */
    protected function casts(): array
    {
        return [
            'quantity_change' => 'decimal:4',
            'quantity_after_move' => 'decimal:4',
        ];
    }

    /**
     * ระบุคอลัมน์ UUID
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    /**
     * Relationships
     */
    public function stockLevel()
    {
        return $this->belongsTo(StockLevelModel::class, 'stock_level_uuid', 'uuid');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
