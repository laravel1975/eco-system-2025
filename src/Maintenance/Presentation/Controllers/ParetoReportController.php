<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;
use TmrEcosystem\Maintenance\Domain\Models\Asset;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceType;

class ParetoReportController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id;

        // (รับค่า Filter)
        $startDate = $request->input('start_date', now()->subMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));
        $assetId = $request->input('asset_id');

        // --- 1. Query หลักสำหรับ Pareto (RCA) ---
        $query = WorkOrder::where('company_id', $companyId)
            ->whereNotNull('failure_code_id')
            ->whereBetween('created_at', [$startDate, $endDate]);

        // (กรองตาม Asset ถ้ามีการเลือก)
        if ($assetId && $assetId !== 'all') {
            $query->where('asset_id', $assetId);
        }

        $rootCausesData = $query
            ->select('failure_code_id', DB::raw('count(*) as count'))
            ->groupBy('failure_code_id')
            ->with('failureCode:id,code,name')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        $totalFailures = $rootCausesData->sum('count');
        $cumulativeCount = 0;

        $rootCauses = $rootCausesData->map(function ($item) use (&$cumulativeCount, $totalFailures) {
            $cumulativeCount += $item->count;
            return [
                'name' => $item->failureCode->code,
                'full_name' => $item->failureCode->name,
                'count' => $item->count,
                'fill' => '#6366f1',
                'cumulativePercentage' => $totalFailures > 0
                    ? round(($cumulativeCount / $totalFailures) * 100, 2)
                    : 0,
            ];
        });

        // --- 2. ดึงข้อมูลสำหรับ Filter Dropdowns ---
        $assets = Asset::where('company_id', $companyId)
            ->where('status', 'active')
            ->get(['id', 'name', 'asset_code', 'location']);

        return Inertia::render('Maintenance/Reports/Pareto', [
            'rootCauses' => $rootCauses,
            'assets' => $assets,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'asset_id' => $assetId,
            ],
        ]);
    }
}
