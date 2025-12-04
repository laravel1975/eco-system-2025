import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryNavigationMenu from '@/Pages/Inventory/Partials/InventoryNavigationMenu';
import ImageUploader from '@/Components/ImageUploader'; // ✅ Import Component อัปโหลดรูป

// (Import ShadCN Components)
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import InputError from '@/Components/InputError';

// ✅ Interface สำหรับ Master Data (Dropdowns)
interface Category {
    id: string;
    name: string;
    code: string;
}

interface Uom {
    id: string;
    name: string;
    symbol: string;
}

// ✅ Props ที่รับมาจาก Controller
interface CreateItemProps extends PageProps {
    categories: Category[];
    uoms: Uom[];
}

// ✅ Form Data Definition
interface ItemFormData {
    part_number: string;
    name: string;
    uom_id: string;      // ID จาก Dropdown
    category_id: string; // ID จาก Dropdown
    average_cost: number | string;
    description: string;
    images: File[];      // ✅ Array ของไฟล์รูปภาพ
}

export default function CreateItem({ auth, categories, uoms }: CreateItemProps) {

    // Setup Form
    const { data, setData, post, processing, errors, reset } = useForm<ItemFormData>({
        part_number: '',
        name: '',
        uom_id: '',
        category_id: '',
        average_cost: 0,
        description: '',
        images: [], // เริ่มต้นเป็น Array ว่าง
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // ✅ ส่งข้อมูลไปที่ Backend (ใช้ forceFormData เพื่อรองรับไฟล์)
        post(route('inventory.items.store'), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    // Style สำหรับ Select ให้เหมือน ShadCN Input
    const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Create New Item
                </h2>
            }
            navigationMenu={<InventoryNavigationMenu />}
        >
            <Head title="Create Item" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <form onSubmit={submit}>
                            <CardHeader>
                                <CardTitle>Item Details</CardTitle>
                                <CardDescription>
                                    Fill in the details and upload product images.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-6">
                                {/* --- Basic Info --- */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Part Number */}
                                    <div>
                                        <Label htmlFor="part_number">Part Number *</Label>
                                        <Input
                                            id="part_number"
                                            value={data.part_number}
                                            onChange={(e) => setData('part_number', e.target.value.toUpperCase())}
                                            autoFocus
                                            placeholder="e.g. PN-001"
                                        />
                                        <InputError message={errors.part_number} className="mt-2" />
                                    </div>

                                    {/* Item Name */}
                                    <div>
                                        <Label htmlFor="name">Item Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Product Name"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>
                                </div>

                                {/* --- Attributes (Dropdowns) & Cost --- */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Unit (UoM) */}
                                    <div>
                                        <Label htmlFor="uom_id">Unit (UoM) *</Label>
                                        <select
                                            id="uom_id"
                                            className={selectClass}
                                            value={data.uom_id}
                                            onChange={(e) => setData('uom_id', e.target.value)}
                                        >
                                            <option value="" disabled>Select Unit</option>
                                            {uoms.map((uom) => (
                                                <option key={uom.id} value={uom.id}>
                                                    {uom.name} ({uom.symbol})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.uom_id} className="mt-2" />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <Label htmlFor="category_id">Category *</Label>
                                        <select
                                            id="category_id"
                                            className={selectClass}
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name} {cat.code ? `(${cat.code})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.category_id} className="mt-2" />
                                    </div>

                                    {/* Average Cost */}
                                    <div>
                                        <Label htmlFor="average_cost">Average Cost *</Label>
                                        <Input
                                            id="average_cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.average_cost}
                                            onChange={(e) => setData('average_cost', e.target.value)}
                                        />
                                        <InputError message={errors.average_cost} className="mt-2" />
                                    </div>
                                </div>

                                {/* --- Description --- */}
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {/* --- ✅ Image Upload Section --- */}
                                <div>
                                    <Label className="mb-2 block">Product Images</Label>
                                    <ImageUploader
                                        value={data.images}
                                        onChange={(files) => setData('images', files)}
                                    />
                                    {/* แสดง Error ที่เกี่ยวกับรูปภาพ (ถ้ามี) */}
                                    {errors.images && (
                                        <InputError message={errors.images} className="mt-2" />
                                    )}
                                </div>

                            </CardContent>

                            <CardFooter className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('inventory.items.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Item'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
