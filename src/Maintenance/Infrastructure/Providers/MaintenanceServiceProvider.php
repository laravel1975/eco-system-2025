<?php

namespace TmrEcosystem\Maintenance\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
// (เราไม่จำเป็นต้องโหลด Route ที่นี่ เพราะ Stock BC ไม่มีหน้า UI โดยตรง)

class MaintenanceServiceProvider extends ServiceProvider
{
    /**
     * (3) ลงทะเบียนการ "Bind"
     */
    public function register(): void
    {
        //
    }

    /**
     * (4) "Boot" Bounded Context
     */
    public function boot(): void
    {
        // (4A) บอก Laravel ให้โหลด Migrations จากที่นี่
        $this->loadMigrationsFrom(
            __DIR__ . '/../Persistence/database/migrations'
        );
    }
}
