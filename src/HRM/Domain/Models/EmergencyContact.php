<?php

namespace TmrEcosystem\HRM\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyContact extends Model
{
    /**
     * (สำคัญ) ระบุ field ที่กรอกจากฟอร์มได้
     */
    protected $fillable = [
        'employee_profile_id',
        'name',
        'relationship',
        'phone_number',
    ];

    /**
     * ความสัมพันธ์ (เจ้านาย)
     */
    public function employeeProfile()
    {
        return $this->belongsTo(EmployeeProfile::class);
    }
}
