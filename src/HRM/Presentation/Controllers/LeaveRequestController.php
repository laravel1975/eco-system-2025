<?php

namespace TmrEcosystem\HRM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Mail; // (Import Mail)
use App\Mail\LeaveRequestSubmitted; // (Import Mailable)
use TmrEcosystem\HRM\Domain\Models\LeaveType;
use TmrEcosystem\HRM\Domain\Models\LeaveRequest;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use TmrEcosystem\HRM\Presentation\Requests\StoreLeaveRequestRequest;
use Carbon\Carbon;

class LeaveRequestController extends Controller
{
    /**
     * โหลดข้อมูลที่ใช้ร่วมกันสำหรับฟอร์ม (Dropdowns)
     */
    private function getCommonData(): array
    {
        // (CompanyScope จะกรอง Leave Types ให้เราอัตโนมัติ)
        $leaveTypes = LeaveType::select('id', 'name', 'max_days_per_year')->get();
        return compact('leaveTypes');
    }

    /**
     * แสดงหน้า Index (สำหรับ HR/Manager และ "My Leave")
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $employeeProfile = $user->profile; // (สมมติว่า User->profile() คือ HasOne EmployeeProfile)

        // 1. ดึง "ใบลาของฉัน"
        $myLeaveRequests = [];
        if ($employeeProfile) {
            $myLeaveRequests = LeaveRequest::with('leaveType', 'approver:id,name')
                ->where('employee_profile_id', $employeeProfile->id)
                ->latest()
                ->get();
        }

        // 2. ดึง "ใบลาของลูกทีม" (สำหรับ Manager/HR)
        $subordinateLeaveRequests = [];
        if ($user->can('manage leave requests')) { // (ตรวจสอบสิทธิ์)
             // (ดึงใบลาที่ "Pending" ของลูกทีมที่ Report มาหาเรา)
            $subordinateLeaveRequests = LeaveRequest::with('leaveType', 'employeeProfile.user:id,name')
                ->where('status', 'pending')
                // (Join เพื่อหาลูกทีม)
                ->whereHas('employeeProfile', function ($query) use ($user) {
                    $query->where('reports_to_user_id', $user->id);
                })
                ->latest()
                ->get();
        }

        return Inertia::render('HRM/LeaveRequests/Index', [
            'myLeaveRequests' => $myLeaveRequests,
            'subordinateLeaveRequests' => $subordinateLeaveRequests,
            'commonData' => $this->getCommonData(),
        ]);
    }

    /**
     * บันทึกใบลาใหม่ (โดยพนักงาน)
     */
    public function store(StoreLeaveRequestRequest $request)
    {
        $user = $request->user();
        $employeeProfile = $user->profile;

        if (!$employeeProfile) {
            return back()->with('error', 'You do not have an employee profile to submit leave.');
        }

        $validated = $request->validated();

        // (คำนวณ total_days - อาจต้องใช้ Logic ที่ซับซ้อนกว่านี้)
        $start = Carbon::parse($validated['start_datetime']);
        $end = Carbon::parse($validated['end_datetime']);
        $totalDays = $end->diffInDays($start) + 1; // (Logic แบบง่าย)

        // สร้างใบลา (สถานะ "pending" คือ "draft" ที่คุณต้องการ)
        $leaveRequest = $employeeProfile->leaveRequests()->create([
            'company_id' => $employeeProfile->company_id,
            'leave_type_id' => $validated['leave_type_id'],
            'start_datetime' => $start,
            'end_datetime' => $end,
            'reason' => $validated['reason'],
            'total_days' => $totalDays,
            'status' => 'pending', // (นี่คือ "draft" ที่ HR/Manager จะเห็น)
        ]);

        // --- (ส่งอีเมลแจ้งเตือนหัวหน้า) ---
        // 1. หาหัวหน้า
        $manager = $employeeProfile->manager; // (Manager คือ User Model)

        // 2. ถ้ามีหัวหน้า และหัวหน้ามีอีเมล
        if ($manager && $manager->email) {
            // 3. ส่งอีเมล (ใส่ในคิว)
            Mail::to($manager->email)
                ->queue(new LeaveRequestSubmitted(
                    $leaveRequest,
                    $user->name, // (ชื่อพนักงาน)
                    $manager->name // (ชื่อหัวหน้า)
                ));
        }
        // --- (สิ้นสุดการแจ้งเตือน) ---

        return redirect()->route('hrm.leave-requests.index')->with('success', 'Leave request submitted.');
    }

    /**
     * อนุมัติใบลา (โดย Manager)
     */
    public function approve(LeaveRequest $request)
    {
        // (ควรเช็คสิทธิ์ว่าอนุมัติได้หรือไม่)
        // $this->authorize('approve', $request);

        $request->update([
            'status' => 'approved',
            'approved_by_user_id' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Leave request approved.');
    }

    /**
     * ปฏิเสธใบลา (โดย Manager)
     */
    public function reject(LeaveRequest $request)
    {
        // (ควรเช็คสิทธิ์)
        // $this->authorize('reject', $request);

        $request->update([
            'status' => 'rejected',
            'approved_by_user_id' => auth()->id(), // (บันทึกว่าใครเป็นคน Reject)
            'approved_at' => now(), // (บันทึกเวลาที่ Reject)
        ]);

        return back()->with('success', 'Leave request rejected.');
    }

    /**
     * ลบใบลา (โดยพนักงาน, เฉพาะใบลาที่ยัง Pending)
     */
    public function destroy(LeaveRequest $request)
    {
        // (ควรเช็คสิทธิ์ว่าเป็นเจ้าของ และ status == 'pending')
        if ($request->status !== 'pending' || $request->employee_profile_id !== auth()->user()->profile->id) {
             return back()->with('error', 'Cannot delete this request.');
        }

        $request->delete();
        return redirect()->route('hrm.leave-requests.index')->with('success', 'Leave request deleted.');
    }
}
