<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder; // (Import Model)

return new class extends Migration
{
    public function up(): void
    {
        // (เราใช้ change() เพื่อแก้ไขคอลัมน์ที่มีอยู่)
        Schema::table('work_orders', function (Blueprint $table) {
            $table->string('priority')
                  ->default(WorkOrder::PRIORITY_NORMAL) // (P3)
                  ->comment('P1:Emergency, P2:Urgent, P3:Normal, P4:Low')
                  ->change();
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->string('priority')
                  ->default('medium') // (Rollback กลับไปเป็นค่าเก่า)
                  ->comment('')
                  ->change();
        });
    }
};
