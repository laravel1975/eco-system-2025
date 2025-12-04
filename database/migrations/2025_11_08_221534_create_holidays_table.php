<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            // (สำคัญ) ผูกกับบริษัท (วันหยุดแต่ละบริษัทไม่เหมือนกัน)
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();

            $table->string('name'); // เช่น "วันขึ้นปีใหม่", "วันแรงงาน"
            $table->date('date'); // วันที่ของวันหยุด
            $table->boolean('is_recurring')->default(true); // (หยุดซ้ำทุกปีหรือไม่)

            $table->timestamps();

            // (ป้องกันการสร้างวันหยุดซ้ำซ้อนในบริษัทเดียวกัน)
            $table->unique(['company_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
