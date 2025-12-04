<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse; // (Import)
use TmrEcosystem\Maintenance\Domain\Models\MaintenancePlan;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;

class MaintenanceCalendarController extends Controller
{
    /**
     * (1) แสดงหน้าปฏิทิน (Shell)
     */
    public function index(): Response
    {
        // (เราแค่ Render หน้า React เปล่าๆ)
        return Inertia::render('Maintenance/Calendar/Index');
    }

    /**
     * (2) ส่งข้อมูล Events (API Endpoint)
     * FullCalendar จะส่ง 'start' และ 'end' (วันที่เริ่มต้น/สิ้นสุดของเดือน)
     */
    public function events(Request $request): JsonResponse
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date',
        ]);

        $companyId = $request->user()->company_id;
        $start = $request->input('start');
        $end = $request->input('end');

        // 1. ดึง PM Plans (ที่ยัง Active และถึงกำหนดในเดือนนี้)
        $plans = MaintenancePlan::where('company_id', $companyId)
            ->where('status', 'active')
            ->whereBetween('next_due_date', [$start, $end])
            ->with('asset:id,name')
            ->get();

        // 2. ดึง Work Orders (ที่ยังไม่ Close)
        $workOrders = WorkOrder::where('company_id', $companyId)
            ->where('status', '!=', 'closed')
            ->whereBetween('created_at', [$start, $end]) // (เราใช้ created_at เป็นวันเริ่มงาน)
            ->with('asset:id,name')
            ->get();

        // 3. Format ข้อมูล
        $events = [];

        // (Event สีฟ้าสำหรับ "แผน PM" - เพิ่ม RRULE)
        foreach ($plans as $plan) {
            $events[] = [
                'id' => 'plan_' . $plan->id,
                'title' => "[PM] " . ($plan->asset->name ?? $plan->title),
                'start' => $plan->next_due_date->format('Y-m-d'), // (วันที่เริ่ม)
                'allDay' => true,
                'backgroundColor' => '#3b82f6',
                'borderColor' => '#3b82f6',
                'url' => route('maintenance.plans.show', $plan->id),

                // (นี่คือส่วนที่เพิ่ม - กฎการเกิดซ้ำ)
                'rrule' => [
                    'freq' => 'daily', // (บอกให้เช็คทุกวัน)
                    'interval' => $plan->interval_days, // (ทุกๆ X วัน)
                    'dtstart' => $plan->next_due_date->format('Y-m-d'), // (เริ่มจากวันที่นี้)
                ]
            ];
        }

        // (Event สีแดง/ส้ม สำหรับ "Work Order")
        foreach ($workOrders as $wo) {
            $color = ($wo->status === 'open' || $wo->status === 'assigned') ? '#ef4444' : '#f97316'; // (แดง / ส้ม)

            $events[] = [
                'id' => 'wo_' . $wo->id,
                'title' => "[$wo->work_order_code] " . ($wo->asset->name ?? 'N/A'),
                'start' => $wo->created_at->format('Y-m-d'),
                'allDay' => true,
                'backgroundColor' => $color,
                'borderColor' => $color,
                'url' => route('maintenance.work-orders.show', $wo->id), // (Link ไปหน้า WO)
            ];
        }

        return response()->json($events);
    }
}
