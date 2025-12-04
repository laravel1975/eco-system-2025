<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceAssignment;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTechnician;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;

class TechnicianReportController extends Controller
{
    public function index(Request $request): Response
    {
        // Filter company
        $companyId = $request->user()->company_id;

        $technicianId = $request->input('technician_id'); // (Filter รายคน)
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

        // 1. ข้อมูลสำหรับ ComboBox (รายชื่อช่างทั้งหมด)
        $technicians = MaintenanceTechnician::where('company_id', $companyId)
            ->get(['employee_profile_id as id', 'first_name', 'last_name']);

        // 2. Query หลัก (Assignments ในช่วงเวลาที่กำหนด)
        $query = MaintenanceAssignment::query()
            ->join('work_orders', 'maintenance_assignments.work_order_id', '=', 'work_orders.id')
            ->where('work_orders.company_id', $companyId)
            ->whereBetween('work_orders.created_at', [$startDate, $endDate])
            // (เฉพาะงานที่มอบหมายให้ Technician ภายใน)
            ->where('maintenance_assignments.assignable_type', MaintenanceTechnician::class);

        // (ถ้ามีการกรองรายคน)
        if ($technicianId && $technicianId !== 'all') {
            $query->where('maintenance_assignments.assignable_id', $technicianId);
        }

        // 3. สรุปข้อมูลสำหรับกราฟ (Overview Chart)
        $technicianStats = (clone $query)
            ->select(
                'maintenance_assignments.assignable_id',
                DB::raw('count(distinct work_orders.id) as total_jobs'),
                DB::raw('sum(maintenance_assignments.actual_labor_hours) as total_hours'),
                // (นับงานแยกตาม Priority)
                DB::raw("sum(case when work_orders.priority = 'P1' then 1 else 0 end) as p1_count"),
                DB::raw("sum(case when work_orders.priority = 'P2' then 1 else 0 end) as p2_count")
            )
            ->groupBy('maintenance_assignments.assignable_id')
            ->get();

        // (Map ชื่อช่างใส่เข้าไปใน Stats)
        $chartData = $technicianStats->map(function ($stat) use ($technicians) {
            $tech = $technicians->firstWhere('id', $stat->assignable_id);
            return [
                'name' => $tech ? "{$tech->first_name} {$tech->last_name}" : 'Unknown',
                'jobs' => $stat->total_jobs,
                'hours' => $stat->total_hours ?? 0,
                'p1' => $stat->p1_count,
                'p2' => $stat->p2_count,
            ];
        });

        return Inertia::render('Maintenance/Reports/Technician', [
            'technicians' => $technicians,
            'chartData' => $chartData,
            'filters' => [
                'technician_id' => $technicianId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    /**
     * Export PDF
     */
    public function exportPdf(Request $request)
    {
        $company = $request->user()->company;
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));
        $technicianId = $request->input('technician_id');

        // (2. Reuse Logic Query เหมือน Index - ควรแยกเป็น Private Method ถ้าทำจริงจัง)
        $technicians = MaintenanceTechnician::where('company_id', $company->id)
            ->get(['employee_profile_id as id', 'first_name', 'last_name']);

        $query = MaintenanceAssignment::query()
            ->join('work_orders', 'maintenance_assignments.work_order_id', '=', 'work_orders.id')
            ->where('work_orders.company_id', $company->id)
            ->whereBetween('work_orders.created_at', [$startDate, $endDate])
            ->where('maintenance_assignments.assignable_type', MaintenanceTechnician::class);

        if ($technicianId && $technicianId !== 'all') {
            $query->where('maintenance_assignments.assignable_id', $technicianId);
        }

        $technicianStats = $query->select(
            'maintenance_assignments.assignable_id',
            DB::raw('count(distinct work_orders.id) as total_jobs'),
            DB::raw('sum(maintenance_assignments.actual_labor_hours) as total_hours'),
            DB::raw("sum(case when work_orders.priority = 'P1' then 1 else 0 end) as p1_count"),
            DB::raw("sum(case when work_orders.priority = 'P2' then 1 else 0 end) as p2_count")
        )
            ->groupBy('maintenance_assignments.assignable_id')
            ->get();

        // (3. Format ข้อมูลสำหรับ View)
        $data = $technicianStats->map(function ($stat) use ($technicians) {
            $tech = $technicians->firstWhere('id', $stat->assignable_id);
            return [
                'name' => $tech ? "{$tech->first_name} {$tech->last_name}" : 'Unknown',
                'jobs' => $stat->total_jobs,
                'hours' => $stat->total_hours ?? 0,
                'p1' => $stat->p1_count,
                'p2' => $stat->p2_count,
            ];
        });

        // (4. สร้าง PDF)
        $pdf = Pdf::loadView('reports.technician_kpi', [
            'company' => $company,
            'data' => $data,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);

        // (ตั้งค่ากระดาษ A4 แนวตั้ง)
        $pdf->setPaper('a4', 'portrait');

        // (5. Stream ไฟล์กลับไป (เปิดใน Browser))
        return $pdf->stream('technician_kpi_' . now()->format('Ymd') . '.pdf');
    }
}
