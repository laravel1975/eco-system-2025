<?php

namespace TmrEcosystem\HRM\Domain\Models;

use App\Models\Company;
use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;
use TmrEcosystem\IAM\Domain\Models\User; // (IAM Context)

class OvertimeRequest extends Model
{
    protected $fillable = [
        'company_id',
        'employee_profile_id',
        'attendance_id',
        'date',
        'start_time',
        'end_time',
        'total_hours',
        'ot_type',
        'reason',
        'status',
        'approved_by_user_id',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'total_hours' => 'decimal:2',
    ];

    // (ใช้ Global Scope)
    protected static function booted(): void
    {
        static::addGlobalScope(new CompanyScope);
    }

    // --- Relationships ---

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function employeeProfile()
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }

    public function approver()
    {
        // (ผู้อนุมัติ)
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}
