<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration นี้ "เพิ่ม" กุญแจเชื่อม (item_uuid) ไปยัง Inventory Bounded Context
 * โดย "ไม่ลบ" stock_quantity (เพื่อให้โค้ดเก่าทำงานได้)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->uuid('item_uuid')
                  ->nullable() // (อนุญาตให้เป็น null)
                  ->index()    // (เพิ่ม Index)
                  ->after('company_id'); // (วางไว้หลัง company_id)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->dropColumn('item_uuid');
        });
    }
};
