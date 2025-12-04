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
        Schema::table('employee_profiles', function (Blueprint $table) {
            // (สำคัญ) เพิ่ม 3 คอลัมน์นี้ที่ขาดไป
            // (เราจะเพิ่มไว้หลัง 'user_id' เพื่อความสวยงาม)
            $table->string('first_name')->after('user_id');
            $table->string('last_name')->after('first_name');
            $table->string('job_title')->nullable()->after('last_name');

            // (สำคัญ) แก้ไข user_id ให้นิยามตามตรรกะใหม่
            // จากภาพ `user_id` ของคุณเป็น NULLABLE อยู่แล้ว ซึ่งถูกต้อง!
            // แต่ถ้ามัน NOT NULL ให้รันบรรทัดนี้:
            $table->foreignId('user_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'job_title']);
        });
    }
};
