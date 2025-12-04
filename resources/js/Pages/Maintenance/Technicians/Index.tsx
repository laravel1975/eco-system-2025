import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';
import { PaginatedResponse, PaginatedLink } from '@/types/maintenance';

// (Shadcn UI)
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Search, MoreHorizontal, User, FileText } from 'lucide-react';

/* --- Types --- */
interface Technician {
    employee_profile_id: number;
    first_name: string;
    last_name: string;
    hourly_rate: number;
    updated_at: string;
}

interface Props {
    technicians: PaginatedResponse<Technician>;
    filters: { search: string };
}

export default function TechnicianIndex({ auth, technicians, filters }: PageProps & Props) {

    // (Search Logic)
    const { data, setData, get } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('maintenance.technicians.index'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">รายชื่อช่าง (Technicians)</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="Technicians" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>รายชื่อช่างซ่อมบำรุง</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>

                            {/* (Search Bar) */}
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="relative w-full max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <form onSubmit={handleSearch}>
                                        <Input
                                            type="search"
                                            placeholder="ค้นหาชื่อช่าง..."
                                            className="pl-8"
                                            value={data.search}
                                            onChange={e => setData('search', e.target.value)}
                                        />
                                    </form>
                                </div>
                                <Button type="submit" onClick={handleSearch}>ค้นหา</Button>
                            </div>

                            {/* (Table) */}
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ชื่อ-นามสกุล</TableHead>
                                            <TableHead>ค่าแรง/ชม. (Rate)</TableHead>
                                            <TableHead>อัปเดตล่าสุด</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {technicians.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                    ไม่พบข้อมูลช่าง
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            technicians.data.map((tech) => (
                                                <TableRow key={tech.employee_profile_id}>
                                                    <TableCell className="font-medium flex items-center gap-2">
                                                        <div className="bg-primary/10 p-2 rounded-full">
                                                            <User className="h-4 w-4 text-primary" />
                                                        </div>
                                                        {tech.first_name} {tech.last_name}
                                                    </TableCell>
                                                    <TableCell>฿{Number(tech.hourly_rate).toLocaleString()}</TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {new Date(tech.updated_at).toLocaleDateString('th-TH')}
                                                    </TableCell>
                                                    <TableCell className="text-right">

                                                        {/* (Dropdown Action) */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => {
                                                                    // (ตัวอย่าง: ลิงก์ไปหน้ารายงาน KPI ของคนนี้)
                                                                    window.location.href = route('maintenance.reports.technician', { technician_id: tech.employee_profile_id });
                                                                }}>
                                                                    <FileText className="mr-2 h-4 w-4" /> ดูรายงาน KPI
                                                                </DropdownMenuItem>
                                                                {/* เพิ่มเมนูอื่นๆ ได้ที่นี่ */}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>

                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* (Pagination) */}
                            <div className="mt-4 flex flex-wrap gap-1">
                                {technicians.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        <Link href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>

                        </CardContent>
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
