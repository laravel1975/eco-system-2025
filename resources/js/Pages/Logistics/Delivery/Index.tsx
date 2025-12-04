import React, { useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { debounce } from 'lodash';
import { Search, Truck, MapPin, ArrowRight, PackageCheck, Clock } from "lucide-react";

// Components
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent } from "@/Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import InventoryNavigationMenu from '@/Pages/Inventory/Partials/InventoryNavigationMenu';

interface DeliveryNote {
    id: string;
    delivery_number: string;
    order_number: string;
    customer_name: string;
    shipping_address: string;
    status: string;
    tracking_number?: string;
    carrier_name?: string;
    created_at: string;
}

interface Props {
    auth: any;
    deliveries: { data: DeliveryNote[]; links: any[]; total: number };
    filters: { search: string; };
}

export default function DeliveryIndex({ auth, deliveries, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            router.get(route('logistics.delivery.index'), { search: query }, { preserveState: true, replace: true });
        }, 300), []
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'wait_operation': return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200"><Clock className="w-3 h-3 mr-1" /> Waiting Picking</Badge>;
            case 'ready_to_ship': return <Badge className="bg-blue-600 hover:bg-blue-700">Ready to Ship</Badge>;
            case 'shipped': return <Badge className="bg-indigo-600 hover:bg-indigo-700">Shipped</Badge>;
            case 'delivered': return <Badge className="bg-green-600 hover:bg-green-700">Delivered</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} navigationMenu={<InventoryNavigationMenu />}>
            <Head title="Delivery Operations" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Truck className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm text-gray-500">Ready to Ship</p>
                                <h3 className="text-2xl font-bold">{deliveries.data.filter(d => d.status === 'ready_to_ship').length}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    {/* เพิ่ม Stat อื่นๆ เช่น Shipped Today ได้ที่นี่ */}
                </div>

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    {/* Search & Filter Bar */}
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <PackageCheck className="w-5 h-5 text-gray-500" />
                            Delivery Orders
                        </h2>
                        <div className="flex gap-2">
                            <div className="relative w-72">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search DO#, SO# or Customer..."
                                    className="pl-8 bg-white"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>DO Number</TableHead>
                                <TableHead>Source Doc</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Carrier / Tracking</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deliveries.data.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center h-32 text-gray-500">No delivery orders found.</TableCell></TableRow>
                            ) : (
                                deliveries.data.map((dn) => (
                                    <TableRow key={dn.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium text-indigo-600">
                                            <Link href={route('logistics.delivery.show', dn.id)}>
                                                {dn.delivery_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{dn.order_number}</TableCell>
                                        <TableCell className="font-medium">{dn.customer_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-start gap-1 text-xs text-gray-500 max-w-[250px]" title={dn.shipping_address}>
                                                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                                <span className="truncate">{dn.shipping_address}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {dn.carrier_name ? (
                                                <div className="text-sm">
                                                    <span className="font-semibold">{dn.carrier_name}</span>
                                                    <div className="text-xs text-gray-500 font-mono">{dn.tracking_number || '-'}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(dn.status)}</TableCell>
                                        <TableCell className="text-right">
                                            {/* แสดงปุ่ม Process เฉพาะเมื่อสถานะพร้อมส่ง */}
                                            {dn.status === 'ready_to_ship' ? (
                                                <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
                                                    <Link href={route('logistics.delivery.process', dn.id)}> {/* ต้องสร้าง Route นี้ */}
                                                        Ship Now <ArrowRight className="w-3 h-3" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={route('logistics.delivery.process', dn.id)}>
                                                        View Detail
                                                    </Link>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination (ถ้ามี) */}
                    <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-sm text-gray-500">
                        Showing {deliveries.data.length} of {deliveries.total} orders
                        {/* Add Pagination Links Here */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
