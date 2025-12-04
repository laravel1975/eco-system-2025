import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SalesNavigationMenu from './Partials/SalesNavigationMenu';
import SearchFilter from '@/Components/SearchFilter'; // ✅ นำ Component ที่คุณให้มาใช้
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { MoreHorizontal, Eye, Pencil, Trash2, Plus, FileText } from "lucide-react";
import { debounce } from 'lodash'; // แนะนำให้ลง lodash หรือเขียน debounce fn เอง

// --- Types ---
interface Order {
    id: string;
    order_number: string;
    customer_id: string;
    customer_code: string;
    code: string;
    customer_name: string;
    status: string;
    total_amount: number;
    currency: string;
    created_at: string;
}

interface Props {
    auth: any;
    orders: {
        data: Order[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string;
    };
}

export default function Index({ auth, orders, filters }: Props) {
    // State สำหรับ Search
    const [search, setSearch] = useState(filters.search || '');

    // ฟังก์ชันค้นหาแบบ Debounce (หน่วงเวลา 300ms เพื่อไม่ให้ยิง request ถี่เกินไป)
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            router.get(
                route('sales.orders.index'),
                { search: query },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    // เมื่อค่า search เปลี่ยน ให้เรียก debouncedSearch
    const handleSearchChange = (val: string) => {
        setSearch(val);
        debouncedSearch(val);
    };

    // ฟังก์ชัน Delete
    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this order?')) {
            router.delete(route('sales.orders.destroy', id));
        }
    };

    // Helper: Status Color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-500';
            case 'confirmed': return 'bg-blue-600';
            case 'done': return 'bg-green-600';
            case 'cancelled': return 'bg-red-600';
            default: return 'bg-gray-500';
        }
    };

    // Helper: Currency Format
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: currency || 'THB'
        }).format(amount);
    };

    console.log(orders)

    return (
        <AuthenticatedLayout
            user={auth.user}
            navigationMenu={<SalesNavigationMenu />}
        >
            <Head title="Sales Orders" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* --- Header & Actions --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sales Orders</h2>
                            <p className="text-sm text-muted-foreground">Manage your quotations and orders.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* ปุ่ม Create */}
                            <Button asChild className="bg-purple-700 hover:bg-purple-800">
                                <Link href={route('sales.orders.create')}>
                                    <Plus className="mr-2 h-4 w-4" /> Create Order
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* --- Filters --- */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4">
                        <div className="w-full sm:w-72">
                            {/* ✅ ใช้ SearchFilter Component ตรงนี้ */}
                            <SearchFilter
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search order number, customer..."
                                className="w-full"
                            />
                        </div>
                        {/* สามารถเพิ่ม Filter อื่นๆ เช่น Status Date ตรงนี้ได้ */}
                    </div>

                    {/* --- Data Table --- */}
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-[180px]">Order Number</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.data.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium">
                                                <Link href={route('sales.orders.show', order.id)} className="text-purple-700 hover:underline">
                                                    {order.order_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                                        {/* ใช้ชื่อลูกค้าตัวแรกมาทำ Avatar */}
                                                        {(order.customer_name || 'Unknown').substring(0, 2)}
                                                    </div>
                                                    <div className="flex flex-col-reverse">
                                                        {/* ✅ แสดงชื่อลูกค้าแทน ID */}
                                                        <span className="font-medium text-gray-900">
                                                            {order.customer_name || 'Unknown Customer'}
                                                        </span>
                                                        {/* Optional: แสดงรหัสลูกค้าตัวเล็กๆ ต่อท้าย */}
                                                        <span className="text-xs text-gray-400">{order.customer_code}</span>
                                                    </div>

                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('th-TH')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(order.total_amount, order.currency)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(order.status)} hover:${getStatusColor(order.status)}`}>
                                                    {order.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">

                                                {/* ✅ Action Dropdown Menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                        {/* 1. View Detail */}
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('sales.orders.show', order.id)} className="cursor-pointer flex w-full items-center">
                                                                <Eye className="mr-2 h-4 w-4 text-gray-500" />
                                                                View Detail
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        {/* 2. Edit */}
                                                        <DropdownMenuItem asChild>
                                                            {/* ตรวจสอบว่ามี route edit หรือยัง ถ้าไม่มีให้เปลี่ยนเป็น create ที่ส่ง id */}
                                                            <Link href={route('sales.orders.show', order.id)} className="cursor-pointer flex w-full items-center">
                                                                <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        {/* 3. Delete */}
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(order.id)}
                                                            className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* --- Pagination --- */}
                    <div className="flex items-center justify-between">
                        {/* Simple Pagination Logic */}
                        <div className="flex gap-1">
                            {orders.links.map((link, index) => (
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
                        <div className="text-sm text-gray-500">
                            Page {orders.current_page} of {orders.last_page}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
