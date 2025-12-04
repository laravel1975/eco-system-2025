import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';
import { PaginatedResponse, PaginatedLink, Asset } from '@/types/maintenance'; // (สมมติว่า Type อยู่ใน maintenance.ts)

// (1. [ใหม่] Import Shadcn Components)
import { Button } from "@/components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/
// (เราจะใช้ Type จาก @/types/maintenance.ts ที่เราสร้างไว้)
interface Props {
    assets: PaginatedResponse<Asset>;
    filters: {
        search: string | null;
    };
}

/*
|--------------------------------------------------------------------------
| 2. React Component (Refactored)
|--------------------------------------------------------------------------
*/
export default function AssetIndex({ auth, assets, filters }: PageProps & Props) {

    // (Logic การค้นหา - เหมือนเดิม 100%)
    const { data, setData, get } = useForm({
        search: filters.search || '',
    });

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        get(route('maintenance.assets.index'), {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">จัดการทรัพย์สิน (Assets)</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="จัดการทรัพย์สิน" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">

                            {/* (3. [อัปเกรด] Filter Bar และ ปุ่มสร้าง (ใช้ Shadcn)) */}
                            <div className="flex justify-between items-center mb-4">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            className="pl-9" // (เว้นที่ให้ Icon)
                                            value={data.search}
                                            onChange={(e) => setData('search', e.target.value)}
                                            placeholder="ค้นหา (ชื่อ, รหัส)..."
                                        />
                                    </div>
                                    <Button type="submit">ค้นหา</Button>
                                </form>

                                <Button asChild className="bg-green-600 hover:bg-green-700">
                                    <Link href={route('maintenance.assets.create')}>
                                        + สร้างทรัพย์สินใหม่
                                    </Link>
                                </Button>
                            </div>

                            {/* (4. [อัปเกรด] ตาราง (ใช้ Shadcn)) */}
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>รหัสทรัพย์สิน</TableHead>
                                            <TableHead>ชื่อ</TableHead>
                                            <TableHead>ตำแหน่ง</TableHead>
                                            <TableHead>สถานะ</TableHead>
                                            <TableHead>ดำเนินการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assets.data.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-gray-500 h-24">
                                                    ไม่พบข้อมูลทรัพย์สิน
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {assets.data.map((asset) => (
                                            <TableRow key={asset.id}>
                                                <TableCell>{asset.asset_code}</TableCell>
                                                <TableCell>{asset.name}</TableCell>
                                                <TableCell>{asset.location || '-'}</TableCell>
                                                <TableCell>
                                                    {/* (5. [อัปเกรด] Badge (ใช้ Shadcn)) */}
                                                    <Badge
                                                        variant={asset.status === 'active' ? 'default' : 'outline'}
                                                        className={cn(asset.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        )}
                                                    >
                                                        {asset.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('maintenance.assets.show', asset.id)}>ดู</Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('maintenance.assets.edit', asset.id)}>แก้ไข</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* (6. [อัปเกรด] Pagination (ใช้ Shadcn Button)) */}
                            <div className="mt-4">
                                <div className="flex flex-wrap -mb-1">
                                    {assets.meta?.total > 0 && assets.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            className="mr-1 mb-1"
                                            disabled={!link.url}
                                            asChild
                                        >
                                            <Link href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
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
