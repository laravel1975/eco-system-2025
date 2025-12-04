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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            // ข้อมูลพื้นฐาน
            $table->string('name')->unique();
            $table->string('slug')->unique()->nullable(); // สำหรับ URL หรือ subdomain
            $table->string('registration_no')->nullable(); // เลขทะเบียนบริษัท
            $table->text('description')->nullable(); // รายละเอียดบริษัท / เกี่ยวกับเรา

            // โลโก้และโปรไฟล์
            $table->string('logo')->nullable();
            $table->string('company_profile_path')->nullable(); // เก็บไฟล์ pdf

            // ข้อมูลการติดต่อ
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code')->nullable();

            // การเชื่อมโยงผู้ใช้ (Owner / Created By)
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();

            // การตั้งค่าบริษัทเพิ่มเติม
            $table->json('settings')->nullable(); // เช่น timezone, currency, language

            // สถานะและการควบคุม
            $table->boolean('is_active')->default(true);
            $table->timestamp('verified_at')->nullable();

            // Audit fields
            $table->timestamps();
            $table->softDeletes(); // เพื่อรองรับการลบแบบกู้คืนได้ (soft delete)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
