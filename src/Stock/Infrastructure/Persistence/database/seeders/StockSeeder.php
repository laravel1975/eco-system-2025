<?php
// run migrations again :: php artisan migrate:refresh --path=src/Stock/Infrastructure/Persistence/database/migrations

namespace TmrEcosystem\Stock\Infrastructure\Persistence\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = 1; // หรือ ID ของบริษัทที่คุณใช้เทส

        // 1. ดึง Warehouse ทั้งหมด
        $warehouses = DB::table('warehouses')->where('company_id', $companyId)->get();

        foreach ($warehouses as $warehouse) {
            // 2. หา/สร้าง Location "GENERAL"
            $location = DB::table('warehouse_storage_locations')
                ->where('warehouse_uuid', $warehouse->uuid)
                ->where('code', 'GENERAL')
                ->first();

            if (!$location) {
                $locationUuid = Str::uuid()->toString();
                DB::table('warehouse_storage_locations')->insert([
                    'uuid' => $locationUuid,
                    'warehouse_uuid' => $warehouse->uuid,
                    'code' => 'GENERAL',
                    'barcode' => 'GENERAL-' . substr($warehouse->uuid, 0, 4),
                    'type' => 'BULK',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $locationUuid = $location->uuid;
            }

            // 3. ดึงสินค้าทั้งหมด
            $items = DB::table('inventory_items')->where('company_id', $companyId)->get();

            foreach ($items as $item) {
                // 4. ยัดสต็อกเข้าไป 100 ชิ้น (Force Insert)
                DB::table('stock_levels')->updateOrInsert(
                    [
                        'company_id' => $companyId,
                        'item_uuid' => $item->uuid,
                        'location_uuid' => $locationUuid,
                    ],
                    [
                        'uuid' => Str::uuid()->toString(),
                        'warehouse_uuid' => $warehouse->uuid,
                        'quantity_on_hand' => 1000, // ✅ เติมของให้เยอะๆ เลย
                        'quantity_reserved' => 0,
                        'quantity_soft_reserved' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
