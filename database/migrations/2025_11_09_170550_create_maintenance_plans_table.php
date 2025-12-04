<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('title'); // (เช่น "ตรวจเช็คแอร์รายไตรมาส")

            $table->foreignId('asset_id')->constrained('assets');

            // (ต้องเป็น Type PM/PDM เท่านั้น)
            $table->foreignId('maintenance_type_id')
                  ->constrained('maintenance_types');

            $table->string('status')->default('active')->index();

            // (ประเภทการ Trigger)
            $table->string('trigger_type')->default('TIME')
                  ->comment('TIME, METER, EVENT');

            // (สำหรับ Time-Based)
            $table->integer('interval_days')->nullable();
            $table->date('next_due_date')->nullable()->index(); // (สำคัญมาก)

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_plans');
    }
};
