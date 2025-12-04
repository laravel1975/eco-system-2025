<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;

class AssetParetoReportController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id;

        // 1. รับ Filters (กรองเฉพาะช่วงวันที่)
        $startDate = $request->input('start_date', now()->subMonths(3)->format('Y-m-d')); // (Default 3 เดือนย้อนหลัง)
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        // 2. Query หลัก: นับใบสั่งซ่อม (WO)
        $query = WorkOrder::where('company_id', $companyId)
            ->whereNotNull('asset_id') // (ไม่นับ WO ที่ไม่ผูก Asset)
            ->whereBetween('created_at', [$startDate, $endDate]);

        // (หาจำนวน WO ทั้งหมดในช่วงเวลานี้ เพื่อคำนวณ % สะสม)
        $totalFailures = (clone $query)->count();

        // 3. จัดกลุ่มตาม Asset และนับจำนวน
        $assetFailureData = (clone $query)
            ->select('asset_id', DB::raw('count(*) as count'))
            ->groupBy('asset_id')
            ->with('asset:id,name,asset_code') // (ดึงชื่อ Asset มาแสดง)
            ->orderByDesc('count')
            ->take(15) // (แสดง Top 15 เครื่องจักรที่มีปัญหา)
            ->get();

        // 4. คำนวณ % สะสม (Pareto Logic)
        $cumulativeCount = 0;
        $chartData = $assetFailureData->map(function ($item) use (&$cumulativeCount, $totalFailures) {
            $cumulativeCount += $item->count;
            return [
                'name' => $item->asset->asset_code, // (แกน X คือ รหัสเครื่องจักร)
                'full_name' => $item->asset->name, // (สำหรับ Tooltip)
                'count' => $item->count,
                'fill' => '#ef4444', // (สีแดง - Breakdown)
                'cumulativePercentage' => $totalFailures > 0
                    ? round(($cumulativeCount / $totalFailures) * 100, 2)
                    : 0,
            ];
        });

        return Inertia::render('Maintenance/Reports/AssetPareto', [
            'chartData' => $chartData,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
