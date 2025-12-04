<?php

namespace TmrEcosystem\HRM\Presentation\Controllers;

use App\Http\Controllers\Controller; // (1. ตรวจสอบ use statement นี้)
use Illuminate\Http\Request;
use TmrEcosystem\HRM\Domain\Models\Attendance;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use App\Jobs\ProcessAttendanceImport;
use League\Csv\Writer; // (2. Import Writer)
use SplTempFileObject; // (3. Import)

class AttendanceImportController extends Controller
{
    /**
     * รับไฟล์ CSV ที่อัปโหลด...
     */
    public function store(Request $request)
    {
        // 1. ตรวจสอบสิทธิ์
        // $this->authorize('import attendance');

        // 2. ตรวจสอบไฟล์
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        // 3. บันทึกไฟล์ไว้ชั่วคราว
        $path = $request->file('file')->store('attendance-imports');

        // 4. ส่งต่อไปให้ Job
        ProcessAttendanceImport::dispatch($path, auth()->id());

        return back()->with('success', 'File upload successful! Records are being processed in the background.');
    }

    /**
     * (4. สร้างใหม่) สร้างและส่งไฟล์ CSV Template
     */
    public function downloadTemplate()
    {
        // 1. สร้าง CSV ใน Memory
        $csv = Writer::createFromFileObject(new SplTempFileObject());

        // 2. เพิ่ม Header (ตามที่เรากำหนดใน Job)
        $csv->insertOne(['employee_id_no', 'date', 'clock_in', 'clock_out']);

        // 3. (Optional) เพิ่มตัวอย่างข้อมูล
        $csv->insertOne(['EMP001', '2025-11-10', '08:00', '17:00']);
        $csv->insertOne(['EMP002', '2025-11-10', '08:05', '17:01']);
        $csv->insertOne(['EMP003', '2025-11-10', '08:00', null]); // (ตัวอย่างคนลืม Clock Out)

        // 4. ตั้งชื่อไฟล์และส่งให้ดาวน์โหลด
        $filename = 'attendance_template.csv';

        return response((string) $csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
