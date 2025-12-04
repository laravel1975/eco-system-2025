import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Paginated } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// (Import ShadCN)
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '@/Components/ui/card';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import { MapPin } from 'lucide-react'; // (Optional: เพิ่ม Icon เพื่อความสวยงาม)
import WarehouseNavigationMenu from './Partials/WarehouseNavigationMenu';

// (1. กำหนด Type ของ DTO: WarehouseIndexData)
interface WarehouseIndexData {
    uuid: string;
    name: string;
    code: string;
    is_active: boolean;
}

// (2. กำหนด Type ของ Props)
interface IndexProps extends PageProps {
    warehouses: Paginated<WarehouseIndexData>;
    filters: {
        search?: string;
    };
}

export default function Index({ auth, warehouses, filters }: IndexProps) {

    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = () => {
        router.get(route('warehouses.index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Warehouses
                </h2>
            }
            navigationMenu={<WarehouseNavigationMenu />}
        >
            <Head title="Warehouses" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Warehouse List</CardTitle>
                            <Button asChild>
                                <Link href={route('warehouses.create')}>
                                    Create Warehouse
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {/* (4. ช่องค้นหา) */}
                            <div className="flex items-center gap-2 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Search by Code or Name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="max-w-sm"
                                />
                                <Button onClick={handleSearch}>Search</Button>
                            </div>

                            {/* (5. ตารางแสดงผล) */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {warehouses.data.length > 0 ? (
                                            warehouses.data.map((wh) => (
                                                <TableRow key={wh.uuid}>
                                                    <TableCell className="font-medium">{wh.code}</TableCell>
                                                    <TableCell>{wh.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={wh.is_active ? 'default' : 'outline'}>
                                                            {wh.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* ✅ Update Entry Point: เพิ่มปุ่มจัดการ Locations */}
                                                    <TableCell className="text-right space-x-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            {/* ลิงก์ไปยังหน้า Manage Locations โดยส่ง UUID ของ Warehouse ไปด้วย */}
                                                            <Link href={route('warehouses.locations.index', wh.uuid)}>
                                                                <MapPin className="mr-2 h-3 w-3" />
                                                                Locations
                                                            </Link>
                                                        </Button>

                                                        {/* ปุ่ม Edit เดิม (Comment ไว้ก่อน) */}
                                                        {/* <Button variant="ghost" size="sm">Edit</Button> */}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                                                    No warehouses found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* (6. Pagination Links) */}
                            <Pagination className="mt-4" links={warehouses.links} />

                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
