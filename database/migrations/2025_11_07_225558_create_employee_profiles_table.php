<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();

            // --- 1. ความสัมพันธ์หลัก (สำคัญมาก) ---
            // One-to-One กับ User ของ IAM
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            // ผูกกับบริษัท (สำหรับ Scope)
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            // ผูกกับตำแหน่งและแผนก
            $table->foreignId('position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            // หัวหน้า (สำหรับ Org Chart)
            $table->foreignId('reports_to_user_id')->nullable()->constrained('users')->nullOnDelete();

            // --- 2. ข้อมูลการจ้างงาน (Employment Info) ---
            $table->string('employee_id_no')->nullable()->unique(); // รหัสพนักงาน
            $table->date('join_date'); // วันที่เริ่มงาน
            $table->date('probation_end_date')->nullable(); // วันสิ้นสุดทดลองงาน
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'intern'])->default('full_time');
            $table->enum('employment_status', ['probation', 'confirmed', 'resigned', 'terminated'])->default('probation');
            $table->date('resigned_date')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();

            // --- 3. ข้อมูลส่วนตัว (Personal Info) ---
            $table->string('personal_email')->nullable();
            $table->string('phone_number')->nullable(); // เบอร์ส่วนตัว (ใน IAM อาจเป็นเบอร์ออฟฟิศ)
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address_line_1')->nullable();
            $table->text('address_line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};
