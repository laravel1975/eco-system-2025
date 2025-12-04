<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            // (สำคัญ) ผูกกับบริษัท (ประเภทการลาแต่ละบริษัทไม่เหมือนกัน)
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();

            $table->string('name'); // เช่น "ลาป่วย", "ลากิจ", "ลาพักร้อน"
            $table->string('code')->nullable()->unique(); // เช่น "SK", "AL"

            $table->boolean('is_paid')->default(true); // (เป็นการลาแบบได้รับค่าจ้างหรือไม่)

            // (โควต้าวันลาต่อปี)
            $table->decimal('max_days_per_year', 5, 2)->nullable(); // (เช่น 30 วัน, 6.5 วัน, null=ไม่จำกัด)

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
