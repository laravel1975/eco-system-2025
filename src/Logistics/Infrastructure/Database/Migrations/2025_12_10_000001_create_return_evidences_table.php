<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use TmrEcosystem\IAM\Domain\Models\User;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logistics_return_evidences', function (Blueprint $table) {
            $table->id();

            // เชื่อมกับ Return Note
            $table->foreignUuid('return_note_id')
                  ->constrained('logistics_return_notes')
                  ->cascadeOnDelete();

            $table->string('path'); // Path ใน Storage
            $table->string('description')->nullable(); // คำอธิบายรูป (ถ้ามี)

            // เก็บว่าใครเป็นคนถ่ายรูป/อัปโหลด (Audit)
            $table->foreignIdFor(User::class)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics_return_evidences');
    }
};
