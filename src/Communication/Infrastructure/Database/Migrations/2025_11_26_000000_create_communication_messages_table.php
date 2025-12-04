<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communication_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // --- Who? (ใครโพสต์) ---
            // ให้เป็น Nullable เพราะบางทีระบบ (System) อาจจะเป็นคนโพสต์เอง
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // --- What? (โพสต์อะไร) ---
            $table->text('body');

            // ประเภท: 'comment' (ส่งหาลูกค้า), 'note' (คุยภายใน), 'notification' (ระบบแจ้งเตือน)
            $table->string('type')->default('note')->index();

            // --- Where? (เกาะอยู่กับใคร - Polymorphic) ---
            // model_type เก็บ namespace ของ Model ปลายทาง (เช่น TmrEcosystem\Sales\...)
            // model_id เก็บ UUID หรือ ID ของ record นั้น
            $table->string('model_type');
            $table->uuid('model_id');

            // --- Attachments (ไฟล์แนบ) ---
            // เก็บ path เป็น JSON array ง่ายๆ ไปก่อน
            $table->json('attachments')->nullable();

            $table->timestamps();
            $table->softDeletes(); // เผื่อ User ลบข้อความ

            // Index เพื่อความเร็วในการดึงประวัติของเอกสารนั้นๆ
            $table->index(['model_type', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_messages');
    }
};
