<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            // (เราจะลบ field ที่เราเคยเพิ่มใน Step 77)
            $table->dropColumn('actual_labor_hours');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->decimal('actual_labor_hours', 8, 2)->nullable()->after('downtime_hours');
        });
    }
};
