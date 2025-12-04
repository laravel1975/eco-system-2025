import React, { useEffect, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MaintenanceType, PaginatedResponse, WorkOrder } from '@/types/maintenance';
import TextInput from '@/Components/TextInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Search, X } from 'lucide-react';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/

interface Props {
    workOrders: PaginatedResponse<WorkOrder>;
    maintenanceTypes: MaintenanceType[];
    filters: {
        search: string | null;
        status: string | null;
        priority: string | null;
        maintenance_type_id: string | null;
    };
}

/*
|--------------------------------------------------------------------------
| 2. Constants (Dropdown Options)
|--------------------------------------------------------------------------
*/
// (เราสามารถ Hardcode สถานะและ Priority ได้ เพราะมันคงที่)
const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

/*
|--------------------------------------------------------------------------
| 3. React Component
|--------------------------------------------------------------------------
*/
export default function WorkOrderIndex({ auth, workOrders, maintenanceTypes, filters }: PageProps & Props) {

    // (2. [ใหม่] ใช้ useState แทน useForm เพื่อคุม Logic การ Debounce)
    const [filterValues, setFilterValues] = useState({
        search: filters.search || '',
        status: filters.status || '',
        priority: filters.priority || '',
        maintenance_type_id: filters.maintenance_type_id || '',
    });

    // (3. [ใหม่] Logic การค้นหาอัตโนมัติ (Debounce) สำหรับช่อง Search)
    useEffect(() => {
        // (เมื่อค่า search ใน filterValues เปลี่ยน...)
        const timeout = setTimeout(() => {
            router.get(
                route('maintenance.work-orders.index'),
                { ...filterValues }, // (ส่งค่า filter ปัจจุบันทั้งหมด)
                { preserveState: true, replace: true }
            );
        }, 500); // (หน่วง 500ms หลังหยุดพิมพ์)

        return () => clearTimeout(timeout); // (Clear timeout ถ้ามีการพิมพ์ใหม่)

    }, [filterValues.search]); // (Trigger effect นี้เฉพาะเมื่อ search เปลี่ยน)


    // (4. [ใหม่] ฟังก์ชันสำหรับ Dropdown (ค้นหาทันที))
    const handleSelectChange = (key: 'status' | 'priority' | 'maintenance_type_id', value: string) => {
        const newFilters = { ...filterValues, [key]: value };
        setFilterValues(newFilters);

        // (ส่งค่า filter ใหม่ไปค้นหาทันที)
        router.get(route('maintenance.work-orders.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    // (5. [ใหม่] ฟังก์ชันล้าง Filter)
    const clearFilters = () => {
        const newFilters = { search: '', status: '', priority: '', maintenance_type_id: '' };
        setFilterValues(newFilters);

        // (ค้นหาใหม่ด้วยค่าว่าง)
        router.get(route('maintenance.work-orders.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
                    user={auth.user}
                    header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Work Orders</h2>}
                    // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
                    navigationMenu={<MaintenanceNavigationMenu />}
                >
            <Head title="ใบสั่งซ่อม" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">

                            {/* (6. [ใหม่] Header แบบในรูป) */}
                            <div className="flex justify-between items-center mb-2">

                                {/* (7. [ใหม่] Filter Bar แบบในรูป (Inline)) */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">

                                    {/* Search Input */}
                                    <div className="relative flex-grow min-w-[250px]">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            value={filterValues.search}
                                            onChange={(e) => setFilterValues(prev => ({ ...prev, search: e.target.value }))}
                                            placeholder="ค้นหา (รหัส, เครื่องจักร)..."
                                            className="pl-9" // (เว้นที่ให้ Icon)
                                        />
                                    </div>

                                    {/* Status Select */}
                                    <Select value={filterValues.status} onValueChange={(value) => handleSelectChange('status', value || '')}>
                                        <SelectTrigger className="w-auto min-w-[150px]">
                                            <SelectValue placeholder="สถานะ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">-- สถานะทั้งหมด --</SelectItem>
                                            {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>

                                    {/* Priority Select */}
                                    <Select value={filterValues.priority} onValueChange={(value) => handleSelectChange('priority', value || '')}>
                                        <SelectTrigger className="w-auto min-w-[150px]">
                                            <SelectValue placeholder="ความสำคัญ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">-- ความสำคัญทั้งหมด --</SelectItem>
                                            {priorityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>

                                    {/* Type Select */}
                                    <Select value={filterValues.maintenance_type_id} onValueChange={(value) => handleSelectChange('maintenance_type_id', value || '')}>
                                        <SelectTrigger className="w-auto min-w-[150px]">
                                            <SelectValue placeholder="ประเภทงาน" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">-- ประเภทงานทั้งหมด --</SelectItem>
                                            {maintenanceTypes.map(type => <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>

                                    {/* Clear Button */}
                                    <Button type="button" variant="destructive" onClick={clearFilters}>
                                        <X className="h-4 w-4 mr-2" />
                                        ล้างค่า
                                    </Button>
                                </div>

                                <Button asChild>
                                    <Link href={route('maintenance.work-orders.create')}>
                                        + สร้างใบสั่งซ่อม
                                    </Link>
                                </Button>
                            </div>

                            {/* (8. ตาราง - (เหมือนเดิม)) */}
                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap">
                                    {/* ... (thead, tbody เหมือนเดิม) ... */}
                                    <thead className="bg-gray-50 border-b">
                                        <tr className="text-left font-bold">
                                            <th className="px-6 py-3">รหัสใบสั่งซ่อม</th>
                                            <th className="px-6 py-3">ทรัพย์สิน</th>
                                            <th className="px-6 py-3">ประเภทงาน</th>
                                            <th className="px-6 py-3">สถานะ</th>
                                            <th className="px-6 py-3">ความสำคัญ</th>
                                            <th className="px-6 py-3">ดำเนินการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workOrders.data.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูลใบสั่งซ่อม</td></tr>
                                        )}
                                        {workOrders.data.map((wo) => (
                                            <tr key={wo.id} className="hover:bg-gray-100 border-b">
                                                <td className="px-6 py-4">{wo.work_order_code}</td>
                                                <td className="px-6 py-4">{wo.asset?.name || 'N/A'}</td>
                                                <td className="px-6 py-4">{wo.maintenance_type?.name || 'N/A'}</td>
                                                <td className="px-6 py-4">{wo.status}</td>
                                                <td className="px-6 py-4">{wo.priority}</td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('maintenance.work-orders.show', wo.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        ดู / จัดการ
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* (Pagination) */}
                            <div className="mt-4">
                                <div className="flex flex-wrap -mb-1">
                                    {workOrders.meta?.total > 0 && workOrders.links.map((link, index) => (
                                        <Link
                                            key={index} href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded ${link.active ? 'bg-indigo-500 text-white' : 'bg-white'} ${!link.url ? '!text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                            as="button" disabled={!link.url}
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
