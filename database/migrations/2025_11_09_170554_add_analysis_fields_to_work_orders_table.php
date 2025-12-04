<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {

            // (สำหรับ RCA - บทความ #2)
            $table->foreignId('failure_code_id')
                  ->nullable()
                  ->after('priority')
                  ->constrained('failure_codes');

            // (สำหรับ Efficiency - บทความ #3)
            $table->foreignId('activity_type_id')
                  ->nullable()
                  ->after('failure_code_id')
                  ->constrained('activity_types');

            // (สำหรับ Efficiency/MTTR - บทความ #6)
            $table->decimal('downtime_hours', 8, 2)->nullable()
                  ->after('activity_type_id');

            // (สำหรับ Cost/Efficiency - บทความ #6)
            $table->decimal('actual_labor_hours', 8, 2)->nullable()
                  ->after('downtime_hours');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropForeign(['failure_code_id']);
            $table->dropForeign(['activity_type_id']);
            $table->dropColumn(['failure_code_id', 'activity_type_id', 'downtime_hours', 'actual_labor_hours']);
        });
    }
};
