import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';
import { PaginatedResponse, MaintenanceRequest } from '@/types/maintenance'; // (ต้องเพิ่ม Type ใน maintenance.ts)
import { cn } from '@/lib/utils'; // (Import cn utility)

// (Import Shadcn)
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Check, X } from 'lucide-react';
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

/*
|--------------------------------------------------------------------------
| 1. Type Definitions (ย้ายไป maintenance.ts)
|--------------------------------------------------------------------------
*/

interface Props {
    requests: PaginatedResponse<MaintenanceRequest>;
    filters: {
        status: string | null;
    };
}
// (Helper: Format วันที่)
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};
// (Helper: Badge สถานะ)
const StatusBadge = ({ status }: { status: MaintenanceRequest['status'] }) => {
    const variants = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };
    return <Badge className={cn("hover:bg-yellow-100", variants[status])}>{status}</Badge>;
};

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function MaintenanceRequestIndex({ auth, requests, filters }: PageProps & Props) {

    // (ฟังก์ชันสำหรับ Filter)
    const handleFilterChange = (status: string) => {
        router.get(route('maintenance.requests.index'), { status }, {
            preserveState: true,
            replace: true,
        });
    };

    // (ฟังก์ชันสำหรับ Approve/Reject)
    const handleApprove = (id: number) => {
        router.post(route('maintenance.requests.approve', id), {}, {
            preserveScroll: true,
        });
    };
    const handleReject = (id: number) => {
        router.post(route('maintenance.requests.reject', id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">ใบแจ้งซ่อม (Requests)</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="ใบแจ้งซ่อม" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* (Filter Bar) */}
                    <div className="flex justify-end mb-4">
                        <Select value={filters.status || 'all'} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="กรองสถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                                <SelectItem value="pending">Pending (รออนุมัติ)</SelectItem>
                                <SelectItem value="approved">Approved (อนุมัติแล้ว)</SelectItem>
                                <SelectItem value="rejected">Rejected (ปฏิเสธ)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ทรัพย์สิน (Asset)</TableHead>
                                    <TableHead>ปัญหาที่แจ้ง</TableHead>
                                    <TableHead>ผู้แจ้ง</TableHead>
                                    <TableHead>วันที่แจ้ง</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                            ไม่พบข้อมูลใบแจ้งซ่อม
                                        </TableCell>
                                    </TableRow>
                                )}
                                {requests.data.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className="font-medium">{req.asset.asset_code}</div>
                                            <div className="text-sm text-muted-foreground">{req.asset.name}</div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{req.problem_description}</TableCell>
                                        <TableCell>{req.requester.first_name}</TableCell>
                                        <TableCell>{formatDate(req.created_at)}</TableCell>
                                        <TableCell><StatusBadge status={req.status} /></TableCell>

                                        <TableCell className="text-right">
                                            {/* (แสดงปุ่มเฉพาะเมื่อยังเป็น Pending) */}
                                            {req.status === 'pending' && (
                                                <div className="flex gap-1 justify-end">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" className="bg-green-500 hover:bg-green-600">
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>ยืนยันการอนุมัติ</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    คุณต้องการอนุมัติใบแจ้งซ่อมนี้ และสร้างเป็น Work Order ใช่หรือไม่?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleApprove(req.id)} className="bg-green-500 hover:bg-green-600">
                                                                    อนุมัติ
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="destructive">
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>ยืนยันการปฏิเสธ</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    คุณต้องการปฏิเสธใบแจ้งซ่อมนี้ใช่หรือไม่?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleReject(req.id)} className='bg-red-600'>
                                                                    ปฏิเสธ
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* (เพิ่ม Pagination ที่นี่) */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
