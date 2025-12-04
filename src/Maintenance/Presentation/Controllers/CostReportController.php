<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use TmrEcosystem\Maintenance\Domain\Models\{
    MaintenanceAssignment,
    WorkOrder,
    WorkOrderSparePart,
    MaintenanceTechnician
};

class CostReportController extends Controller
{
    /** -----------------------------------------------------------
     * Controller Entry
     * ----------------------------------------------------------- */
    public function index(Request $request): Response
    {
        $companyId     = $request->user()->company_id;
        $selectedYear  = (int) $request->input('year', now()->year);
        $selectedMonth = $request->input('month', 'all');

        // 1) Dropdown ปี
        $availableYears = $this->getAvailableYears($companyId);

        // 2) เตรียม Group / base data
        [$groupField, $periods] = $this->getPeriodConfig($selectedYear, $selectedMonth);

        // 3) Query base
        $laborQuery = $this->buildLaborQuery($companyId, $selectedYear, $selectedMonth);
        $partsQuery = $this->buildPartsQuery($companyId, $selectedYear, $selectedMonth);

        // 4) Query ค่าใช้จ่าย
        $laborCosts = $this->fetchLaborCost($laborQuery, $groupField);
        $partsCosts = $this->fetchPartsCost($partsQuery, $groupField);

        // 5) ผสานผลลัพธ์ในรูปแบบ chartData
        $chartData = $this->mergeChartData($periods, $laborCosts, $partsCosts, $selectedMonth);

        return Inertia::render('Maintenance/Reports/Cost', [
            'availableYears' => $availableYears,
            'chartData'      => $chartData,
            'filters' => [
                'year'  => $selectedYear,
                'month' => $selectedMonth,
            ],
        ]);
    }

    /** -----------------------------------------------------------
     * ดึงปีที่มีใบงาน
     * ----------------------------------------------------------- */
    private function getAvailableYears(int $companyId)
    {
        return WorkOrder::where('company_id', $companyId)
            ->selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year');
    }

    /** -----------------------------------------------------------
     * กำหนดช่วงเวลา (รายเดือน หรือ รายวัน)
     * ----------------------------------------------------------- */
    private function getPeriodConfig(int $year, string $month): array
    {
        if ($month !== 'all') {
            // รายวัน
            $days = Carbon::create($year, $month)->daysInMonth;

            $list = collect(range(1, $days))->map(fn ($day) => [
                'label' => (string) $day,
                'key'   => $day,
            ]);

            return ['DAY(work_orders.created_at)', $list];
        }

        // รายเดือน
        $list = collect(range(1, 12))->map(fn ($m) => [
            'label' => Carbon::create(null, $m)->format('M'),
            'key'   => $m,
        ]);

        return ['MONTH(work_orders.created_at)', $list];
    }

    /** -----------------------------------------------------------
     * Base Query ฝั่งแรงงาน
     * ----------------------------------------------------------- */
    private function buildLaborQuery(int $companyId, int $year, string $month)
    {
        $query = MaintenanceAssignment::where('assignable_type', MaintenanceTechnician::class)
            ->join('work_orders', 'maintenance_assignments.work_order_id', '=', 'work_orders.id')
            ->where('work_orders.company_id', $companyId)
            ->whereYear('work_orders.created_at', $year);

        if ($month !== 'all') {
            $query->whereMonth('work_orders.created_at', $month);
        }

        return $query;
    }

    /** -----------------------------------------------------------
     * Base Query ฝั่งอะไหล่
     * ----------------------------------------------------------- */
    private function buildPartsQuery(int $companyId, int $year, string $month)
    {
        $query = WorkOrderSparePart::join('work_orders', 'work_order_spare_parts.work_order_id', '=', 'work_orders.id')
            ->where('work_orders.company_id', $companyId)
            ->whereYear('work_orders.created_at', $year);

        if ($month !== 'all') {
            $query->whereMonth('work_orders.created_at', $month);
        }

        return $query;
    }

    /** -----------------------------------------------------------
     * Query ค่าแรง
     * ----------------------------------------------------------- */
    private function fetchLaborCost($query, string $groupField)
    {
        return $query->selectRaw("$groupField as period, SUM(labor_cost) as total")
            ->groupBy('period')
            ->pluck('total', 'period');
    }

    /** -----------------------------------------------------------
     * Query ค่าอะไหล่
     * ----------------------------------------------------------- */
    private function fetchPartsCost($query, string $groupField)
    {
        return $query->selectRaw("$groupField as period, SUM(quantity_used * unit_cost_at_time) as total")
            ->groupBy('period')
            ->pluck('total', 'period');
    }

    /** -----------------------------------------------------------
     * Merge chart data to final format
     * ----------------------------------------------------------- */
    private function mergeChartData($periodList, $laborCosts, $partsCosts, string $monthFilter)
    {
        return $periodList->map(function ($item) use ($laborCosts, $partsCosts) {
            $key = (int) $item['key'];

            return [
                'name'      => $item['label'],
                'laborCost' => (float) ($laborCosts[$key] ?? 0),
                'partsCost' => (float) ($partsCosts[$key] ?? 0),
            ];
        });
    }
}
