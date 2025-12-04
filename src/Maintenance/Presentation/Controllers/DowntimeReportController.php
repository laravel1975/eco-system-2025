<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;
use TmrEcosystem\Maintenance\Domain\Models\Asset;
use Carbon\Carbon;

class DowntimeReportController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id;

        // ... (Filters, TotalPeriodHours, DowntimeQuery - เหมือนเดิม) ...
        $startDate = $request->input('start_date', now()->subMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));
        $assetId = $request->input('asset_id');

        $totalPeriodHours = Carbon::parse($startDate)->diffInHours(Carbon::parse($endDate)->endOfDay());

        $downtimeQuery = WorkOrder::where('company_id', $companyId)
            ->whereIn('status', ['completed', 'closed'])
            ->whereNotNull('downtime_hours')
            ->where('downtime_hours', '>', 0)
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($assetId && $assetId !== 'all') {
            $downtimeQuery->where('asset_id', $assetId);
        }

        // ... (AvailabilityData, FreqData, DurationData - เหมือนเดิม) ...
        $totalDowntime = (clone $downtimeQuery)->sum('downtime_hours');
        $totalUptime = $totalPeriodHours - $totalDowntime;
        $availabilityPercentage = $totalPeriodHours > 0 ? ($totalUptime / $totalPeriodHours) * 100 : 100;
        $availabilityData = [
            ['name' => 'Uptime (Ideal)', 'value' => round($totalUptime, 2), 'fill' => '#22c55e'],
            ['name' => 'Downtime', 'value' => round($totalDowntime, 2), 'fill' => '#ef4444'],
        ];

        $freqData = (clone $downtimeQuery)
            ->select('asset_id', DB::raw('count(*) as count'))
            ->groupBy('asset_id')
            ->with('asset:id,name,asset_code')
            ->orderByDesc('count')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'name' => $item->asset->asset_code,
                'count' => $item->count,
                'fill' => '#ef4444',
            ]);

        $durationData = (clone $downtimeQuery)
            ->select('asset_id', DB::raw('sum(downtime_hours) as total_downtime'))
            ->groupBy('asset_id')
            ->with('asset:id,name,asset_code')
            ->orderByDesc('total_downtime')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'name' => $item->asset->asset_code,
                'hours' => round($item->total_downtime, 2),
                'fill' => '#f97316',
            ]);


        // (7. 👈 [แก้ไข] ดึงข้อมูล Asset สำหรับ Filter)
        $assets = Asset::where('company_id', $companyId)
            ->where('status', 'active')
            // (เรา 'with' Relation ใหม่ เพื่อดึงชื่อคลัง)
            ->with('warehouse:uuid,name')
            // (เราไม่ 'select' location (เก่า) แล้ว)
            ->get(['id', 'name', 'asset_code', 'warehouse_uuid']);

        return Inertia::render('Maintenance/Reports/Downtime', [
            'freqData' => $freqData,
            'durationData' => $durationData,
            'availabilityData' => $availabilityData,
            'availabilityPercentage' => round($availabilityPercentage, 2),
            'assets' => $assets, // (ส่ง Asset list (ใหม่) ไป)
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'asset_id' => $assetId,
            ],
        ]);
    }
}
