<?php

namespace App\Providers;

// --- (Import สิ่งที่เราต้องการ) ---
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Failed;
use App\Listeners\UserActivityListener;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use TmrEcosystem\HRM\Domain\Events\EmployeeRateUpdated;
use TmrEcosystem\Maintenance\Application\Listeners\SyncStockToLegacySparePart;
use TmrEcosystem\Maintenance\Application\Listeners\UpdateMaintenanceTechnicianData;
use TmrEcosystem\Sales\Domain\Events\OrderConfirmed;
use TmrEcosystem\Stock\Application\Listeners\ReserveStockOnOrderConfirmed;
use TmrEcosystem\Stock\Domain\Events\StockLevelUpdated;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     * (นี่คือที่ที่ถูกต้องสำหรับลงทะเบียน Listener)
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,

            // (👈 2. เพิ่มการเชื่อมต่อ (Mapping) นี้เข้าไป)
            StockLevelUpdated::class => [
                SyncStockToLegacySparePart::class,
            ],
        ],
        // --- (นี่คือ 3 บรรทัดที่เราต้องการ) ---
        Login::class => [
            UserActivityListener::class,
        ],
        Logout::class => [
            UserActivityListener::class,
        ],
        Failed::class => [
            UserActivityListener::class,
        ],
        OrderConfirmed::class => [
            ReserveStockOnOrderConfirmed::class,
        ],

        /**
         * (HRM Bounded Context)
         * เมื่อ HRM อัปเดตค่าแรงพนักงาน...
         */
        EmployeeRateUpdated::class => [

            /**
             * (Maintenance Bounded Context)
             * ...ให้ Maintenance อัปเดต "สำเนา" ข้อมูล Technician
             */
            UpdateMaintenanceTechnicianData::class,
        ],

    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
