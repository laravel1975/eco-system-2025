<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')->group(base_path('routes/iam.php'));
            Route::middleware('web')->group(base_path('routes/hrm.php'));
            Route::middleware('web')->group(base_path('routes/maintenance.php'));

            // นี่คือการ "กำหนดค่า" (Configure) throttle ที่ชื่อ 'login'
            RateLimiter::for('login', function (Request $request) {
                // (ค่าเริ่มต้นคือ 5 ครั้งต่อ 1 นาที)
                return Limit::perMinute(5)->by($request->input('email') . $request->ip());
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->trustProxies('*');

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
