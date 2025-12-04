<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Sarabun', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .barcode { font-family: 'Libre Barcode 128', cursive; }
        .page-break { page-break-inside: avoid; }
    </style>
</head>
<body class="bg-white text-slate-900 text-sm leading-normal">
    <div class="max-w-4xl mx-auto p-8">
        @yield('content')
    </div>
</body>
</html>
