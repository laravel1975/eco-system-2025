<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use TmrEcosystem\Maintenance\Domain\Models\Asset;
use App\Http\Controllers\Controller;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceType;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceAssignment;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrderSparePart;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTechnician;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;


class MaintenanceReportController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id;

        // (Filters - เหมือนเดิม)
        $startDate = $request->input('start_date', now()->startOfYear()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));
        $assetId = $request->input('asset_id');
        $typeId = $request->input('maintenance_type_id');

        // (Query หลัก - แก้ไข 'company_id' ให้ถูกต้อง)
        $dateQuery = WorkOrder::where('company_id', $companyId) // (ใช้ 'company_id' ที่ถูกต้อง)
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($assetId && $assetId !== 'all') {
            $dateQuery->where('asset_id', $assetId);
        }
        if ($typeId && $typeId !== 'all') {
            $dateQuery->where('maintenance_type_id', $typeId);
        }

        // --- 1. KPIs (โค้ดส่วนนี้ถูกต้อง) ---
        $workOrderIds = (clone $dateQuery)->pluck('id');

        $internalLaborCost = MaintenanceAssignment::whereIn('work_order_id', $workOrderIds)
            ->where('assignable_type', MaintenanceTechnician::class)
            ->join('maintenance_technicians', 'maintenance_assignments.assignable_id', '=', 'maintenance_technicians.employee_profile_id')
            ->where('maintenance_technicians.company_id', $companyId)
            ->whereNotNull('actual_labor_hours')
            ->sum(DB::raw('maintenance_assignments.actual_labor_hours * maintenance_technicians.hourly_rate'));

        $sparePartCost = WorkOrderSparePart::whereIn('work_order_id', $workOrderIds)
            ->sum(DB::raw('work_order_spare_parts.quantity_used * work_order_spare_parts.unit_cost_at_time'));

        $mttr = (clone $dateQuery)
            ->whereIn('status', ['completed', 'closed'])
            ->where('downtime_hours', '>', 0)
            ->avg('downtime_hours');

        $kpis = [
            'total_labor_cost' => (float) $internalLaborCost,
            'total_spare_cost' => (float) $sparePartCost,
            'total_maintenance_cost' => (float) $internalLaborCost + (float) $sparePartCost,
            'mttr' => round($mttr ?? 0, 2),
        ];

        // --- 3. Table: Cost by Asset (โค้ดส่วนนี้ถูกต้อง) ---
        $assetIdsInQuery = (clone $dateQuery)->distinct()->pluck('asset_id');
        $totalPeriodHours = \Carbon\Carbon::parse($startDate)->diffInHours(\Carbon\Carbon::parse($endDate)->endOfDay());

        $assetCosts = Asset::whereIn('id', $assetIdsInQuery)
            ->get()
            // ... (Logic map $assetCosts - เหมือนเดิม) ...
            ->map(function ($asset) use ($totalPeriodHours, $startDate, $endDate) {
                // (Logic นี้ถูกต้อง)
                $workOrders = $asset->workOrders()->whereBetween('created_at', [$startDate, $endDate])->with(['assignments', 'sparePartsUsed'])->get();
                $laborCost = $workOrders->sum(fn($wo) => $wo->assignments->sum('labor_cost') ?? 0);
                $partsCost = $workOrders->sum(fn($wo) => $wo->sparePartsUsed->sum(fn($p) => $p->quantity_used * $p->unit_cost_at_time));
                $breakdowns = $workOrders->whereIn('status', ['completed', 'closed'])->where('downtime_hours', '>', 0);
                $breakdownCount = $breakdowns->count();
                $totalDowntime = $breakdowns->sum('downtime_hours');
                $mttr = $breakdownCount > 0 ? ($totalDowntime / $breakdownCount) : 0;
                $uptime = $totalPeriodHours - $totalDowntime;
                $mtbf = $breakdownCount > 0 ? ($uptime / $breakdownCount) : $uptime;
                return [
                    'id' => $asset->id, 'asset_name' => $asset->name, 'asset_code' => $asset->asset_code,
                    'total_cost' => $laborCost + $partsCost, 'breakdown_count' => $breakdownCount,
                    'mttr' => round($mttr, 2), 'mtbf' => round($mtbf, 2),
                ];
            })
            ->filter(fn($item) => $item['total_cost'] > 0 || $item['mttr'] > 0)
            ->sortByDesc('total_cost')
            ->take(10)
            ->values();

        // --- 4. ดึงข้อมูลสำหรับ Filter Dropdowns (โค้ดส่วนนี้ถูกต้อง) ---
        $assets = Asset::where('company_id', $companyId)
            ->with('warehouse:uuid,name')
            ->get(['id', 'name', 'asset_code', 'warehouse_uuid']);

        $maintenanceTypes = MaintenanceType::where('company_id', $companyId)->get(['id', 'name', 'code']);

        return Inertia::render('Maintenance/Reports/Index', [
            // (1. 👈 [แก้ไข] Uncomment 2 บรรทัดนี้)
            'kpis' => $kpis,
            'assetCosts' => $assetCosts,

            'assets' => $assets,
            'maintenanceTypes' => $maintenanceTypes,
            'filters' => $request->only(['start_date', 'end_date', 'asset_id', 'maintenance_type_id']),
        ]);
    }
}
