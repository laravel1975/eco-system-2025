<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_order_attachments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('work_order_id')
                  ->constrained('work_orders')
                  ->onDelete('cascade');

            $table->string('file_path');
            $table->string('file_name');
            $table->string('description')->nullable();

            // (เชื่อมโยงไปยังตารางของ IAM BC)
            $table->foreignId('uploaded_by_user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null'); // (เก็บไฟล์ไว้ แม้ User ถูกลบ)

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_order_attachments');
    }
};
