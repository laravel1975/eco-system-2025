<?php

namespace TmrEcosystem\Logistics\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use TmrEcosystem\Logistics\Application\Listeners\CancelLogisticsDocuments;
use TmrEcosystem\Sales\Domain\Events\OrderConfirmed;
use TmrEcosystem\Sales\Domain\Events\OrderUpdated; // ✅ Import Event
use TmrEcosystem\Logistics\Application\Listeners\CreateLogisticsDocuments;
use TmrEcosystem\Logistics\Application\Listeners\SyncLogisticsDocuments; // ✅ Import Listener
use TmrEcosystem\Sales\Domain\Events\OrderCancelled;

class LogisticsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {

        // โหลด Routes โดยกำหนด Prefix และ Middleware
        $this->bootRoutes();

        // 1. Confirm
        Event::listen(
            OrderConfirmed::class,
            CreateLogisticsDocuments::class
        );

        // 2. Update
        Event::listen(
            OrderUpdated::class,
            SyncLogisticsDocuments::class
        );

        // 3. ✅ Cancel (เพิ่มส่วนนี้)
        Event::listen(
            OrderCancelled::class,
            CancelLogisticsDocuments::class
        );

        // โหลด Migrations (ถ้ามีเฉพาะของ module นี้)
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
    }

    protected function bootRoutes(): void
    {
        Route::middleware(['web', 'auth', 'verified'])
            ->prefix('logistics')
            ->name('logistics.')
            ->group(__DIR__ . '/../../Presentation/Http/Routes/logistics.php');
    }
}
