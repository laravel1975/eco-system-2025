<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

// (Imports ที่เราต้องใช้)
use Illuminate\Support\Facades\Storage;
use League\Csv\Reader;
use TmrEcosystem\HRM\Domain\Models\Attendance;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ProcessAttendanceImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $filePath;
    protected $userId;

    public function __construct(string $filePath, int $userId)
    {
        $this->filePath = $filePath;
        $this->userId = $userId;
    }

    /**
     * (โค้ดที่แก้ไขแล้ว)
     */
    public function handle(): void
    {
        try {
            $content = Storage::get($this->filePath);
            $csv = Reader::createFromString($content);
            $csv->setHeaderOffset(0); // (แถวแรกคือ Header)
            $records = $csv->getRecords();

            foreach ($records as $record) {
                // (ป้องกัน Error ถ้าคอลัมน์ไม่มีอยู่)
                $employeeIdNo = $record['employee_id_no'] ?? null;
                if (!$employeeIdNo) continue;

                $employee = EmployeeProfile::where('employee_id_no', $employeeIdNo)->first();
                if (!$employee) continue; // (ไม่เจอพนักงาน)

                $date = $record['date'] ?? null;
                if (!$date) continue; // (ไม่มีวันที่)

                // --- (START FIX) ---

                // (1. Get values safely, treat empty string as null)
                $clockInTime = !empty($record['clock_in']) ? $record['clock_in'] : null;
                $clockOutTime = !empty($record['clock_out']) ? $record['clock_out'] : null;

                // (2. Calculate total hours only if both exist)
                $totalHours = null;
                if ($clockInTime && $clockOutTime) {
                    try {
                        $start = Carbon::parse($clockInTime);
                        $end = Carbon::parse($clockOutTime);
                        $totalHours = round($start->diffInMinutes($end) / 60, 2);
                    } catch (\Exception $e) {
                        $totalHours = null; // (ถ้า parse พัง ให้เป็น null)
                    }
                }

                // (3. Build timestamps safely)
                $clockInDb = $clockInTime ? $date . ' ' . $clockInTime . ':00' : null;
                $clockOutDb = $clockOutTime ? $date . ' ' . $clockOutTime . ':00' : null;

                // --- (END FIX) ---

                // 4. บันทึกลง DB
                Attendance::updateOrCreate(
                    [
                        'employee_profile_id' => $employee->id,
                        'date' => $date,
                    ],
                    [
                        'company_id' => $employee->company_id,
                        'work_shift_id' => $employee->work_shift_id,
                        'clock_in' => $clockInDb,
                        'clock_out' => $clockOutDb,
                        'total_work_hours' => $totalHours,
                        // (Logic สถานะที่ดีขึ้น: ถ้ามี clock in = present)
                        'status' => ($clockInDb) ? 'present' : 'absent',
                        'source' => 'csv_import',
                        'adjusted_by_user_id' => $this->userId,
                    ]
                );
            }

            // 5. ลบไฟล์ชั่วคราวทิ้ง
            Storage::delete($this->filePath);

        } catch (\Exception $e) {
            // (สำคัญ) ถ้า Job ล้มเหลว ให้ Log Error ไว้
            Storage::delete($this->filePath);
            Log::error('Attendance Import Failed: ' . $e->getMessage());
            // (โยน Error อีกครั้งเพื่อให้ Job แสดง "FAIL")
            throw $e;
        }
    }
}
