<?php

namespace TmrEcosystem\Maintenance\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;

/**
 * @property int $id
 * @property string $asset_id // (FK ไปยัง Asset Model ที่เราจะสร้างทีหลัง)
 * @property int $requested_by_employee_id // (FK ไปยัง EmployeeProfile)
 * @property string $problem_description
 * @property string $status (pending, approved, rejected)
 * @property int|null $work_order_id // (FK ไปยัง WorkOrder ที่จะถูกสร้าง)
 * @property int $company_id // (สำหรับ Multi-tenancy)
 */
class MaintenanceRequest extends Model
{
    use HasFactory;
    // หากคุณใช้ ULID ให้เพิ่ม: use Illuminate\Database\Eloquent\Concerns\HasUlids;

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

   protected $fillable = [
        'asset_id',
        'requested_by_employee_id',
        'problem_description',
        'status',
        'company_id',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    /**
     * ความสัมพันธ์: ผู้แจ้งซ่อม (พนักงาน)
     */
    public function requester(): BelongsTo
    {
        // เชื่อมโยงไปยัง Bounded Context ของ HRM
        return $this->belongsTo(EmployeeProfile::class, 'requested_by_employee_id');
    }

    /**
     * ความสัมพันธ์: ใบสั่งซ่อม (Work Order) ที่ถูกสร้างจากคำขอนี้
     * (ปรับปรุงเป็น HasOne)
     */
    public function workOrder(): HasOne
    {
        // 'maintenance_request_id' คือ Foreign Key ในตาราง WorkOrder
        return $this->hasOne(WorkOrder::class, 'maintenance_request_id');
    }

    /**
     * (ตัวอย่าง) ความสัมพันธ์: ทรัพย์สินที่แจ้งซ่อม
     * เราจะสร้างโมเดล Asset ในภายหลัง
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }
}
