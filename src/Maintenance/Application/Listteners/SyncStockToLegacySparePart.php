<?php

namespace TmrEcosystem\Maintenance\Application\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue; // (1. ทำงานเบื้องหลัง)
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;

// (2. "ดักฟัง" Event นี้)
use TmrEcosystem\Stock\Domain\Events\StockLevelUpdated;
// (3. "อัปเดต" Model นี้)
use TmrEcosystem\Maintenance\Domain\Models\SparePart;
// (4. "อ่าน" จาก Model นี้)
use TmrEcosystem\Stock\Infrastructure\Persistence\Eloquent\Models\StockLevelModel;


class SyncStockToLegacySparePart implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * นี่คือ "ล่าม" (Anti-Corruption Layer)
     * เมื่อ Stock BC อัปเดต, มันจะ "ซิงค์" ยอดรวมกลับไปที่คอลัมน์เก่า
     */
    public function handle(StockLevelUpdated $event): void
    {
        // (5. ค้นหา "อะไหล่" (เก่า) ที่ผูกกับ "ไอเท็ม" (ใหม่) นี้)
        $sparePart = SparePart::where('item_uuid', $event->itemUuid)
                              ->where('company_id', $event->companyId)
                              ->first();

        if (!$sparePart) {
            // (ถ้าไม่ผูก ก็ไม่ต้องทำอะไร)
            return;
        }

        // (6. (สำคัญ) คำนวณ "ยอดรวม" (SUM) จาก "ทุกคลัง" ใน Stock BC)
        $totalStock = StockLevelModel::where('item_uuid', $event->itemUuid)
                                     ->where('company_id', $event->companyId)
                                     ->sum('quantity_on_hand');

        // (7. อัปเดตคอลัมน์ "เก่า" ด้วย "ยอดรวม" ใหม่)
        // (เราใช้ DB::table เพื่อเลี่ยงการยิง Event ซ้ำซ้อนจาก Model)
        DB::table('spare_parts')
            ->where('id', $sparePart->id)
            ->update(['stock_quantity' => $totalStock]);
    }
}
