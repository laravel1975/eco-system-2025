<?php

namespace TmrEcosystem\HRM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use TmrEcosystem\HRM\Domain\Models\Attendance;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use TmrEcosystem\HRM\Presentation\Requests\StoreAttendanceRequest;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * แสดงหน้า "Attendance Log" (สำหรับ HR/Manager)
     */
    public function index(Request $request): Response
    {
        // 1. (Filter) กรองตามวันที่ (ถ้าไม่ส่งมา ให้ใช้ "วันนี้")
        $selectedDate = $request->input('date')
            ? Carbon::parse($request->input('date'))
            : Carbon::today();

        // 2. (Filter) (ในอนาคต) กรองตาม Department หรือ Company (สำหรับ Super Admin)
        // ...

        // 3. ดึงพนักงานทั้งหมด (แบบแบ่งหน้า)
        // (CompanyScope จะกรองพนักงานให้ Admin บริษัทอัตโนมัติ)
        $employees = EmployeeProfile::with([
            'user:id,name',
            'workShift:id,name,start_time',

            // (สำคัญ) โหลด "การลงเวลา" (attendances)
            // เฉพาะของ "วันที่ที่เลือก" เท่านั้น
            'attendances' => function ($query) use ($selectedDate) {
                $query->where('date', $selectedDate->toDateString());
            },

            // (สำคัญ) โหลด "ใบลา" (leaveRequests)
            // เฉพาะที่ "อนุมัติแล้ว" และ "ครอบคลุม" วันที่ที่เลือก
            'leaveRequests' => function ($query) use ($selectedDate) {
                $query->where('status', 'approved')
                    ->where('start_datetime', '<=', $selectedDate->endOfDay())
                    ->where('end_datetime', '>=', $selectedDate->startOfDay());
            },
        ])
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('HRM/Attendances/Index', [
            'employeesWithAttendance' => $employees,
            'filters' => [
                'date' => $selectedDate->toDateString(), // (ส่งกลับไปให้ DatePicker)
            ],
            // (เราส่ง commonData เผื่อฟอร์ม Adjustment)
            'commonData' => [
                'employees' => EmployeeProfile::select('id', 'first_name', 'last_name')->get(),
            ],
        ]);
    }

    /**
     * บันทึก/แก้ไข การลงเวลา (Adjustment)
     * (Req E: Attendance Adjustment Workflow)
     */
    public function store(StoreAttendanceRequest $request)
    {
        $validated = $request->validated();
        $employee = EmployeeProfile::find($validated['employee_profile_id']);

        // (คำนวณชั่วโมงทำงาน ถ้ามี clock_in/out)
        $totalHours = null;
        if ($validated['clock_in'] && $validated['clock_out']) {
            $clockIn = Carbon::parse($validated['clock_in']);
            $clockOut = Carbon::parse($validated['clock_out']);
            // (คำนวณเป็นทศนิยม)
            $totalHours = round($clockIn->diffInMinutes($clockOut) / 60, 2);
        }

        // (ใช้ updateOrCreate)
        // ค้นหาด้วย employee_id และ date, ถ้าเจอให้อัปเดต, ถ้าไม่เจอให้สร้างใหม่
        $attendance = Attendance::updateOrCreate(
            [
                'employee_profile_id' => $validated['employee_profile_id'],
                'date' => $validated['date'],
            ],
            [
                'company_id' => $employee->company_id,
                'work_shift_id' => $employee->work_shift_id,
                'clock_in' => $validated['clock_in'] ? $validated['date'] . ' ' . $validated['clock_in'] : null,
                'clock_out' => $validated['clock_out'] ? $validated['date'] . ' ' . $validated['clock_out'] : null,
                'total_work_hours' => $totalHours,
                'status' => $validated['status'],
                'notes' => $validated['notes'],
                'source' => 'manual_adjustment', // (ระบุว่ามาจากการแก้ไขโดย HR)
                'adjusted_by_user_id' => auth()->id(),
            ]
        );

        return back()->with('success', 'Attendance record updated.');
    }

    /**
     * (สร้างใหม่) พนักงาน "ลงเวลาเข้า"
     */
    public function clockIn(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $employee = auth()->user()->profile; // (ดึง Profile ของคนที่ล็อกอิน)
        if (!$employee) {
            return back()->with('error', 'Employee profile not found.');
        }

        $today = Carbon::today();

        // (ตรวจสอบว่าลงเวลาซ้ำหรือไม่)
        $existingAttendance = Attendance::where('employee_profile_id', $employee->id)
            ->where('date', $today->toDateString())
            ->first();

        if ($existingAttendance && $existingAttendance->clock_in) {
            return back()->with('error', 'You have already clocked in today.');
        }

        // (เช็คว่า "สาย" หรือไม่)
        $status = 'present';
        if ($employee->workShift && $employee->workShift->start_time) {
            $shiftStartTime = Carbon::parse($employee->workShift->start_time);
            if (Carbon::now()->gt($shiftStartTime)) {
                $status = 'late';
            }
        }

        // (สร้างหรืออัปเดต)
        $attendance = Attendance::updateOrCreate(
            [
                'employee_profile_id' => $employee->id,
                'date' => $today->toDateString(),
            ],
            [
                'company_id' => $employee->company_id,
                'work_shift_id' => $employee->work_shift_id,
                'clock_in' => now(),
                'status' => $status,
                'source' => 'mobile_gps', // (Req B)
                'clock_in_latitude' => $request->latitude,
                'clock_in_longitude' => $request->longitude,
            ]
        );

        return back()->with('success', 'Clocked in successfully at ' . now()->format('H:i'));
    }

    /**
     * (สร้างใหม่) พนักงาน "ลงเวลาออก"
     */
    public function clockOut(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $employee = auth()->user()->profile;
        if (!$employee) {
            return back()->with('error', 'Employee profile not found.');
        }

        // (ค้นหา Record ของวันนี้)
        $attendance = Attendance::where('employee_profile_id', $employee->id)
            ->where('date', Carbon::today()->toDateString())
            ->first();

        if (!$attendance || !$attendance->clock_in) {
            return back()->with('error', 'You must clock in before clocking out.');
        }
        if ($attendance->clock_out) {
            return back()->with('error', 'You have already clocked out today.');
        }

        // (คำนวณชั่วโมงทำงาน)
        $clockIn = Carbon::parse($attendance->clock_in);
        $clockOut = now();
        $totalHours = round($clockIn->diffInMinutes($clockOut) / 60, 2);

        $attendance->update([
            'clock_out' => $clockOut,
            'total_work_hours' => $totalHours,
            'clock_out_latitude' => $request->latitude,
            'clock_out_longitude' => $request->longitude,
        ]);

        return back()->with('success', 'Clocked out successfully at ' . $clockOut->format('H:i'));
    }
}
