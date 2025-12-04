<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder; // (Import Model)

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->string('work_nature')
                  ->default(WorkOrder::NATURE_INTERNAL)
                  ->after('priority')
                  ->comment('Internal, External, Mixed');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('work_nature');
        });
    }
};
