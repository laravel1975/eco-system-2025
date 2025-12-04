import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Warehouse } from '@/types/warehouse';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// UI Components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'; // (สมมติว่ามี ShadCN Select)
import { Textarea } from '@/Components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import WarehouseNavigationMenu from '../Partials/WarehouseNavigationMenu';

interface Props extends PageProps {
    warehouse: Warehouse;
}

export default function CreateLocation({ auth, warehouse }: Props) {

    // Form Handling
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        barcode: '',
        type: 'PICKING', // Default Value
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Post ไปยัง Route store ที่เราประกาศไว้
        post(route('warehouses.locations.store', warehouse.uuid));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('warehouses.locations.index', warehouse.uuid)}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Create Location : {warehouse.name}
                    </h2>
                </div>
            }
            navigationMenu={<WarehouseNavigationMenu />}
        >
            <Head title="New Location" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Details</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">

                                {/* 1. Location Code */}
                                <div className="space-y-1">
                                    <Label htmlFor="code">Location Code (Human Readable)</Label>
                                    <Input
                                        id="code"
                                        placeholder="e.g. A-01-01-1"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        required
                                    />
                                    {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                    <p className="text-xs text-gray-500">
                                        Format recommendation: Zone-Row-Level-Bin
                                    </p>
                                </div>

                                {/* 2. Barcode */}
                                <div className="space-y-1">
                                    <Label htmlFor="barcode">Barcode (Machine Readable)</Label>
                                    <Input
                                        id="barcode"
                                        placeholder="Leave blank to use Location Code"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                    />
                                    {errors.barcode && <p className="text-sm text-red-500">{errors.barcode}</p>}
                                </div>

                                {/* 3. Type */}
                                <div className="space-y-1">
                                    <Label htmlFor="type">Location Type</Label>
                                    {/* ถ้าไม่ได้ใช้ ShadCN Select ให้ใช้ html select ธรรมดาได้ */}
                                    <select
                                        id="type"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                    >
                                        <option value="PICKING">Picking (จุดหยิบสินค้า)</option>
                                        <option value="BULK">Bulk Storage (สต็อกสำรอง)</option>
                                        <option value="INBOUND">Inbound (จุดรับของ)</option>
                                        <option value="OUTBOUND">Outbound (จุดพักรอส่ง)</option>
                                        <option value="RETURN">Returns (ของรอคืน)</option>
                                        <option value="DAMAGED">Damaged (ของเสีย)</option>
                                    </select>
                                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                                </div>

                                {/* 4. Description */}
                                <div className="space-y-1">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="e.g. Near the main entrance, Top shelf"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </div>

                            </CardContent>

                            <CardFooter className="flex justify-between">
                                <Button variant="ghost" type="button" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Location
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
