<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTechnician;

class SyncMaintenanceTechnicians extends Command
{
    protected $signature = 'maintenance:sync-technicians';
    protected $description = 'Sync employee profiles to maintenance technicians table';

    public function handle()
    {
        $this->info('Syncing technicians...');

        $employees = EmployeeProfile::all(); // (หรือกรองเฉพาะ Role Technician)

        foreach ($employees as $employee) {
            MaintenanceTechnician::updateOrCreate(
                ['employee_profile_id' => $employee->id],
                [
                    'company_id' => $employee->company_id,
                    'first_name' => $employee->first_name,
                    'last_name' => $employee->last_name,
                    'hourly_rate' => $employee->hourly_rate,
                ]
            );
        }

        $this->info('Synced ' . $employees->count() . ' technicians successfully.');
    }
}
