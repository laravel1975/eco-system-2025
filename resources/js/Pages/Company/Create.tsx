import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

// Import Breeze Component (สำหรับแสดง Error)
import InputError from '@/Components/InputError';

// Import ShadCN Components
import { Button } from '@/Components/ui/button';
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

export default function CompanyCreate({ auth }: PageProps) {
    // 1. ตั้งค่า useForm hook (ตรงกับ rules ใน Request)
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        registration_no: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        is_active: true, // ค่าเริ่มต้น
    });

    // 2. ฟังก์ชัน Submit
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('companies.store'));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Create New Company
                    </h2>
                    {/* ปุ่ม "Back" */}
                    <Button variant="outline" asChild>
                        <Link href={route('companies.index')}>Back to List</Link>
                    </Button>
                </div>
            }
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<IamNavigationMenu />}
        >
            <Head title="Create Company" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* 3. ใช้ Card ห่อหุ้มฟอร์ม */}
                    <Card>
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <CardTitle>Company Details</CardTitle>
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name (Required) */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Company Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Registration No */}
                                <div className="space-y-2">
                                    <Label htmlFor="registration_no">Registration No.</Label>
                                    <Input
                                        id="registration_no"
                                        value={data.registration_no}
                                        onChange={(e) => setData('registration_no', e.target.value)}
                                    />
                                    <InputError message={errors.registration_no} />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                {/* Address (Full Width) */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                {/* City, State, Country, Postal Code ... */}
                                {/* (คุณสามารถเพิ่ม Input ที่เหลือในลักษณะเดียวกัน) */}

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
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Company'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
