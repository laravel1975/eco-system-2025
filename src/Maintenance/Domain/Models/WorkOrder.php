<?php

namespace TmrEcosystem\Maintenance\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $work_order_code // (เช่น WO-2025-0001)
 * @property string $asset_id // (FK ไปยัง Asset Model)
 * @property int $maintenance_type_id // (FK ไปยัง MaintenanceType เช่น 'Corrective')
 * @property string $status (open, assigned, in_progress, completed, closed)
 * @property string $priority (low, medium, high)
 * @property string $description
 * @property int $company_id
 */
class WorkOrder extends Model
{
    use HasFactory;

    // (1. [ลบ] const สถานะเก่า)
    // const STATUS_OPEN = 'open';
    // const STATUS_ASSIGNED = 'assigned';
    // const STATUS_IN_PROGRESS = 'in_progress';
    // const STATUS_COMPLETED = 'completed';
    // const STATUS_CLOSED = 'closed';

    // (2. [แก้ไข] อัปเกรด Priority Constants (Logic #3))
    const PRIORITY_EMERGENCY = 'P1';
    const PRIORITY_URGENT    = 'P2';
    const PRIORITY_NORMAL    = 'P3';
    const PRIORITY_LOW       = 'P4';

    // (3. [ใหม่] เพิ่ม Work Nature Constants (Logic #2))
    const NATURE_INTERNAL = 'Internal';
    const NATURE_EXTERNAL = 'External';
    const NATURE_MIXED    = 'Mixed';

    protected $fillable = [
        'work_order_code',
        'asset_id',
        'maintenance_type_id',
        'maintenance_request_id', // (Optional) เชื่อมกลับไปยัง Request ต้นทาง
        'status',
        'priority',
        'work_nature',
        'description',
        'company_id',
        'failure_code_id',
        'activity_type_id',
        'downtime_hours',
        // (5. [ลบ] ลบ 'actual_labor_hours' ออกจาก fillable นี้)
        // 'actual_labor_hours',
    ];

    protected $casts = [
        'status' => 'string',
        'priority' => 'string',
        'work_nature' => 'string',
    ];

    /**
     * ความสัมพันธ์: คำขอแจ้งซ่อม (Request) ที่เป็นต้นทาง
     * (ปรับปรุงเป็น BelongsTo)
     */
    public function maintenanceRequest(): BelongsTo
    {
        return $this->belongsTo(MaintenanceRequest::class, 'maintenance_request_id');
    }

    /**
     * ความสัมพันธ์: ประเภทงานซ่อม (CM, PM)
     */
    public function maintenanceType(): BelongsTo
    {
        return $this->belongsTo(MaintenanceType::class, 'maintenance_type_id');
    }

    /**
     * ความสัมพันธ์: สาเหตุการเสีย (RCA)
     */
    public function failureCode(): BelongsTo
    {
        return $this->belongsTo(FailureCode::class);
    }

    /**
     * ความสัมพันธ์: ประเภทกิจกรรมที่ทำ
     */
    public function activityType(): BelongsTo
    {
        return $this->belongsTo(ActivityType::class);
    }

    /**
     * ความสัมพันธ์: รายการงานย่อย (Checklist)
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(MaintenanceTask::class, 'work_order_id');
    }

    /**
     * ความสัมพันธ์: ทรัพย์สินที่ซ่อม
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    /**
     * (อัปเดตจากของเดิม) ความสัมพันธ์: ผู้รับผิดชอบงาน
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(MaintenanceAssignment::class, 'work_order_id');
    }

    /**
     * (เพิ่มใหม่) ความสัมพันธ์: ไฟล์แนบ
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(WorkOrderAttachment::class, 'work_order_id');
    }

    /**
     * (เพิ่มใหม่) ความสัมพันธ์: อะไหล่ที่ใช้ไป
     */
    public function sparePartsUsed(): HasMany
    {
        return $this->hasMany(WorkOrderSparePart::class, 'work_order_id');
    }
}
