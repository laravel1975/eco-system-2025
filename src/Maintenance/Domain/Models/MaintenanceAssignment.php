<?php

namespace TmrEcosystem\Maintenance\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile; // (เชื่อมไป HRM)

class MaintenanceAssignment extends Model
{
    use HasFactory;

    // (ไม่ต้องใช้ CompanyScope เพราะผูกกับ WorkOrder ที่มี Scope อยู่แล้ว)

    protected $fillable = [
        'work_order_id',
        'assignable_type',
        'assignable_id',
        'estimated_hours',
        'actual_hours',
        'actual_labor_hours',
        'recorded_hourly_rate',
        'labor_cost',
    ];

    protected $casts = [
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * (7. [ลบ] Relation เก่า)
     */
    // public function technician(): BelongsTo
    // {
    //     return $this->belongsTo(EmployeeProfile::class, 'employee_id');
    // }

    /**
     * (6. [ใหม่] สร้าง Polymorphic Relation)
     * (สามารถเป็น EmployeeProfile หรือ Contractor)
     */
    public function assignable(): MorphTo
    {
        return $this->morphTo();
    }
}
