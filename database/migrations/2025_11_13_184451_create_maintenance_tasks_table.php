<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_tasks', function (Blueprint $table) {
            $table->id();

            // (ผูกกับ WorkOrder ที่เรามีอยู่แล้ว)
            $table->foreignId('work_order_id')
                  ->constrained('work_orders')
                  ->onDelete('cascade');

            $table->string('task_name');
            $table->text('description')->nullable();
            $table->boolean('is_checked')->default(false); // (สถานะ: ทำเสร็จหรือยัง)
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_tasks');
    }
};
