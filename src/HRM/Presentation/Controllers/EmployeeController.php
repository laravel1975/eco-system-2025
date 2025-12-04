<?php

namespace TmrEcosystem\HRM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Company; // (Shared Kernel)
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;
use TmrEcosystem\HRM\Domain\Events\EmployeeRateUpdated;
use TmrEcosystem\HRM\Domain\Models\Department;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use TmrEcosystem\IAM\Domain\Models\User; // (IAM Context)
use TmrEcosystem\HRM\Presentation\Requests\StoreEmployeeRequest;
use TmrEcosystem\HRM\Presentation\Requests\UpdateEmployeeRequest;

class EmployeeController extends Controller
{
    /**
     * (สำคัญ) โหลดข้อมูลที่ใช้ร่วมกันสำหรับฟอร์ม (Dropdowns)
     */
    private function getCommonData(): array
    {
        // (CompanyScope จะกรอง Department และ User ตามสิทธิ์อยู่แล้ว)

        // --- (แก้ไข) ---
        // เพิ่ม 'company_id' เข้าไปใน select
        $departments = Department::select('id', 'name', 'company_id')->get();
        // --- (สิ้นสุดการแก้ไข) ---

        $unlinkedUsers = User::doesntHave('profile')
            ->select('id', 'name', 'email')
            ->get();

        $companies = [];
        if (auth()->user()->hasRole('Super Admin')) {
            $companies = Company::select('id', 'name')->get();
        }

        return compact('departments', 'unlinkedUsers', 'companies');
    }

    /**
     * แสดงหน้า Index พร้อม Modal Logic
     */
    public function index(Request $request): Response
    {
        // 1. ดึงข้อมูลพนักงาน (แบบ Paginate)
        $employees = EmployeeProfile::with([
            'user:id,name,email',
            'department:id,name',
            'company:id,name'
        ])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // 2. ดึงข้อมูลสำหรับ "Modal สร้าง" (Create Modal)
        $commonData = $this->getCommonData();

        // 4. ส่ง Props (น้อยลง) ไปให้ React
        return Inertia::render('HRM/Employees/Index', [
            'employees'      => $employees,
            'commonData'     => $commonData,
            'query'          => $request->only(['action', 'link_user_id', 'id']),
        ]);
    }

    /**
     * (สร้างใหม่) แสดงหน้า "แก้ไข" (หน้าเต็มพร้อมแท็บ)
     */
    public function edit(EmployeeProfile $employee): Response
    {
        // 1. โหลดข้อมูลพนักงานที่ต้องการ (รวมถึงผู้ติดต่อฉุกเฉิน)
        $employee->load(['user', 'department', 'company', 'emergencyContacts', 'documents']);

        // 2. ดึงข้อมูลสำหรับ Dropdowns (เหมือนเดิม)
        $commonData = $this->getCommonData();

        // 3. (สำคัญ) เพิ่ม User ปัจจุบันของพนักงานคนนี้กลับเข้าไปใน List
        // (เพื่อให้ Dropdown แสดงชื่อเขาได้ แม้ว่าเขาจะถูก Link อยู่)
        if ($employee->user && !$commonData['unlinkedUsers']->contains('id', $employee->user->id)) {
            $commonData['unlinkedUsers']->push($employee->user);
        }

        // 4. ส่งข้อมูลไปที่หน้า Edit.tsx
        return Inertia::render('HRM/Employees/Edit', [
            'employee'   => $employee,
            'commonData' => $commonData,
        ]);
    }

    /**
     * บันทึกพนักงานใหม่ (จาก Modal)
     */
    public function store(StoreEmployeeRequest $request)
    {
        $validated = $request->validated();

        if (!auth()->user()->hasRole('Super Admin')) {
            $validated['company_id'] = auth()->user()->company_id;
        }

        if (empty($validated['user_id']) || $validated['user_id'] === 'no_user_link') {
            $validated['user_id'] = null;
        }

        // 1. สร้างพนักงาน
        $employee = EmployeeProfile::create($validated);

        // 2. [Logic เชื่อมต่อ Maintenance]
        // โหลดข้อมูลแผนกขึ้นมาตรวจสอบ
        $employee->load('department');

        // ตรวจสอบว่าเป็นแผนก Maintenance หรือไม่
        if ($employee->department && $employee->department->name === 'Maintenance') {

            // ถ้าใช่ -> ยิง Event เพื่อแจ้งให้ Maintenance BC สร้างข้อมูล Technician คนใหม่ทันที
            // (ใช้ event() helper แทน dispatch ตามที่เราแก้ไขกันล่าสุด)
            event(EmployeeRateUpdated::fromProfile($employee));

            // (Optional: ถ้าต้องการความชัวร์สูงสุดว่าข้อมูลมาทันที จะเปิดบรรทัดนี้ก็ได้ครับ)
            Artisan::call('maintenance:sync-technicians');
        }

        return redirect()->route('hrm.employees.index')->with('success', 'Employee created.');
    }

    /**
     * อัปเดตพนักงาน (จาก Modal หรือหน้า Edit)
     * (*** อัปเกรดใหม่: เพิ่มการยิง Event ***)
     */
    public function update(UpdateEmployeeRequest $request, EmployeeProfile $employee): RedirectResponse
    {
        $validated = $request->validated();

        // (Logic การจัดการ company_id และ user_id - เหมือนเดิม)
        if (!auth()->user()->hasRole('Super Admin')) {
            $validated['company_id'] = $employee->company_id;
        }
        if (empty($validated['user_id']) || $validated['user_id'] === 'no_user_link') {
            $validated['user_id'] = null;
        }

        // (2. ทำการอัปเดตข้อมูล)
        $employee->update($validated);

        // (3. [ใหม่] ตรวจสอบว่า 'hourly_rate' ถูกเปลี่ยนหรือไม่)
        // (เราต้องแน่ใจว่า UpdateEmployeeRequest ของคุณมี 'hourly_rate' ใน rules)
        if ($employee->wasChanged('hourly_rate')) {

            $employee->load('department');

            // (1. [Logic ข้อ 1] ตรวจสอบว่าเป็นแผนก Maintenance หรือไม่)
            if ($employee->department && $employee->department->name === 'Maintenance') {

                // (ถ้าใช่ -> ตะโกนบอก Maintenance)
                event(EmployeeRateUpdated::fromProfile($employee));
            }
        }

        // (ตรวจสอบว่าควรกลับไปหน้า Index หรือ Edit)
        $redirectRoute = $request->input('origin') === 'edit_page'
            ? route('hrm.employees.edit', $employee->id)
            : route('hrm.employees.index');

        // (สั่งให้ Maintenance Sync ข้อมูลทันที)
        Artisan::call('maintenance:sync-technicians');

        return redirect($redirectRoute)->with('success', 'Employee updated.');
    }

    /**
     * ลบพนักงาน
     */
    public function destroy(EmployeeProfile $employee)
    {
        $employee->delete();
        return redirect()->route('hrm.employees.index')->with('success', 'Employee deleted.');
    }
}
