<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_order_spare_parts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('work_order_id')
                  ->constrained('work_orders')
                  ->onDelete('cascade');

            $table->foreignId('spare_part_id')
                  ->constrained('spare_parts');
                  
            $table->integer('quantity_used');

            $table->decimal('unit_cost_at_time', 10, 2)
                  ->comment('บันทึกต้นทุน ณ เวลาที่ใช้');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_order_spare_parts');
    }
};
