<?php

namespace TmrEcosystem\Maintenance\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_order_id',
        'task_name',
        'description',
        'is_checked',
        'sort_order',
    ];

    protected $casts = [
        'is_checked' => 'boolean',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
