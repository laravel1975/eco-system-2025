<?php

namespace TmrEcosystem\Maintenance\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderSparePart extends Model
{
    use HasFactory;

    protected $table = 'work_order_spare_parts';

    protected $fillable = [
        'work_order_id',
        'spare_part_id',
        'quantity_used',
        'unit_cost_at_time',
    ];

    protected $casts = [
        'quantity_used' => 'integer',
        'unit_cost_at_time' => 'decimal:2',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function sparePart(): BelongsTo
    {
        return $this->belongsTo(SparePart::class);
    }
}
