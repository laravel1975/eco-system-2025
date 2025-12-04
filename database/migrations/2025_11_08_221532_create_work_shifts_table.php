<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_shifts', function (Blueprint $table) {
            $table->id();
            // (สำคัญ) ผูกกับบริษัทสำหรับ Multi-Tenancy
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();

            $table->string('name'); // เช่น "Morning Shift", "Night Shift", "Office Flexible"
            $table->string('code')->nullable()->unique(); // เช่น "MORN", "NIGHT"

            // (รองรับ Flexible Schedule)
            $table->time('start_time')->nullable(); // (อาจเป็น null ถ้า is_flexible = true)
            $table->time('end_time')->nullable();

            // (รองรับ Fixed Schedule)
            // (เช่น กะ 8 ชั่วโมง, กะ 4 ชั่วโมง)
            $table->decimal('work_hours_per_day', 4, 2)->default(8.00);

            $table->boolean('is_flexible')->default(false); // (เป็นกะแบบยืดหยุ่นหรือไม่)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_shifts');
    }
};
