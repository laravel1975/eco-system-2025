@extends('pdf.layouts.document')

@section('content')
    <div class="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div class="flex flex-col justify-between h-full w-1/2">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-10 h-10 bg-red-600 text-white flex items-center justify-center font-bold text-xl rounded">T</div>
                <div>
                    <h2 class="font-bold text-lg leading-none">TMR EcoSystem</h2>
                    <p class="text-xs text-gray-500 uppercase tracking-wider">Logistics Division</p>
                </div>
            </div>
            <div class="text-sm">
                <p><span class="font-bold">Date:</span> {{ $returnNote['date'] }}</p>
                <p><span class="font-bold">Status:</span> {{ strtoupper($returnNote['status']) }}</p>
            </div>
        </div>

        <div class="w-1/2 text-right flex flex-col items-end">
            <div class="bg-gray-100 px-3 py-1 rounded mb-2">
                <span class="text-xs font-bold text-red-500 uppercase tracking-wider">RETURN NOTE</span>
            </div>
            <div class="relative mt-2">
                <div class="text-6xl barcode select-none transform scale-y-125 scale-x-90">
                    {{ $returnNote['return_number'] }}
                </div>
                <div class="text-center font-mono font-bold text-sm tracking-widest text-black -mt-5">
                    {{ $returnNote['return_number'] }}
                </div>
            </div>
        </div>
    </div>

    <div class="mb-8 bg-red-50 border border-red-100 rounded p-4">
        <h3 class="text-xs font-bold uppercase text-red-500 mb-1">Reason for Return</h3>
        <p class="text-sm text-gray-800">{{ $returnNote['reason'] }}</p>
    </div>

    <div class="grid grid-cols-2 gap-12 mb-8">
        <div>
            <h3 class="text-xs font-bold uppercase text-gray-500 border-b border-black mb-3 pb-1">Customer</h3>
            <div class="text-sm space-y-1">
                <p class="font-bold text-lg">{{ $returnNote['customer_name'] }}</p>
                <p class="text-gray-600">Order Ref: <span class="font-mono font-bold text-black">{{ $returnNote['order_number'] }}</span></p>
            </div>
        </div>
    </div>

    <div class="mb-8">
        <table class="w-full border-collapse text-sm">
            <thead>
                <tr class="border-b-2 border-black bg-gray-50">
                    <th class="py-2 text-left font-bold w-12 pl-2">#</th>
                    <th class="py-2 text-left font-bold">Description</th>
                    <th class="py-2 text-left font-bold w-32">SKU</th>
                    <th class="py-2 text-right font-bold w-24 pr-4">Qty</th>
                </tr>
            </thead>
            <tbody>
                @foreach($returnNote['items'] as $index => $item)
                <tr class="border-b border-gray-200 page-break">
                    <td class="py-3 pl-2 align-top text-gray-500">{{ $index + 1 }}</td>
                    <td class="py-3 align-top">
                        <div class="font-bold text-base">{{ $item['product_name'] }}</div>
                        @if(!empty($item['image_url']))
                            <img src="{{ $item['image_url'] }}" class="w-10 h-10 object-cover border rounded mt-1">
                        @endif
                    </td>
                    <td class="py-3 align-top font-mono text-xs text-gray-600">
                        {{ $item['product_id'] }}
                    </td>
                    <td class="py-3 align-top text-right pr-4 text-red-600 font-bold">
                        +{{ $item['quantity'] }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if(!empty($returnNote['evidences']) && count($returnNote['evidences']) > 0)
        <div class="mb-10 page-break break-inside-avoid">
            <h3 class="text-xs font-bold uppercase text-gray-500 mb-4 border-b pb-2">Evidence Photos</h3>
            <div class="grid grid-cols-4 gap-4">
                @foreach($returnNote['evidences'] as $url)
                    <div class="aspect-square rounded border bg-gray-50 overflow-hidden">
                        <img src="{{ $url }}" class="w-full h-full object-cover grayscale-[50%]">
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <div class="page-break mt-auto">
        <div class="grid grid-cols-2 gap-12 pt-12 border-t-2 border-black">
            <div class="text-center">
                <p class="font-bold text-xs uppercase mb-12 text-gray-500">Returned By (Customer)</p>
                <div class="border-b border-black mx-8 mb-2"></div>
                <p class="text-xs">Date: ____/____/____</p>
            </div>
            <div class="text-center">
                <p class="font-bold text-xs uppercase mb-12 text-gray-500">Received By (Warehouse)</p>
                <div class="border-b border-black mx-8 mb-2"></div>
                <p class="text-xs">Date: ____/____/____</p>
            </div>
        </div>
    </div>
@endsection
