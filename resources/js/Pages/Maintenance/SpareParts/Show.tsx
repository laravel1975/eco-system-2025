import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { SparePart } from '@/types/maintenance'; // (Import Type จาก @/types)

// (Import ShadCN)
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from '@/Components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";

/* --- 1. Types --- */

// (Type ของ StockLevel ที่ดึงมาจาก Stock BC)
interface StockDetail {
    quantity_on_hand: number;
    warehouse: {
        uuid: string;
        name: string;
        code: string;
    };
}

// (Type ของ Pager ที่ Controller ส่งมา)
interface PaginationInfo {
    current_index: number;
    total: number;
    next_sp_id: number | null;
    prev_sp_id: number | null;
}

// (Type ของ Props ทั้งหมด)
interface Props {
    sparePart: SparePart;
    stockDetails: StockDetail[]; // (ยอดสต็อก "จริง" แยกตามคลัง)
    paginationInfo: PaginationInfo; // (Pager)
}

// (Type ของฟอร์ม Adjust Stock)
interface AdjustStockForm {
    warehouse_uuid: string;
    new_quantity: number;
    reason: string;
}

/* --- 2. Helper Components --- */

// (Helper Function สำหรับแสดงผล)
const DetailItem = ({ label, value }: { label: string, value: any }) => (
    <div className="py-3 sm:py-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
    </div>
);

// (SVG Icons สำหรับ Pager)
const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);


/* --- 3. React Component: Show SparePart --- */
export default function ShowSparePart({ auth, sparePart, stockDetails, paginationInfo }: PageProps & Props) {

    // (State สำหรับ Modal 'Adjust Stock')
    const [openAdjust, setOpenAdjust] = useState(false);

    // (useForm สำหรับ Adjust Stock)
    const { data, setData, post, processing, errors } = useForm<AdjustStockForm>({
        warehouse_uuid: '',
        new_quantity: 0,
        reason: '',
    });

    // (ฟังก์ชัน Submit 'Adjust Stock')
    const handleAdjustStock: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('maintenance.spare-parts.adjust-stock', sparePart.id), {
            onSuccess: () => setOpenAdjust(false),
            preserveScroll: true,
        });
    };

    // (Helper: คำนวณยอดรวมจาก ACL)
    const totalStockFromAcl = sparePart.stock_quantity;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">รายละเอียดอะไหล่</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title={sparePart.name} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* (1. 👈 [ใหม่] Pager (ที่ขาดหายไป)) */}
                    <div className="flex justify-between items-center">
                        <Breadcrumbs
                            links={[
                                { label: "จัดการอะไหล่", href: route('maintenance.spare-parts.index') }
                            ]}
                            activeLabel={sparePart.name}
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                {paginationInfo.current_index} / {paginationInfo.total}
                            </span>
                            <Link
                                href={paginationInfo.prev_sp_id ? route('maintenance.spare-parts.show', paginationInfo.prev_sp_id) : '#'}
                                as="button"
                                disabled={!paginationInfo.prev_sp_id}
                                className="p-1.5 rounded-md bg-white border shadow-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                preserveScroll
                            >
                                <ChevronLeftIcon />
                            </Link>
                            <Link
                                href={paginationInfo.next_sp_id ? route('maintenance.spare-parts.show', paginationInfo.next_sp_id) : '#'}
                                as="button"
                                disabled={!paginationInfo.next_sp_id}
                                className="p-1.5 rounded-md bg-white border shadow-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                preserveScroll
                            >
                                <ChevronRightIcon />
                            </Link>
                        </div>
                    </div>

                    {/* (2. 👈 [ใหม่] Card แสดงรายละเอียด) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{sparePart.name}</CardTitle>
                                <CardDescription>{sparePart.part_number}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={route('maintenance.spare-parts.edit', sparePart.id)}>
                                        Edit
                                    </Link>
                                </Button>
                                {/* (ปุ่ม Adjust Stock) */}
                                <AlertDialog open={openAdjust} onOpenChange={setOpenAdjust}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Adjust Stock</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <form onSubmit={handleAdjustStock}>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Adjust Stock Quantity</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    ปรับยอดสต็อก (ที่นับได้จริง) ณ คลังที่เลือก
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>

                                            {/* (ฟอร์ม Adjust Stock) */}
                                            <div className="py-4 space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="warehouse_uuid">Warehouse *</Label>
                                                    <select
                                                        id="warehouse_uuid"
                                                        value={data.warehouse_uuid}
                                                        onChange={(e) => setData('warehouse_uuid', e.target.value)}
                                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                    >
                                                        <option value="">-- เลือกคลัง --</option>
                                                        {stockDetails.map(stock => (
                                                            <option key={stock.warehouse.uuid} value={stock.warehouse.uuid}>
                                                                {`[${stock.warehouse.code}] ${stock.warehouse.name}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <InputError message={errors.warehouse_uuid} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="new_quantity">New Quantity (ยอดที่นับได้) *</Label>
                                                    <Input
                                                        id="new_quantity"
                                                        type="number"
                                                        value={data.new_quantity}
                                                        onChange={(e) => setData('new_quantity', e.target.valueAsNumber)}
                                                    />
                                                    <InputError message={errors.new_quantity} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="reason">Reason *</Label>
                                                    <Input
                                                        id="reason"
                                                        value={data.reason}
                                                        onChange={(e) => setData('reason', e.target.value)}
                                                    />
                                                    <InputError message={errors.reason} />
                                                </div>
                                            </div>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                                                <Button type="submit" disabled={processing}>
                                                    {processing ? 'Saving...' : 'Adjust Stock'}
                                                </Button>
                                            </AlertDialogFooter>
                                        </form>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                <DetailItem label="Description" value={sparePart.description} />
                                <DetailItem label="Location" value={sparePart.location} />
                                <DetailItem label="Unit Cost" value={sparePart.unit_cost} />
                                <DetailItem label="Reorder Level" value={sparePart.reorder_level} />
                            </dl>
                        </CardContent>
                    </Card>

                    {/* (3. 👈 [ใหม่] Card แสดงยอดสต็อก "จริง" แยกตามคลัง) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Details (Source of Truth)</CardTitle>
                            <CardDescription>
                                ยอดสต็อกคงเหลือ "จริง" จาก Inventory Bounded Context (Total: {totalStockFromAcl})
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Warehouse Code</TableHead>
                                            <TableHead>Warehouse Name</TableHead>
                                            <TableHead className="text-right">Quantity On Hand</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockDetails.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-gray-500">
                                                    No stock found in any warehouse.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {stockDetails.map((stock) => (
                                            <TableRow key={stock.warehouse.uuid}>
                                                <TableCell className="font-medium">{stock.warehouse.code}</TableCell>
                                                <TableCell>{stock.warehouse.name}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {stock.quantity_on_hand}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* (4. 👈 [ใหม่] Card แสดงประวัติการใช้งาน) */}
                    {/* (เราจะดึง 'sparePart.workOrderUsages' มาแสดงในอนาคต) */}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
