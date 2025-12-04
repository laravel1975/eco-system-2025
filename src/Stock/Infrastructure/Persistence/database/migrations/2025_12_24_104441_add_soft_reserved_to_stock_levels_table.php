<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stock_levels', function (Blueprint $table) {
            // เพิ่ม field soft_reserved ไว้เก็บยอดจองช่วง "รอชำระเงิน/รออนุมัติ"
            // วางต่อจาก quantity_reserved เดิม
            $table->decimal('quantity_soft_reserved', 15, 4)
                  ->default(0)
                  ->after('quantity_reserved')
                  ->comment('ยอดจองแบบ Soft (รอ Payment/Confirm)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_levels', function (Blueprint $table) {
            $table->dropColumn('quantity_soft_reserved');
        });
    }
};
