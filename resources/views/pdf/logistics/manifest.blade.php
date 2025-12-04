<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Shipment Manifest - {{ $shipment['shipment_number'] }}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        body {
            font-family: 'Sarabun', sans-serif;
            font-size: 14px;
            color: #1f2937;
        }
        @page {
            size: A4;
            margin: 1cm;
        }
        .page-break {
            page-break-after: always;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 8px;
            border: 1px solid #e5e7eb;
        }
        th {
            background-color: #f9fafb;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
        }
    </style>
</head>
<body class="bg-white p-4">

    <div class="flex justify-between items-start mb-8 border-b pb-6">
        <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gray-900 text-white flex items-center justify-center font-bold text-2xl rounded">T</div>
            <div>
                <h1 class="text-2xl font-bold text-gray-900">SHIPMENT MANIFEST</h1>
                <p class="text-sm text-gray-500 uppercase tracking-wider">ใบกำกับรถขนส่งสินค้า</p>
            </div>
        </div>
        <div class="text-right">
            <div class="text-3xl font-mono font-bold text-gray-900">{{ $shipment['shipment_number'] }}</div>
            <div class="text-gray-500 mt-1">Date: {{ $shipment['date'] }}</div>
        </div>
    </div>

    <div class="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100">
        <div class="grid grid-cols-2 gap-8">
            <div>
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Driver & Vehicle</h3>
                <p class="font-bold text-lg text-gray-800">{{ $shipment['driver_name'] }}</p>
                <p class="text-gray-600 flex items-center gap-2">
                    <span>📞 {{ $shipment['driver_phone'] }}</span>
                </p>
                <p class="mt-2 text-sm text-gray-600 bg-white inline-block px-3 py-1 rounded border border-gray-200">
                    🚚 {{ $shipment['vehicle'] }}
                </p>
            </div>
            <div class="text-right">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trip Summary</h3>
                <p class="text-gray-600"><span class="font-bold text-gray-900">{{ $shipment['total_drops'] }}</span> Deliveries</p>
                @if($shipment['notes'])
                    <div class="mt-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-100 text-left">
                        <strong>Note:</strong> {{ $shipment['notes'] }}
                    </div>
                @endif
            </div>
        </div>
    </div>

    <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            📦 Delivery List (รายการจุดส่งของ)
        </h3>
        <table>
            <thead>
                <tr>
                    <th class="w-12 text-center">#</th>
                    <th class="w-32 text-left">DO Number</th>
                    <th class="text-left">Customer & Destination</th>
                    <th class="w-20 text-center">Items</th>
                    <th class="w-32 text-center">Signature</th>
                </tr>
            </thead>
            <tbody>
                @foreach($shipment['deliveries'] as $index => $delivery)
                <tr>
                    <td class="text-center font-bold text-gray-500">{{ $index + 1 }}</td>
                    <td class="font-mono font-bold text-indigo-700">
                        {{ $delivery['delivery_number'] }}
                        <div class="text-[10px] text-gray-400 font-normal mt-1">{{ $delivery['order_number'] }}</div>
                    </td>
                    <td>
                        <div class="font-bold text-gray-800">{{ $delivery['customer_name'] }}</div>
                        <div class="text-sm text-gray-500 mt-1 leading-snug">{{ $delivery['address'] }}</div>
                    </td>
                    <td class="text-center font-bold text-gray-700">{{ $delivery['total_items'] }}</td>
                    <td>
                        <div class="h-12"></div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-12">
        <div class="grid grid-cols-3 gap-12">
            <div class="text-center">
                <div class="border-b-2 border-gray-300 mb-2 h-16"></div>
                <p class="text-xs font-bold text-gray-400 uppercase">Released By (Warehouse)</p>
            </div>
            <div class="text-center">
                <div class="border-b-2 border-gray-300 mb-2 h-16"></div>
                <p class="text-xs font-bold text-gray-400 uppercase">Driver (Received By)</p>
            </div>
            <div class="text-center">
                <div class="border-b-2 border-gray-300 mb-2 h-16"></div>
                <p class="text-xs font-bold text-gray-400 uppercase">Security Check</p>
            </div>
        </div>
        <div class="text-center mt-8 text-[10px] text-gray-300">
            Generated by TMR EcoSystem • Logistics Module • Page 1 of 1
        </div>
    </div>

</body>
</html>
