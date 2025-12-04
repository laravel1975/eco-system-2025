<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emergency_contacts', function (Blueprint $table) {
            $table->id();
            // ผูกกับ Profile ของพนักงาน
            $table->foreignId('employee_profile_id')->constrained('employee_profiles')->cascadeOnDelete();

            $table->string('name'); // ชื่อผู้ติดต่อ
            $table->string('relationship'); // ความสัมพันธ์ (เช่น บิดา, มารดา, คู่สมรส)
            $table->string('phone_number');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_contacts');
    }
};
