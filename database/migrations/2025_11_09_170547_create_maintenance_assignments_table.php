<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_assignments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('work_order_id')
                  ->constrained('work_orders')
                  ->onDelete('cascade'); // (ลบ Assignment เมื่อ WorkOrder ถูกลบ)

            // (เชื่อมโยงไปยังตารางของ HRM BC)
            $table->foreignId('employee_id')
                  ->constrained('employee_profiles');

            $table->decimal('estimated_hours', 8, 2)->nullable();
            $table->decimal('actual_hours', 8, 2)->nullable();

            $table->timestamps();

            // (ป้องกันการมอบหมายช่างคนเดิมซ้ำในงานเดิม)
            $table->unique(['work_order_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_assignments');
    }
};
