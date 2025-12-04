import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

import InputError from '@/Components/InputError';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import IamNavigationMenu from '../IAM/Partials/IamNavigationMenu';

// 1. สร้าง Type สำหรับ Prop (เราใช้ Company.php)
interface Company {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    registration_no: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    is_active: boolean;
}

// 2. รับ 'company' prop
export default function CompanyEdit({ auth, company }: PageProps<{ company: Company }>) {

    // 3. ตั้งค่า useForm hook ให้ใช้ข้อมูลจาก 'company' prop
    const { data, setData, patch, processing, errors } = useForm({
        name: company.name,
        email: company.email ?? '',
        phone: company.phone ?? '',
        registration_no: company.registration_no ?? '',
        address: company.address ?? '',
        city: company.city ?? '',
        state: company.state ?? '',
        country: company.country ?? '',
        postal_code: company.postal_code ?? '',
        is_active: company.is_active,
    });

    // 4. แก้ไขฟังก์ชัน Submit
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // ใช้ 'patch' (แทน 'post') และส่ง ID ของ company
        patch(route('companies.update', company.id));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    {/* 5. แก้ไข Title */}
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Company: {company.name}
                    </h2>
                    <Button variant="outline" asChild>
                        <Link href={route('companies.index')}>Back to List</Link>
                    </Button>
                </div>
            }
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<IamNavigationMenu />}
        >
            <Head title="Edit Company" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        {/* 6. แก้ไข onSubmit */}
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <CardTitle>Company Details</CardTitle>
                            </CardHeader>

                            {/* (ฟอร์ม Input ที่เหลือเหมือนเดิม ไม่ต้องแก้ไข) */}
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Company Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                {/* ... (inputs อื่นๆ) ... */}
                                {/* Is Active (Switch) */}
                                <div className="flex items-center space-x-2 pt-4">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(val) => setData('is_active', val)}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-end">
                                {/* 7. แก้ไข Text ปุ่ม */}
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
