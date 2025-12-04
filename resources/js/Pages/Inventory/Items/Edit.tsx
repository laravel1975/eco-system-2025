import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryNavigationMenu from '@/Pages/Inventory/Partials/InventoryNavigationMenu';
import ImageUploader from '@/Components/ImageUploader';

// Icons
import { Save, X, Box, Tag, FileText, ChevronRight, Info } from 'lucide-react';

// ShadCN Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import InputError from '@/Components/InputError';

// Interfaces
interface Category { id: string; name: string; code: string; }
interface Uom { id: string; name: string; symbol: string; }
interface ExistingImage { id: number; url: string; is_primary: boolean; }

interface ItemData {
    uuid: string;
    part_number: string;
    name: string;
    uom_id: string;
    category_id: string;
    average_cost: number;
    description: string;
    existing_images: ExistingImage[]; // ✅ รับรูปเดิมมา
}

interface EditProps extends PageProps {
    item: ItemData;
    categories: Category[];
    uoms: Uom[];
}

// Form Data (รวมรูปใหม่ที่จะอัปโหลด)
interface EditFormData extends Omit<ItemData, 'existing_images'> {
    new_images: File[];
    removed_image_ids: number[]; // ID ของรูปเดิมที่จะลบ
    set_primary_image_id: number | null;
}

export default function EditItem({ auth, item, categories, uoms }: EditProps) {

    // ✅ Setup Form
    const { data, setData, post, processing, errors, reset } = useForm<EditFormData>({
        uuid: item.uuid,
        part_number: item.part_number,
        name: item.name,
        uom_id: item.uom_id || '',
        category_id: item.category_id || '',
        average_cost: item.average_cost,
        description: item.description || '',
        new_images: [],
        removed_image_ids: [],
        set_primary_image_id: null,
    });

    // State สำหรับรูปเดิมที่ยังไม่ถูกลบ (เพื่อแสดงผลใน UI)
    const [visibleExistingImages, setVisibleExistingImages] = useState<ExistingImage[]>(item.existing_images);

    // ✅ Handler: ตั้งค่ารูปหลัก
    const handleSetPrimary = (imageId: number) => {
        // 1. อัปเดต Form Data
        setData('set_primary_image_id', imageId);

        // 2. อัปเดต UI ให้เห็นทันที (ย้ายดาว)
        setVisibleExistingImages(prev => prev.map(img => ({
            ...img,
            is_primary: img.id === imageId // เป็น true เฉพาะ id ที่เลือก
        })));
    };

    // Handler: ลบรูปเดิม
    const handleRemoveExistingImage = (imageId: number) => {
        // เพิ่ม ID ลงในรายการที่จะลบ
        setData('removed_image_ids', [...data.removed_image_ids, imageId]);
        // ซ่อนจาก UI
        setVisibleExistingImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        // ใช้ POST + _method: PUT เพื่อรองรับ File Upload
        post(route('inventory.items.update', { uuid: item.uuid, _method: 'put' }));
    };

    // Style
    const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Product</h2>}
            navigationMenu={<InventoryNavigationMenu />}
        >
            <Head title={`Edit - ${item.name}`} />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">

                {/* --- Header & Breadcrumbs --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="space-y-1">
                        <nav className="flex items-center text-sm text-muted-foreground mb-1">
                            <Link href={route('inventory.items.index')} className="hover:text-primary transition-colors">Products</Link>
                            <ChevronRight className="h-4 w-4 mx-2" />
                            <Link href={route('inventory.items.show', item.uuid)} className="hover:text-primary transition-colors line-clamp-1">{item.name}</Link>
                            <ChevronRight className="h-4 w-4 mx-2" />
                            <span className="font-medium text-foreground">Edit</span>
                        </nav>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Product: {item.part_number}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('inventory.items.show', item.uuid)}>Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Saving...' : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- Left Column: Main Information (2/3 width) --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Box className="w-5 h-5 text-primary" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>Core product details and identification.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="part_number">Part Number</Label>
                                        <Input
                                            id="part_number"
                                            value={data.part_number}
                                            onChange={(e) => setData('part_number', e.target.value)}
                                            className="font-mono"
                                        />
                                        <InputError message={errors.part_number} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="min-h-[120px]"
                                        placeholder="Enter product description, specifications, or notes..."
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* --- Image Gallery Section --- */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Product Gallery
                                </CardTitle>
                                <CardDescription>Manage product images. You can add new ones or remove existing ones.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ImageUploader
                                    value={data.new_images}
                                    onChange={(files) => setData('new_images', files)}
                                    existingImages={visibleExistingImages}
                                    onRemoveExisting={handleRemoveExistingImage}
                                    onSetPrimary={handleSetPrimary}
                                />
                                {errors.new_images && <InputError message={errors.new_images} className="mt-2" />}
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Right Column: Settings & Attributes (1/3 width) --- */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-primary" />
                                    Attributes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <select
                                        id="category_id"
                                        className={selectClass}
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="uom_id">Unit of Measure</Label>
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
                                    <InputError message={errors.uom_id} />
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="average_cost">Average Cost</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Standard cost used for valuation.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">฿</span>
                                        <Input
                                            id="average_cost"
                                            type="number"
                                            step="0.01"
                                            className="pl-8"
                                            value={data.average_cost}
                                            onChange={(e) => setData('average_cost', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <InputError message={errors.average_cost} />
                                </div>

                            </CardContent>
                        </Card>

                        {/* (Optional) Status Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
                                    <span className="text-sm font-medium">Active</span>
                                    <Badge variant="default" className="bg-emerald-600">Enabled</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
