<?php

namespace TmrEcosystem\Shared\Application\Contracts;

interface PdfServiceInterface
{
    public function download(
        string $view,
        array $data,
        string $filename,
        string $paperSize = 'A4',
        string $orientation = 'portrait'
    );
}
