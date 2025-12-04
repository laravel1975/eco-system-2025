<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('maintenance_technicians', function (Blueprint $table) {
            // (เราใช้ 'employee_profile_id' เป็น Primary Key)
            $table->unsignedBigInteger('employee_profile_id')->primary();

            $table->foreignId('company_id')->constrained('companies');
            $table->string('first_name');
            $table->string('last_name');
            $table->decimal('hourly_rate', 10, 2)->nullable();

            $table->timestamps(); // (เก็บไว้ดูว่าข้อมูลอัปเดตล่าสุดเมื่อไหร่)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_technicians');
    }
};
