import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Plus, Search, Pencil, Trash2, Truck } from "lucide-react";
import LogisticsNavigationMenu from '../Partials/LogisticsNavigationMenu';

export default function VehicleIndex({ auth, vehicles, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        license_plate: '',
        brand: '',
        vehicle_type: 'truck_4w',
        ownership_type: 'own',
        driver_name: '',
        driver_phone: '',
        status: 'active'
    });

    const openCreateModal = () => {
        setEditingId(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (vehicle: any) => {
        setEditingId(vehicle.id);
        setData({
            license_plate: vehicle.license_plate,
            brand: vehicle.brand,
            vehicle_type: vehicle.vehicle_type,
            ownership_type: vehicle.ownership_type,
            driver_name: vehicle.driver_name,
            driver_phone: vehicle.driver_phone,
            status: vehicle.status
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('logistics.vehicles.update', editingId), { onSuccess: () => setIsModalOpen(false) });
        } else {
            post(route('logistics.vehicles.store'), { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this vehicle?')) {
            router.delete(route('logistics.vehicles.destroy', id));
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('logistics.vehicles.index'), { search }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} navigationMenu={<LogisticsNavigationMenu/>}>
            <Head title="Vehicle Management" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Truck className="h-6 w-6" /> Fleet Management
                        </h2>
                        <p className="text-gray-500">จัดการข้อมูลรถและพนักงานขับรถ</p>
                    </div>
                    <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                    </Button>
                </div>

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <form onSubmit={handleSearch} className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search license plate or driver..."
                                className="pl-8 bg-white"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </form>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>License Plate</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Ownership</TableHead>
                                <TableHead>Driver Info</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.data.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24 text-gray-500">No vehicles found.</TableCell></TableRow>
                            ) : (
                                vehicles.data.map((vehicle: any) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell className="font-medium">
                                            {vehicle.license_plate}
                                            <div className="text-xs text-gray-400">{vehicle.brand}</div>
                                        </TableCell>
                                        <TableCell className="capitalize">{vehicle.vehicle_type.replace('_', ' ')}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={vehicle.ownership_type === 'own' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
                                                {vehicle.ownership_type === 'own' ? 'รถบริษัท' : 'รถร่วม/เช่า'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{vehicle.driver_name || '-'}</div>
                                            <div className="text-xs text-gray-500">{vehicle.driver_phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={vehicle.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}>{vehicle.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(vehicle)}><Pencil className="w-4 h-4 text-gray-600" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Create/Edit Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>License Plate *</Label>
                                    <Input value={data.license_plate} onChange={e => setData('license_plate', e.target.value)} placeholder="1กข-1234" />
                                    {errors.license_plate && <p className="text-red-500 text-xs">{errors.license_plate}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Brand / Model</Label>
                                    <Input value={data.brand} onChange={e => setData('brand', e.target.value)} placeholder="Toyota Hilux" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={data.vehicle_type} onValueChange={v => setData('vehicle_type', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="truck_4w">รถกระบะ 4 ล้อ</SelectItem>
                                            <SelectItem value="truck_6w">รถบรรทุก 6 ล้อ</SelectItem>
                                            <SelectItem value="bike">มอเตอร์ไซค์</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ownership</Label>
                                    <Select value={data.ownership_type} onValueChange={v => setData('ownership_type', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="own">รถบริษัท (Own)</SelectItem>
                                            <SelectItem value="rented">รถร่วม/เช่า (Rented)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-4 mt-2">
                                <h4 className="text-sm font-medium text-gray-500">Default Driver (Optional)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input value={data.driver_name} onChange={e => setData('driver_name', e.target.value)} placeholder="ชื่อคนขับ" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input value={data.driver_phone} onChange={e => setData('driver_phone', e.target.value)} placeholder="เบอร์โทร" />
                                    </div>
                                </div>
                            </div>

                            {editingId && (
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={processing}>{editingId ? 'Update' : 'Create'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AuthenticatedLayout>
    );
}
