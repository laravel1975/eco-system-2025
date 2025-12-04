import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, Paginated } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StorageLocation, Warehouse } from '@/types/warehouse'; // (สมมติว่าคุณเก็บ Type ไว้ที่นี่)

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import { ArrowLeft, Plus, MapPin, QrCode } from 'lucide-react';
import WarehouseNavigationMenu from '../Partials/WarehouseNavigationMenu';

interface Props extends PageProps {
    warehouse: Warehouse;
    locations: Paginated<StorageLocation>;
}

export default function LocationIndex({ auth, warehouse, locations }: Props) {

    // Helper: เลือกสี Badge ตาม Type
    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'PICKING': return 'default'; // Blue-ish
            case 'BULK': return 'secondary';  // Gray-ish
            case 'RETURN': return 'destructive'; // Red/Orange
            case 'DAMAGED': return 'destructive';
            case 'INBOUND': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('warehouses.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {warehouse.name} : Locations
                    </h2>
                </div>
            }
            navigationMenu={<WarehouseNavigationMenu />}
        >
            <Head title={`Locations - ${warehouse.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                Storage Locations (Bin Map)
                            </CardTitle>

                            <Button asChild>
                                {/* ลิงก์ไปหน้า Create โดยส่ง warehouse uuid ไปด้วย */}
                                <Link href={route('warehouses.locations.create', warehouse.uuid)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Location
                                </Link>
                            </Button>
                        </CardHeader>

                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[150px]">Location Code</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Barcode (Scan)</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {locations.data.length > 0 ? (
                                            locations.data.map((loc) => (
                                                <TableRow key={loc.uuid}>
                                                    <TableCell className="font-bold font-mono text-primary">
                                                        {loc.code}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getTypeBadgeVariant(loc.type)}>
                                                            {loc.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-gray-500 flex items-center gap-1">
                                                        <QrCode className="h-3 w-3" />
                                                        {loc.barcode}
                                                    </TableCell>
                                                    <TableCell>{loc.description || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm">
                                                            Print Label
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                                                    No locations defined yet. Start mapping your warehouse!
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <Pagination className="mt-4" links={locations.links} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
