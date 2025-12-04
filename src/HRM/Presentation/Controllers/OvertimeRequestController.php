<?php

namespace TmrEcosystem\HRM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use TmrEcosystem\HRM\Domain\Models\OvertimeRequest;
use TmrEcosystem\HRM\Domain\Models\Attendance;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use TmrEcosystem\HRM\Presentation\Requests\StoreOvertimeRequestRequest;
use Carbon\Carbon;

class OvertimeRequestController extends Controller
{
    /**
     * แสดงหน้า Index (สำหรับ HR/Manager และ "My OT")
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $employeeProfile = $user->profile;

        // 1. ดึง "คำขอ OT ของฉัน"
        $myRequests = [];
        if ($employeeProfile) {
            $myRequests = OvertimeRequest::with('approver:id,name')
                ->where('employee_profile_id', $employeeProfile->id)
                ->latest('date')
                ->get();
        }

        // 2. ดึง "คำขอ OT ของลูกทีม" (สำหรับ Manager/HR)
        $teamRequests = [];
        if ($user->can('manage ot requests')) { // (ตรวจสอบสิทธิ์)
             $teamRequests = OvertimeRequest::with('employeeProfile.user:id,name')
                ->where('status', 'pending')
                ->whereHas('employeeProfile', function ($query) use ($user) {
                    $query->where('reports_to_user_id', $user->id);
                })
                ->latest('date')
                ->get();
        }

        return Inertia::render('HRM/OvertimeRequests/Index', [
            'myOvertimeRequests' => $myRequests,
            'teamOvertimeRequests' => $teamRequests,
        ]);
    }

    /**
     * บันทึกคำขอ OT ใหม่ (โดยพนักงาน)
     */
    public function store(StoreOvertimeRequestRequest $request)
    {
        $user = $request->user();
        $employeeProfile = $user->profile;

        if (!$employeeProfile) {
            return back()->with('error', 'You do not have an employee profile to submit requests.');
        }

        $validated = $request->validated();

        // (คำนวณ total_hours)
        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $totalHours = round($start->diffInMinutes($end) / 60, 2);

        // (พยายามค้นหา Attendance record ของวันนั้น)
        $attendance = Attendance::where('employee_profile_id', $employeeProfile->id)
                                ->where('date', $validated['date'])
                                ->first();

        // สร้างคำขอ OT
        $overtimeRequest = $employeeProfile->overtimeRequests()->create([
            'company_id' => $employeeProfile->company_id,
            'attendance_id' => $attendance ? $attendance->id : null,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'total_hours' => $totalHours,
            'ot_type' => $validated['ot_type'],
            'reason' => $validated['reason'],
            'status' => 'pending', // (สถานะเริ่มต้น)
        ]);

        // (คุณสามารถเพิ่ม Logic ส่งอีเมลแจ้งเตือนหัวหน้า (Manager) ที่นี่ได้)

        return redirect()->route('hrm.overtime-requests.index')->with('success', 'Overtime request submitted.');
    }

    /**
     * อนุมัติคำขอ OT (โดย Manager)
     */
    public function approve(OvertimeRequest $request)
    {
        // (ควรเช็คสิทธิ์)
        $request->update([
            'status' => 'approved',
            'approved_by_user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Overtime request approved.');
    }

    /**
     * ปฏิเสธคำขอ OT (โดย Manager)
     */
    public function reject(OvertimeRequest $request)
    {
        // (ควรเช็คสิทธิ์)
        $request->update([
            'status' => 'rejected',
            'approved_by_user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Overtime request rejected.');
    }

    /**
     * ลบคำขอ OT (โดยพนักงาน, เฉพาะอันที่ยัง Pending)
     */
    public function destroy(OvertimeRequest $request)
    {
        if ($request->status !== 'pending' || $request->employee_profile_id !== auth()->user()->profile->id) {
             return back()->with('error', 'Cannot delete this request.');
        }

        $request->delete();
        return redirect()->route('hrm.overtime-requests.index')->with('success', 'Overtime request deleted.');
    }
}
