<?php

namespace TmrEcosystem\Shared\Infrastructure\Services;

use Spatie\Browsershot\Browsershot;
use Illuminate\Support\Facades\Response;
use TmrEcosystem\Shared\Application\Contracts\PdfServiceInterface;

class BrowsershotPdfService implements PdfServiceInterface
{
    public function download(
        string $view,
        array $data,
        string $filename,
        string $paperSize = 'A4',
        string $orientation = 'portrait'
    ) {
        $html = view($view, $data)->render();

        $pdfContent = Browsershot::html($html)
            ->format($paperSize)
            ->landscape($orientation === 'landscape')
            ->margins(10, 10, 10, 10)
            ->showBackground()
            ->waitUntilNetworkIdle()
            ->pdf();

        return Response::streamDownload(
            fn () => print($pdfContent),
            $filename,
            ['Content-Type' => 'application/pdf']
        );
    }
}
