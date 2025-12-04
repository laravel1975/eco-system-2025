<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('overtime_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('employee_profile_id')->constrained('employee_profiles')->cascadeOnDelete();

            // (เชื่อมโยงกับ "วัน" ที่ทำงาน)
            $table->foreignId('attendance_id')->nullable()->constrained('attendances')->nullOnDelete();

            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('total_hours', 4, 2); // (สรุปชั่วโมง OT)

            // (ประเภทของ OT)
            $table->string('ot_type')->default('normal'); // (normal, weekend, holiday)

            $table->text('reason')->nullable();
            $table->string('status')->default('pending'); // (pending, approved, rejected)

            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('overtime_requests');
    }
};
