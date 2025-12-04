<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_assignments', function (Blueprint $table) {
            // (เก็บค่าแรงต่อชั่วโมง ณ เวลาที่ปิดงาน - เพื่อเป็น Snapshot)
            $table->decimal('recorded_hourly_rate', 10, 2)->nullable()->after('actual_labor_hours');

            // (เก็บต้นทุนรวม = ชั่วโมงจริง * ค่าแรง)
            $table->decimal('labor_cost', 10, 2)->nullable()->after('recorded_hourly_rate');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_assignments', function (Blueprint $table) {
            $table->dropColumn(['recorded_hourly_rate', 'labor_cost']);
        });
    }
};
