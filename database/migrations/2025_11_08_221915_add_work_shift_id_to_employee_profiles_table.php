<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            // (เพิ่มคอลัมน์นี้) ผูกพนักงานกับ "กะทำงาน" เริ่มต้น
            $table->foreignId('work_shift_id')
                  ->nullable()
                  ->after('position_id') // (วางไว้ใกล้ๆ position)
                  ->constrained('work_shifts')
                  ->nullOnDelete(); // (ถ้าลบกะทำงาน ไม่ต้องลบพนักงาน)
        });
    }

    public function down(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropForeign(['work_shift_id']);
            $table->dropColumn('work_shift_id');
        });
    }
};
