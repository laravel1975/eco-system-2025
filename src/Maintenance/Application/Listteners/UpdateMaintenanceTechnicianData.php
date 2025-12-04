<?php

namespace TmrEcosystem\Maintenance\Application\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue; // (1. [สำคัญ] ทำงานเบื้องหลัง)
use Illuminate\Queue\InteractsWithQueue;
use TmrEcosystem\HRM\Domain\Events\EmployeeRateUpdated; // (2. "ดักฟัง" Event นี้)
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTechnician; // (3. อัปเดต Model นี้)

class UpdateMaintenanceTechnicianData implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(EmployeeRateUpdated $event): void
    {
        // (2. [Logic ข้อ 2] ฟังแต่เฉพาะแผนก Maintenance)
        if ($event->departmentName !== 'Maintenance') {
            // (ถ้าไม่ใช่ Maintenance ให้จบการทำงานทันที ไม่บันทึก)
            return;
        }

        // (ถ้าใช่ -> บันทึกข้อมูลลงตารางของ Maintenance)
        MaintenanceTechnician::updateOrCreate(
            [
                'employee_profile_id' => $event->employeeProfileId,
            ],
            [
                'company_id' => $event->companyId,
                'first_name' => $event->firstName,
                'last_name' => $event->lastName,
                'hourly_rate' => $event->newRate,
            ]
        );
    }
}
