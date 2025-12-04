<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            // เพิ่มหลังจาก customer_id
            $table->uuid('company_id')->after('customer_id')->index()->nullable(); // nullable ไว้ก่อนกันข้อมูลเก่าพัง
            $table->uuid('warehouse_id')->after('company_id')->index()->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            $table->dropColumn(['company_id', 'warehouse_id']);
        });
    }
};
