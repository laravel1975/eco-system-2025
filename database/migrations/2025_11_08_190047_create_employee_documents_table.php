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
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_profile_id')->constrained('employee_profiles')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete(); // (สำหรับ CompanyScope)
            $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('title'); // (ชื่อที่แสดงผล เช่น "สัญญาจ้าง 2024")
            $table->string('document_type'); // (ประเภท เช่น 'contract', 'id_card', 'resume')

            $table->string('file_path'); // (ที่อยู่ไฟล์จริงใน Storage)
            $table->string('file_name'); // (ชื่อไฟล์เดิมที่อัปโหลด)
            $table->unsignedInteger('file_size'); // (ขนาดไฟล์ - bytes)
            $table->string('mime_type'); // (เช่น 'application/pdf')

            $table->date('expires_at')->nullable(); // (สำหรับเอกสารที่มีวันหมดอายุ)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
    }
};
