<?php

namespace TmrEcosystem\Inventory\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use TmrEcosystem\Inventory\Application\Queries\InventoryDashboardQuery; // ✅ เรียกใช้ Query Object

class InventoryDashboardController extends Controller
{
    /**
     * (READ) แสดงหน้า Dashboard ของ Inventory
     */
    public function index(Request $request, InventoryDashboardQuery $query): Response
    {
        // เรียกใช้ Query Object เพื่อดึงข้อมูล (ซ่อนความซับซ้อนของ SQL/Join ไว้ข้างหลัง)
        $stats = $query->getStats($request->user()->company_id);

        return Inertia::render('Inventory/Dashboard', [
            'stats' => $stats
        ]);
    }
}
