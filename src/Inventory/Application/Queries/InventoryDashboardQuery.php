<?php

namespace TmrEcosystem\Inventory\Application\Queries;

use Illuminate\Support\Facades\DB;

class InventoryDashboardQuery
{
    /**
     * ดึงข้อมูลสรุปสำหรับหน้า Dashboard
     * * @param string $companyId
     * @return array
     */
    public function getStats(string $companyId): array
    {
        // 1. Count Items (ใน Inventory BC เอง)
        $totalItems = DB::table('inventory_items')
            ->where('company_id', $companyId)
            ->whereNull('deleted_at')
            ->count();

        // 2. Count Warehouses (ข้าม BC ไป Warehouse - Query ตรงที่ตารางเพื่อความเร็ว)
        // ข้อดี: ไม่ต้อง import WarehouseModel, ข้อเสีย: ถ้าเปลี่ยนชื่อตารางต้องมาแก้ที่นี่
        $totalWarehouses = DB::table('warehouses')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->count();

        // 3. Calc Stock Value (ข้าม BC ไป Stock)
        // Logic: Join inventory_items กับ stock_levels เพื่อคูณราคา
        $totalStockValue = DB::table('stock_levels')
            ->join('inventory_items', 'stock_levels.item_uuid', '=', 'inventory_items.uuid')
            ->where('stock_levels.company_id', $companyId)
            ->whereNull('stock_levels.deleted_at')
            ->sum(DB::raw('stock_levels.quantity_on_hand * inventory_items.average_cost'));

        // 4. Items No Stock
        // Logic: Item ที่ "ไม่มี Record ใน Stock" หรือ "มีแต่ยอดเป็น 0"
        $itemsNoStock = DB::table('inventory_items')
            ->where('company_id', $companyId)
            ->whereNull('deleted_at')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('stock_levels')
                    ->whereColumn('stock_levels.item_uuid', 'inventory_items.uuid')
                    ->where('stock_levels.quantity_on_hand', '>', 0);
            })
            ->count();

        return [
            'totalItems' => $totalItems,
            'totalWarehouses' => $totalWarehouses,
            'totalStockValue' => (float) $totalStockValue, // แปลงเป็น float เพื่อความชัวร์
            'itemsNoStock' => $itemsNoStock,
        ];
    }
}
