<?php

namespace TmrEcosystem\HRM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use TmrEcosystem\HRM\Domain\Models\Department;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;

class OrgChartController extends Controller
{
    /**
     * แสดงหน้าแผนผังองค์กร
     */
    public function index(): Response
    {
        $user = auth()->user();

        // 1. ดึงข้อมูล "พนักงาน"
        // (CompanyScope ใน EmployeeProfile Model จะกรองให้แล้ว)
        $allEmployees = EmployeeProfile::with('user:id,name')
            ->select('id', 'user_id', 'first_name', 'last_name', 'job_title', 'reports_to_user_id')
            ->get();

        // 2. ดึงข้อมูล "แผนก"
        // (CompanyScope ใน Department Model จะกรองให้แล้ว)
        $allDepartments = Department::select('id', 'name', 'parent_id')
            ->get();

        // 3. [ใหม่] ดึงชื่อบริษัทสำหรับ Root Node
        $companyName = 'Organization Chart'; // (ค่าเริ่มต้นสำหรับ Super Admin)
        if ($user->company) {
            $companyName = $user->company->name;
        }

        // 4. ส่งข้อมูลแบบ "แบน" (Flat Lists) ไปให้ React
        return Inertia::render('HRM/OrgChart/Index', [
            'allEmployees'   => $allEmployees,
            'allDepartments' => $allDepartments,
            'companyName'    => $companyName, // (เพิ่ม Prop นี้)
        ]);
    }
}
