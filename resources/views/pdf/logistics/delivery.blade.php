@extends('pdf.layouts.document')

@section('content')
    <div class="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div class="flex flex-col justify-between h-full w-1/2">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-10 h-10 bg-orange-600 text-white flex items-center justify-center font-bold text-xl rounded">T</div>
                <div>
                    <h2 class="font-bold text-lg leading-none">TMR EcoSystem</h2>
                    <p class="text-xs text-gray-500 uppercase tracking-wider">Logistics Division</p>
                </div>
            </div>
            <div class="text-sm">
                <p><span class="font-bold">Date:</span> {{ $delivery['date'] }}</p>
                @if(!empty($delivery['carrier_name']))
                    <p><span class="font-bold">Carrier:</span> {{ $delivery['carrier_name'] }}</p>
                    <p><span class="font-bold">Tracking:</span> {{ $delivery['tracking_number'] }}</p>
                @endif
            </div>
        </div>

        <div class="w-1/2 text-right flex flex-col items-end">
            <div class="bg-gray-100 px-3 py-1 rounded mb-2">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">DELIVERY NOTE</span>
            </div>
            <div class="relative mt-2">
                <div class="text-6xl barcode select-none transform scale-y-125 scale-x-90">
                    {{ $delivery['delivery_number'] }}
                </div>
                <div class="text-center font-mono font-bold text-sm tracking-widest text-black -mt-5">
                    {{ $delivery['delivery_number'] }}
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-12 mb-8">
        <div>
            <h3 class="text-xs font-bold uppercase text-gray-500 border-b border-black mb-3 pb-1">Customer</h3>
            <div class="text-sm space-y-1">
                <p class="font-bold text-lg">{{ $delivery['customer_name'] }}</p>
                <p class="text-gray-600">Order Ref: <span class="font-mono font-bold text-black">{{ $delivery['order_number'] }}</span></p>
                @if(!empty($delivery['contact_person']))
                    <p class="text-gray-600">Contact: {{ $delivery['contact_person'] }}</p>
                @endif
                @if(!empty($delivery['contact_phone']))
                    <p class="text-gray-600">Tel: {{ $delivery['contact_phone'] }}</p>
                @endif
            </div>
        </div>

        <div>
            <h3 class="text-xs font-bold uppercase text-gray-500 border-b border-black mb-3 pb-1">Shipping Address</h3>
            <div class="text-sm text-gray-700 leading-relaxed">
                {{ $delivery['shipping_address'] }}
            </div>
        </div>
    </div>

    <div class="mb-8">
        <table class="w-full border-collapse text-sm">
            <thead>
                <tr class="border-b-2 border-black bg-gray-50">
                    <th class="py-2 text-left font-bold w-10 pl-2">#</th>
                    <th class="py-2 text-center font-bold w-16">Image</th> <th class="py-2 text-left font-bold">Description</th>
                    <th class="py-2 text-left font-bold w-32">SKU</th>
                    <th class="py-2 text-right font-bold w-24 pr-4">Shipped Qty</th>
                </tr>
            </thead>
            <tbody>
                @foreach($delivery['items'] as $index => $item)
                <tr class="border-b border-gray-200 page-break">
                    <td class="py-3 pl-2 align-top text-gray-500">{{ $index + 1 }}</td>

                    <td class="py-3 align-top text-center">
                        @if(!empty($item['image_url']))
                            <img src="{{ $item['image_url'] }}" class="w-12 h-12 object-contain border rounded bg-white mx-auto">
                        @else
                            <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 mx-auto border">No Img</div>
                        @endif
                    </td>

                    <td class="py-3 align-top">
                        <div class="font-bold text-base">{{ $item['product_name'] }}</div>
                        @if(!empty($item['description']))
                            <div class="text-xs text-gray-500 mt-0.5">{{ Str::limit($item['description'], 100) }}</div>
                        @endif
                    </td>
                    <td class="py-3 align-top font-mono text-xs text-gray-600">
                        {{ $item['product_id'] }}
                    </td>
                    <td class="py-3 align-top text-right pr-4">
                        <span class="font-bold text-lg">{{ $item['quantity'] }}</span>
                        <span class="text-xs ml-1 font-normal">Units</span>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="page-break mt-auto">
        <div class="grid grid-cols-2 gap-12 pt-12 border-t-2 border-black">
            <div class="text-center">
                <p class="font-bold text-xs uppercase mb-12 text-gray-500">Delivered By</p>
                <div class="border-b border-black mx-8 mb-2"></div>
                <p class="text-xs">Date: ____/____/____</p>
            </div>
            <div class="text-center">
                <p class="font-bold text-xs uppercase mb-12 text-gray-500">Received By (Sign & Stamp)</p>
                <div class="border-b border-black mx-8 mb-2"></div>
                <p class="text-xs">Date: ____/____/____</p>
            </div>
        </div>
    </div>
@endsection
