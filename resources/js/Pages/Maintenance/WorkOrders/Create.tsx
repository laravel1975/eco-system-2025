import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { AssetCombobox } from '@/Components/AssetCombobox'; // (ใช้ Combobox)
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

// (Import Shadcn)
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import InputError from '@/Components/InputError';
import { MaintenanceType, WorkNature, WorkOrderPriority } from '@/types/maintenance';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/
interface AssetOption {
    id: number;
    name: string;
    asset_code: string;
    location: string | null;
}
interface Props {
    assets: AssetOption[];
    maintenanceTypes: MaintenanceType[];
}

// (ข้อมูลในฟอร์ม)
interface WorkOrderFormData {
    asset_id: string;
    maintenance_type_id: string;
    priority: string;
    work_nature: string;
    description: string;
}

// (2. [แก้ไข] อ้างอิง Consts ที่เรา Import มา)
const priorityOptions = [
    { value: WorkOrderPriority.EMERGENCY, label: 'P1 - Emergency (ต้องซ่อมทันที)' },
    { value: WorkOrderPriority.URGENT, label: 'P2 - Urgent (ซ่อมภายใน 24 ชม.)' },
    { value: WorkOrderPriority.NORMAL, label: 'P3 - Normal (วางแผนซ่อมได้)' },
    { value: WorkOrderPriority.LOW, label: 'P4 - Low (ซ่อมเมื่อมีเวลา)' },
];

const workNatureOptions = [
    { value: WorkNature.INTERNAL, label: 'Internal (ทีมช่างภายใน)' },
    { value: WorkNature.EXTERNAL, label: 'External (จ้างผู้รับเหมา)' },
    { value: WorkNature.MIXED, label: 'Mixed (ทำร่วมกัน)' },
];

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function CreateWorkOrder({ auth, assets, maintenanceTypes }: PageProps & Props) {

    // (3. [แก้ไข] ตั้งค่า useForm ให้ใช้ Consts)
    const { data, setData, post, processing, errors } = useForm<WorkOrderFormData>({
        asset_id: '',
        maintenance_type_id: '',
        priority: WorkOrderPriority.NORMAL, // (P3)
        work_nature: WorkNature.INTERNAL, // (Internal)
        description: '',
    });

    // (ฟังก์ชัน Submit - เหมือนเดิม)
    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('maintenance.work-orders.store'));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">สร้างใบสั่งซ่อม</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="สร้างใบสั่งซ่อม" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">

                    <Breadcrumbs
                        links={[
                            { label: "ใบสั่งซ่อม", href: route('maintenance.work-orders.index') }
                        ]}
                        activeLabel="สร้างใหม่"
                    />

                    <form onSubmit={submit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลใบสั่งซ่อมใหม่</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Asset (ทรัพย์สิน) */}
                                <div className="space-y-2">
                                    <Label htmlFor="asset_id">ทรัพย์สิน / เครื่องจักร *</Label>
                                    <AssetCombobox
                                        assets={assets}
                                        value={data.asset_id}
                                        onSelect={(value) => setData('asset_id', value)}
                                        placeholder="-- ค้นหาทรัพย์สิน --"
                                    />
                                    <InputError message={errors.asset_id} />
                                </div>

                                {/* Maintenance Type (ประเภทงาน) */}
                                <div className="space-y-2">
                                    <Label htmlFor="maintenance_type_id">ประเภทงานซ่อม *</Label>
                                    <Select
                                        value={data.maintenance_type_id}
                                        onValueChange={(value) => setData('maintenance_type_id', value || '')}
                                    >
                                        <SelectTrigger id="maintenance_type_id">
                                            <SelectValue placeholder="-- กรุณาเลือกประเภทงาน --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {maintenanceTypes.map(type => (
                                                <SelectItem key={type.id} value={String(type.id)}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.maintenance_type_id} />
                                </div>

                                {/* (5. [อัปเกรด] Priority และ Work Nature) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">ความสำคัญ *</Label>
                                        <Select
                                            value={data.priority}
                                            onValueChange={(value) => setData('priority', value)}
                                        >
                                            <SelectTrigger id="priority">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priorityOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.priority} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="work_nature">ลักษณะงาน *</Label>
                                        <Select
                                            value={data.work_nature}
                                            onValueChange={(value) => setData('work_nature', value)}
                                        >
                                            <SelectTrigger id="work_nature">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {workNatureOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.work_nature} />
                                    </div>
                                </div>

                                {/* Description (รายละเอียด) */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">รายละเอียด / อาการ *</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="อธิบายอาการเสีย หรือรายละเอียดงาน..."
                                        rows={5}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('maintenance.work-orders.index')}>
                                        ยกเลิก
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    สร้างใบสั่งซ่อม
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
