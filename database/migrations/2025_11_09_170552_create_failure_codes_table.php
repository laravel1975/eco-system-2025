<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('failure_codes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code');

            // (สำหรับ Hierarchy เช่น Mechanical -> Bearing)
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('failure_codes')
                  ->onDelete('set null'); // (ถ้าลบแม่ ให้ลูกกลายเป็น Top-level)

            $table->foreignId('company_id')->constrained('companies');

            $table->timestamps();

            $table->unique(['company_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failure_codes');
    }
};
