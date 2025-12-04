<?php

namespace TmrEcosystem\Maintenance\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenancePlanTask extends Model
{
    use HasFactory;

    // (ไม่ต้องใช้ CompanyScope เพราะผูกกับ MaintenancePlan ที่มี Scope อยู่แล้ว)

    protected $fillable = [
        'maintenance_plan_id',
        'task_name',
        'description',
        'sort_order',
    ];

    public function maintenancePlan(): BelongsTo
    {
        return $this->belongsTo(MaintenancePlan::class);
    }
}
