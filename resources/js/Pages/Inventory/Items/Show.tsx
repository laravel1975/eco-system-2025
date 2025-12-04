import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryNavigationMenu from '../Partials/InventoryNavigationMenu';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import {
    ArrowLeft, Edit, Trash2, Box,
    ArrowDownToLine, ArrowUpFromLine, TrendingUp,
    Tag, DollarSign, Ruler, Package
} from 'lucide-react';
import ImageViewer from '@/Components/ImageViewer';

// --- Types ---
interface StockData {
    on_hand: number;
    incoming: number;
    outgoing: number;
    forecast: number;
}

interface ItemDetail {
    uuid: string;
    part_number: string;
    name: string;
    description: string | null;
    average_cost: number;
    category_name: string;
    uom_name: string;
    images: string[];
    created_at: string;
    stock: StockData; // ✅ รับข้อมูล Stock
}

interface PaginationInfo {
    current_index: number;
    total: number;
    prev_uuid: string | null;
    next_uuid: string | null;
}

interface Props extends PageProps {
    item: ItemDetail;
    paginationInfo: PaginationInfo;
}

// --- Sub-component: Stock Card ---
const StockCard = ({ label, value, icon: Icon, color = "text-gray-900", bg = "bg-white" }: any) => (
    <div className={`p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center gap-2 ${bg}`}>
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${color}`}>
            <Icon className="w-4 h-4" />
            {label}
        </div>
        <div className={`text-3xl font-mono font-bold ${color}`}>
            {value}
        </div>
    </div>
);

export default function Show({ auth, item, paginationInfo }: Props) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('inventory.items.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Product Details
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('inventory.items.edit', item.uuid)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </Link>
                        </Button>
                    </div>
                </div>
            }
            navigationMenu={<InventoryNavigationMenu />}
        >
            <Head title={item.name} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Pagination / Navigation Bar */}
                <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('inventory.items.index')}
                            className="hover:text-indigo-600 transition-colors"
                        >
                            Products
                        </Link>
                        <span>/</span>
                        <span className="font-semibold text-gray-900">{item.part_number}</span>
                    </div>

                    <div className="flex items-center bg-white rounded-md border shadow-sm p-1">
                        <div className="px-3 py-1 border-r text-xs font-medium">
                            {paginationInfo.current_index} / {paginationInfo.total}
                        </div>
                        <Link
                            href={paginationInfo.prev_uuid ? route('inventory.items.show', paginationInfo.prev_uuid) : '#'}
                            className={`px-2 py-1 hover:bg-gray-50 transition-colors ${!paginationInfo.prev_uuid && 'opacity-50 pointer-events-none'}`}
                        >
                            ‹
                        </Link>
                        <Link
                            href={paginationInfo.next_uuid ? route('inventory.items.show', paginationInfo.next_uuid) : '#'}
                            className={`px-2 py-1 hover:bg-gray-50 transition-colors ${!paginationInfo.next_uuid && 'opacity-50 pointer-events-none'}`}
                        >
                            ›
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Images */}
                    <div className="lg:col-span-1">
                        <Card className="overflow-hidden border-0 shadow-md">
                            <CardContent className="p-0">
                                <div className="aspect-square bg-white flex items-center justify-center p-4">
                                    {item.images.length > 0 ? (
                                        <ImageViewer
                                            images={item.images}
                                            className="w-full h-full object-contain rounded-lg"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-300">
                                            <Package className="w-20 h-20 mb-2" strokeWidth={1} />
                                            <span className="text-sm">No Image Available</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Info & Stock */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Header Info */}
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-gray-500 border-gray-300">
                                            {item.category_name}
                                        </Badge>
                                        {/* แสดงสถานะสินค้าตาม Stock */}
                                        {(item.stock?.on_hand ?? 0) <= 0 ? (
                                            <Badge variant="destructive">Out of Stock</Badge>
                                        ) : (
                                            <Badge className="bg-green-600 hover:bg-green-700">In Stock</Badge>
                                        )}
                                    </div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{item.name}</h1>
                                    <p className="text-lg font-mono text-gray-500">{item.part_number}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-indigo-600">
                                        {item.average_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-1">Average Cost</div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Stock Availability Cards */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Box className="w-4 h-4" /> Stock Availability
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* ✅ FIX: ใช้ Optional Chaining (?.) และ Null Coalescing (??) เพื่อป้องกัน Error */}
                                <StockCard
                                    label="On Hand"
                                    value={item.stock?.on_hand?.toLocaleString() ?? '0'}
                                    icon={Box}
                                />
                                <StockCard
                                    label="Incoming"
                                    value={item.stock?.incoming?.toLocaleString() ?? '0'}
                                    icon={ArrowDownToLine}
                                    color="text-blue-600"
                                    bg="bg-blue-50"
                                />
                                <StockCard
                                    label="Outgoing"
                                    value={item.stock?.outgoing?.toLocaleString() ?? '0'}
                                    icon={ArrowUpFromLine}
                                    color="text-orange-600"
                                    bg="bg-orange-50"
                                />
                                <StockCard
                                    label="Forecast"
                                    value={item.stock?.forecast?.toLocaleString() ?? '0'}
                                    icon={TrendingUp}
                                    color="text-green-600"
                                    bg="bg-green-50"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Specifications */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Specifications</h3>
                            <div className="bg-gray-50 rounded-lg border p-6 grid grid-cols-2 gap-y-6 gap-x-12">
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500 flex items-center gap-2"><Tag className="w-4 h-4" /> Category</span>
                                    <span className="font-medium text-gray-900">{item.category_name}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500 flex items-center gap-2"><Ruler className="w-4 h-4" /> Unit</span>
                                    <span className="font-medium text-gray-900">{item.uom_name}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Costing</span>
                                    <span className="font-medium text-gray-900">Average (AVCO)</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500 flex items-center gap-2"><Package className="w-4 h-4" /> Type</span>
                                    <span className="font-medium text-gray-900">Storable Product</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {item.description && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
                                <div className="bg-white p-4 rounded-lg border text-gray-600 leading-relaxed">
                                    {item.description}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
