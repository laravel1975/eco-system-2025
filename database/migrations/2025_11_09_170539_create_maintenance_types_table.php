<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->comment('e.g., CM, PM, PDM'); // รหัสสำหรับอ้างอิง
            $table->text('description')->nullable();

            // (เชื่อมโยงกับ Company ที่แชร์กัน)
            $table->foreignId('company_id')->constrained('companies');

            $table->timestamps();

            // (Code และ Company ต้องไม่ซ้ำกัน)
            $table->unique(['company_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_types');
    }
};
