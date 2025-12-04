<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use TmrEcosystem\Maintenance\Domain\Models\Asset;
use TmrEcosystem\Maintenance\Domain\Models\MaintenancePlan;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceRequest;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTechnician;
use TmrEcosystem\Maintenance\Domain\Models\SparePart;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;
use TmrEcosystem\Stock\Infrastructure\Persistence\Eloquent\Models\StockLevelModel;

class MaintenanceDashboardController extends Controller
{
    /**
     * แสดงหน้า Dashboard พร้อม KPI
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        // (1. Work Orders, 2. Request Orders, 3. Technicians, 4. Total Assets)
        // (KPIs เหล่านี้ยังคงทำงานเหมือนเดิม)
        $openWorkOrders = WorkOrder::where('company_id', $companyId)
            ->whereIn('status', ['open', 'assigned', 'in_progress'])
            ->count();
        $pendingRequests = MaintenanceRequest::where('company_id', $companyId)
            ->where('status', 'pending')
            ->count();
        $totalTechnicians = MaintenanceTechnician::where('company_id', $companyId)->count();
        $totalAssets = Asset::where('company_id', $companyId)->where('status', 'active')->count();


        // (5. ▼▼▼ [REFACTORED] Total Spareparts (Low Stock) ▼▼▼)
        // (KPI นี้จะเลิกพึ่งพา 'stock_quantity' (เก่า))
        // (และหันมาอ่าน 'Source of Truth' (Stock BC) โดยตรง)

        // (5a. สร้าง Subquery เพื่อ "คำนวณยอดรวมสต็อกที่แท้จริง" (True Total Stock) จาก Stock BC)
        $stockLevelSumQuery = StockLevelModel::select(
                'item_uuid',
                // (SUM ยอด On Hand จาก "ทุกคลัง" ของ Item นี้)
                DB::raw('SUM(quantity_on_hand) as true_total_stock')
            )
            ->where('company_id', $companyId)
            ->groupBy('item_uuid');

        // (5b. Query 'spare_parts' (เก่า) และ Join กับ "ยอดรวม" (ใหม่))
        $lowStockParts = SparePart::where('spare_parts.company_id', $companyId)
            // (นับเฉพาะอะไหล่ที่ตั้งค่า Reorder Level)
            ->whereNotNull('spare_parts.reorder_level')
            // (นับเฉพาะอะไหล่ที่ "ผูก" กับ Inventory BC แล้ว)
            ->whereNotNull('spare_parts.item_uuid')

            // (Join Subquery โดยใช้ 'item_uuid' เป็นกุญแจเชื่อม)
            ->leftJoinSub($stockLevelSumQuery, 'stock_levels', function ($join) {
                $join->on('spare_parts.item_uuid', '=', 'stock_levels.item_uuid');
            })

            // (เปรียบเทียบ "ยอดรวมที่แท้จริง" (ใหม่) กับ "จุดสั่งซื้อ" (เก่า))
            // (COALESCE: ถ้า Join ไม่เจอ (สต็อก=0) ให้ใช้ 0)
            ->whereColumn(DB::raw('COALESCE(stock_levels.true_total_stock, 0)'), '<=', 'spare_parts.reorder_level')

            ->count();
        // (5. ▲▲▲ [END REFACTOR] ▲▲▲)


        // 6. Total Maintenance Plan (Active) - (ยังคงเหมือนเดิม)
        $activePlans = MaintenancePlan::where('company_id', $companyId)
            ->where('status', 'active')
            ->count();

        // 7. Chart Data: Work Order Status Breakdown - (ยังคงเหมือนเดิม)
        $statusStats = WorkOrder::where('company_id', $companyId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst(str_replace('_', ' ', $item->status)),
                    'value' => $item->count,
                    'fill' => $this->getStatusColor($item->status),
                ];
            });

        // 8. Chart Data: PM vs CM Ratio - (ยังคงเหมือนเดิม)
        $typeStats = WorkOrder::query()
            ->where('work_orders.company_id', $companyId)
            ->join('maintenance_types', 'work_orders.maintenance_type_id', '=', 'maintenance_types.id')
            ->select('maintenance_types.code', DB::raw('count(*) as count'))
            ->groupBy('maintenance_types.code')
            ->get();
        // ... (Logic การ Map PM/CM - เหมือนเดิม) ...
        $pmCount = $typeStats->whereIn('code', ['PM', 'PDM'])->sum('count');
        $cmCount = $typeStats->whereIn('code', ['CM', 'EM'])->sum('count');
        $othersCount = $typeStats->whereNotIn('code', ['PM', 'PDM', 'CM', 'EM'])->sum('count');
        $ratioStats = [
            ['name' => 'Preventive (PM)', 'value' => $pmCount, 'fill' => '#10b981'],
            ['name' => 'Corrective (CM)', 'value' => $cmCount, 'fill' => '#ef4444'],
            ['name' => 'Others', 'value' => $othersCount, 'fill' => '#6b7280'],
        ];
        $ratioStats = array_values(array_filter($ratioStats, fn($item) => $item['value'] > 0));

        // (9. ส่งข้อมูล KPI ที่ "คำนวณใหม่" (lowStockParts) ไปยัง Frontend)
        return inertia('Maintenance/Dashboard/Index', [
            'stats' => [
                'openWorkOrders' => $openWorkOrders,
                'pendingRequests' => $pendingRequests,
                'totalTechnicians' => $totalTechnicians,
                'totalAssets' => $totalAssets,
                'lowStockParts' => $lowStockParts, // (นี่คือ "ยอดจริง" ที่คำนวณใหม่)
                'activePlans' => $activePlans,
            ],
            'statusStats' => $statusStats,
            'ratioStats' => $ratioStats,
        ]);
    }

    // (Helper: สีของสถานะ)
    private function getStatusColor($status)
    {
        return match ($status) {
            'open' => '#3b82f6', // Blue
            'assigned' => '#f59e0b', // Amber
            'in_progress' => '#8b5cf6', // Violet
            'completed' => '#10b981', // Emerald
            'closed' => '#6b7280', // Gray
            default => '#cbd5e1',
        };
    }
}
