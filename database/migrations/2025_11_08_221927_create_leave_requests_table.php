<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('employee_profile_id')->constrained('employee_profiles')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();

            $table->dateTime('start_datetime'); // (ใช้ dateTime เพื่อรองรับ "ลาครึ่งวัน")
            $table->dateTime('end_datetime');
            $table->decimal('total_days', 5, 2); // (สรุปจำนวนวันลา)

            $table->text('reason')->nullable(); // (เหตุผลการลา)
            $table->string('status')->default('pending'); // (pending, approved, rejected)

            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
