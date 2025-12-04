<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_assignments', function (Blueprint $table) {


            // (1. [สำคัญ] ลบ Foreign Key ทั้ง 2 ตัวก่อน)
            // (เราจะใช้ array syntax ที่ง่ายกว่า)
            $table->dropForeign(['work_order_id']);
            $table->dropForeign(['employee_id']);
            // (2. [สำคัญ] ลบ UNIQUE INDEX)
            $table->dropUnique(['work_order_id', 'employee_id']);
            // (3. ลบ COLUMN)
            $table->dropColumn('employee_id');
            // (เพิ่มคอลัมน์ใหม่ - ถูกต้องแล้ว)
            $table->string('assignable_type')->after('work_order_id');
            $table->unsignedBigInteger('assignable_id')->after('assignable_type');
            $table->decimal('actual_labor_hours', 8, 2)->nullable()->after('actual_hours');
            $table->index(['assignable_type', 'assignable_id']);

            // (4. [สำคัญ] สร้าง Foreign Key 'work_order_id' กลับคืนมา)
            $table->foreign('work_order_id')
                  ->references('id')
                  ->on('work_orders')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_assignments', function (Blueprint $table) {
            // (ลบของใหม่)
            $table->dropForeign(['work_order_id']); // (ลบ FK ที่สร้างใน up())
            $table->dropIndex(['assignable_type', 'assignable_id']);
            $table->dropColumn(['assignable_type', 'assignable_id', 'actual_labor_hours']);

            // (สร้างของเก่ากลับคืน)
            $table->foreignId('employee_id')->constrained('employee_profiles');
            $table->foreign('work_order_id') // (สร้าง FK 'work_order_id' เก่า)
                  ->references('id')
                  ->on('work_orders');

            $table->unique(['work_order_id', 'employee_id']);
        });
    }
};
