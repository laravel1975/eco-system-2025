<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // (เช่น Inspection, Replacement, Lubrication)
            $table->string('code'); // (เช่น "INSP", "REPL", "LUB")

            $table->foreignId('company_id')->constrained('companies');

            $table->timestamps();

            $table->unique(['company_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_types');
    }
};
