<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            // เพิ่มคอลัมน์ payment_terms ต่อจาก note
            if (!Schema::hasColumn('sales_orders', 'payment_terms')) {
                $table->string('payment_terms')->default('immediate')->after('note');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            $table->dropColumn('payment_terms');
        });
    }
};
