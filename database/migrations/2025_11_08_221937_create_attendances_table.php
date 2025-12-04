<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('employee_profile_id')->constrained('employee_profiles')->cascadeOnDelete();

            // (กะทำงานที่ "ควรจะ" ทำในวันนั้น)
            $table->foreignId('work_shift_id')->nullable()->constrained('work_shifts')->nullOnDelete();

            $table->date('date'); // วันที่ของวันทำงาน

            // (เวลาเข้า-ออก จริง)
            $table->timestamp('clock_in')->nullable();
            $table->timestamp('clock_out')->nullable();

            $table->decimal('total_work_hours', 4, 2)->nullable(); // (สรุปชั่วโมงทำงาน)

            // (สถานะของวันนั้น)
            $table->string('status')->default('absent'); // (absent, present, late, early_leave, on_leave, holiday, wfh)

            // (แหล่งที่มาของข้อมูล)
            $table->string('source')->nullable(); // (manual, biometric, mobile_gps, system_generated)

            // (สำหรับ Req E: Adjustment Workflow)
            $table->text('notes')->nullable(); // (หมายเหตุการแก้ไข)
            $table->foreignId('adjusted_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // (ป้องกันข้อมูลซ้ำซ้อน: พนักงาน 1 คน บันทึกได้ 1 แถว ต่อ 1 วัน)
            $table->unique(['employee_profile_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
