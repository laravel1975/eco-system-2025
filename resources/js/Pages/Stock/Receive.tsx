import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/Components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import ProductCombobox from '@/Components/ProductCombobox'; // Reuse ของ Sales
import InventoryNavigationMenu from '@/Pages/Inventory/Partials/InventoryNavigationMenu'; // ใช้เมนูของ Inventory ไปก่อน

// Types
interface Location { uuid: string; code: string; type: string; }
interface Warehouse { uuid: string; name: string; }
// ✅ FIX: เพิ่ม stock: number ใน Interface
interface Product {
    id: string;
    name: string;
    price: number;
    stock: number; // 👈 เพิ่มบรรทัดนี้
    image_url?: string;
}

interface ReceiveProps extends PageProps {
    warehouses: Warehouse[];
    locations: Location[];
    products: Product[]; // รายการสินค้าทั้งหมด
    selectedWarehouseUuid: string;
}

export default function ReceiveStock({ auth, warehouses, locations, products, selectedWarehouseUuid }: ReceiveProps) {

    // Form State
    const { data, setData, post, processing, errors } = useForm({
        warehouse_uuid: selectedWarehouseUuid,
        reference: '',
        items: [
            { product_id: '', location_uuid: '', quantity: 1 } // แถวแรก
        ]
    });

    // เมื่อเปลี่ยน Warehouse -> Reload หน้าเพื่อดึง Locations ใหม่
    const handleWarehouseChange = (uuid: string) => {
        setData('warehouse_uuid', uuid);
        router.visit(route('stock.receive'), {
            data: { warehouse_uuid: uuid },
            only: ['locations', 'selectedWarehouseUuid'],
            preserveState: true, // เก็บ state ของ items ไว้ (แต่จริงๆ ควรเคลียร์ location_uuid ของ items ทิ้งเพราะมันอยู่คนละคลัง)
            onSuccess: () => {
                // Reset location ของทุก item เพราะเปลี่ยนคลังแล้ว
                const resetItems = data.items.map(item => ({ ...item, location_uuid: '' }));
                setData(prev => ({ ...prev, warehouse_uuid: uuid, items: resetItems }));
            }
        });
    };

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', location_uuid: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        // @ts-ignore
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('stock.receive.process'));
    };

    // หา Default Location (เช่น Inbound หรือ General) เพื่อความสะดวก
    const defaultLocation = locations.find(l => l.type === 'INBOUND' || l.code === 'GENERAL')?.uuid;

    useEffect(() => {
        // Auto-set location for new items if not set
        if (defaultLocation) {
            const newItems = data.items.map(item =>
                item.location_uuid ? item : { ...item, location_uuid: defaultLocation }
            );
            // เช็คว่ามีการเปลี่ยนแปลงจริงไหมเพื่อป้องกัน infinite loop
            if (JSON.stringify(newItems) !== JSON.stringify(data.items)) {
                setData('items', newItems);
            }
        }
    }, [locations]); // Run เมื่อ locations เปลี่ยน

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('stock.index')}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Receive Stock (Inbound)</h2>
                </div>
            }
            navigationMenu={<InventoryNavigationMenu />}
        >
            <Head title="Receive Stock" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <Card className="mb-6">
                            <CardHeader><CardTitle>Receipt Details</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Warehouse Selection */}
                                <div className="space-y-2">
                                    <Label>Receiving Warehouse</Label>
                                    <Select value={data.warehouse_uuid} onValueChange={handleWarehouseChange}>
                                        <SelectTrigger><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map(w => (
                                                <SelectItem key={w.uuid} value={w.uuid}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.warehouse_uuid && <p className="text-red-500 text-sm">{errors.warehouse_uuid}</p>}
                                </div>

                                {/* Reference */}
                                <div className="space-y-2">
                                    <Label>Reference (Optional)</Label>
                                    <Input
                                        placeholder="e.g. PO-2025-001, Invoice #123"
                                        value={data.reference}
                                        onChange={e => setData('reference', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Items</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Item
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40%]">Product</TableHead>
                                            <TableHead className="w-[30%]">Put-away Location</TableHead>
                                            <TableHead className="w-[20%] text-right">Quantity</TableHead>
                                            <TableHead className="w-[10%]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <ProductCombobox
                                                        products={products}
                                                        value={item.product_id} // จะแสดงค่า PartNumber
                                                        // เมื่อเลือก -> val จะเป็น PartNumber (จาก id ของ Product interface)
                                                        onChange={(val) => updateItem(index, 'product_id', val)}
                                                        placeholder="Select Product..."
                                                    />
                                                    {errors[`items.${index}.product_id`] && <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.product_id`]}</p>}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={item.location_uuid}
                                                        onValueChange={(val) => updateItem(index, 'location_uuid', val)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Bin..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {locations.map(loc => (
                                                                <SelectItem key={loc.uuid} value={loc.uuid}>
                                                                    <span className="font-mono font-bold mr-2">{loc.code}</span>
                                                                    <span className="text-xs text-gray-500">({loc.type})</span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors[`items.${index}.location_uuid`] && <p className="text-red-500 text-xs mt-1">{errors[`items.${index}.location_uuid`]}</p>}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        className="text-right"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {data.items.length > 1 && (
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="mt-6 flex justify-end">
                            <Button type="submit" size="lg" disabled={processing} className="bg-green-600 hover:bg-green-700 text-white">
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Receive
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
