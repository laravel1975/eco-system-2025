import React, { useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { debounce } from 'lodash';
import { Search, Truck, Calendar, User, MapPin, ArrowRight, Plus } from "lucide-react";

// Components
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import LogisticsNavigationMenu from '../Partials/LogisticsNavigationMenu';

interface Shipment {
    id: string;
    shipment_number: string;
    vehicle: {
        license_plate: string;
        vehicle_type: string;
    } | null;
    driver_name: string;
    driver_phone: string;
    planned_date: string;
    status: string;
    delivery_notes: any[];
    created_at: string;
}

interface Props {
    auth: any;
    shipments: { data: Shipment[]; links: any[]; total: number };
    filters: { search: string; };
}

export default function ShipmentIndex({ auth, shipments, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            router.get(route('logistics.shipments.index'), { search: query }, { preserveState: true, replace: true });
        }, 300), []
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ready': return <Badge className="bg-blue-600 hover:bg-blue-700">Ready to Go</Badge>;
            case 'in_transit': return <Badge className="bg-orange-500 hover:bg-orange-600">In Transit</Badge>;
            case 'completed': return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
            case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} navigationMenu={<LogisticsNavigationMenu />}>
            <Head title="Shipment Planning" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Truck className="h-6 w-6" /> Shipment Planning
                        </h2>
                        <p className="text-gray-500">จัดการรอบการเดินรถและใบกำกับรถ</p>
                    </div>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                        <Link href={route('logistics.shipments.create')}>
                            <Plus className="w-4 h-4 mr-2" /> Plan New Trip
                        </Link>
                    </Button>
                </div>

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search Shipment #, Driver..."
                                className="pl-8 bg-white"
                                value={search}
                                onChange={e => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Shipment No.</TableHead>
                                <TableHead>Vehicle / Driver</TableHead>
                                <TableHead>Plan Date</TableHead>
                                <TableHead className="text-center">Orders</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shipments.data.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-32 text-gray-500">No shipments found.</TableCell></TableRow>
                            ) : (
                                shipments.data.map((shipment) => (
                                    <TableRow key={shipment.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium text-indigo-600">
                                            {shipment.shipment_number}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium flex items-center gap-1">
                                                    <Truck className="w-3 h-3 text-gray-400" />
                                                    {shipment.vehicle?.license_plate || 'No Vehicle'}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <User className="w-3 h-3" /> {shipment.driver_name || '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(shipment.planned_date).toLocaleDateString('th-TH')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-mono">
                                                {shipment.delivery_notes.length} DOs
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" asChild>
                                                {/* ✅ แก้ไขตรงนี้: ลิงก์ไปหน้า Show (ไม่ใช่ Status) */}
                                                <Link href={route('logistics.shipments.show', shipment.id)}>
                                                    Manage <ArrowRight className="w-3 h-3 ml-1" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-sm text-gray-500">
                        Showing {shipments.data.length} of {shipments.total} trips
                        <div className="flex gap-1">
                            {shipments.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    className={!link.url ? "opacity-50 cursor-not-allowed" : ""}
                                    asChild={!!link.url}
                                    disabled={!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
