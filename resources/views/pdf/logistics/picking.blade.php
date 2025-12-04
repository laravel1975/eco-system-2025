@extends('pdf.layouts.document')

@section('content')
    <div class="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div class="flex flex-col justify-between h-full w-1/2">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xl rounded">T</div>
                <div>
                    <h2 class="font-bold text-lg leading-none">TMR EcoSystem</h2>
                    <p class="text-xs text-gray-500 uppercase tracking-wider">Logistics Division</p>
                </div>
            </div>
            <div class="text-sm">
                <p><span class="font-bold">Warehouse:</span> {{ $picking['warehouse_id'] }}</p>
                <p>Date: {{ $picking['date'] }}</p>
            </div>
        </div>

        <div class="w-1/2 text-right flex flex-col items-end">
            <div class="relative mt-2">
                <div class="text-6xl barcode select-none transform scale-y-125 scale-x-90">
                    {{ $picking['picking_number'] }}
                </div>
                <div class="text-center font-mono font-bold text-sm tracking-widest text-black -mt-5">
                    {{ $picking['picking_number'] }}
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-12 mb-8">
        <div>
            <h3 class="text-xs font-bold uppercase text-gray-500 border-b border-black mb-3 pb-1">Order Information</h3>
            <div class="text-sm space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600 font-medium">Order Ref:</span>
                    <span class="font-bold font-mono">{{ $picking['order_number'] }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 font-medium">Picker:</span>
                    <span class="border-b border-dotted border-gray-400">{{ $picking['picker_name'] }}</span>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-xs font-bold uppercase text-gray-500 border-b border-black mb-3 pb-1">Shipping Address</h3>
            <div class="text-sm">
                <p class="font-bold text-lg">{{ $picking['customer_name'] }}</p>
                <p class="mt-1 text-gray-700 leading-relaxed">
                    {{ $picking['shipping_address'] }}
                </p>
            </div>
        </div>
    </div>

    <div class="mb-8">
        <table class="w-full border-collapse text-sm">
            <thead>
                <tr class="border-b-2 border-black">
                    <th class="py-2 text-left font-bold w-10">#</th>
                    <th class="py-2 text-center font-bold w-16">Image</th> <th class="py-2 text-left font-bold">Product Description</th>
                    <th class="py-2 text-left font-bold w-32">Barcode / SKU</th>
                    <th class="py-2 text-center font-bold w-20">Loc.</th>
                    <th class="py-2 text-right font-bold w-20">Qty</th>
                    <th class="py-2 text-center font-bold w-16">Check</th>
                </tr>
            </thead>
            <tbody>
                @foreach($picking['items'] as $index => $item)
                <tr class="border-b border-gray-300 page-break">
                    <td class="py-3 align-top text-gray-500">{{ $index + 1 }}</td>

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
                    <td class="py-3 align-top font-mono text-xs">
                        {{ $item['barcode'] }}
                    </td>
                    <td class="py-3 align-top text-center font-mono text-gray-500">
                        {{ $item['location'] }}
                    </td>
                    <td class="py-3 align-top text-right">
                        <span class="font-bold text-lg">{{ $item['quantity'] }}</span>
                        <span class="text-xs ml-1 font-normal">Units</span>
                    </td>
                    <td class="py-3 align-top text-center">
                        <div class="w-6 h-6 border-2 border-black mx-auto mt-1"></div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="page-break mt-auto">
        <div class="flex justify-end mb-12">
            <div class="w-1/3 border-t border-black pt-2 flex justify-between font-bold">
                <span>Total Items:</span>
                <span>{{ count($picking['items']) }}</span>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-8 pt-4 border-t-2 border-black">
            <div class="text-center">
                <p class="font-bold text-xs uppercase mb-8">Picked By</p>
                <div class="border-b border-black mx-8 mb-2"></div>
                <p class="text-xs">Date: ____/____/____</p>
            </div>
            <div class="text-center">
                <p class="font-bold text-xs uppercase mb-8">Checked By</p>
                <div class="border-b border-black mx-8 mb-2"></div>
                <p class="text-xs">Date: ____/____/____</p>
            </div>
            <div class="text-center">
                <p class="font-bold text-xs uppercase mb-8">Received By</p>
                <div class="border-b border-black mx-8 mb-2"></div>
                <p class="text-xs">Date: ____/____/____</p>
            </div>
        </div>
    </div>
@endsection
