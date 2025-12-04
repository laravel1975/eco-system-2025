<?php

namespace TmrEcosystem\Shared\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use TmrEcosystem\Shared\Application\Contracts\PdfServiceInterface;
use TmrEcosystem\Shared\Infrastructure\Services\BrowsershotPdfService;

class SharedServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            PdfServiceInterface::class,
            BrowsershotPdfService::class
        );
    }
}
