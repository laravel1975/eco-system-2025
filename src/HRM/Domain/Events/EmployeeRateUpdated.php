<?php

namespace TmrEcosystem\HRM\Domain\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile; // (Import Model ต้นทาง)

class EmployeeRateUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * สร้าง Event instance.
     * (เราส่งข้อมูลทั้งหมดที่ "ผู้รับสาร" ต้องการ)
     */
    public function __construct(
        public int $employeeProfileId,
        public string $firstName,
        public string $lastName,
        public ?float $newRate,
        public int $companyId,
        public string $departmentName
    ) {
    }

    /**
     * (Helper Method) สร้าง Event จาก Model
     */
    public static function fromProfile(EmployeeProfile $profile): self
    {
        return new self(
            $profile->id,
            $profile->first_name,
            $profile->last_name,
            $profile->hourly_rate,
            $profile->company_id,
            $profile->department?->name ?? ''
        );
    }
}
