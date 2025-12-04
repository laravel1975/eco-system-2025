<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('approval_requests', function (Blueprint $table) {
            // เพิ่มคอลัมน์ JSON สำหรับเก็บข้อมูล snapshot
            $table->json('payload_snapshot')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('approval_requests', function (Blueprint $table) {
            $table->dropColumn('payload_snapshot');
        });
    }
};
