import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

// (Imports ของ ShadCN ที่เราใช้บ่อย)
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
import IamNavigationMenu from '../Partials/IamNavigationMenu';

export default function RoleCreate({ auth }: PageProps) {

    // 1. ตั้งค่า useForm hook (มีแค่ 'name')
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    // 2. ฟังก์ชัน Submit
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('iam.roles.store'));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Create New Role
                    </h2>
                    <Button variant="outline" asChild>
                        <Link href={route('iam.roles.index')}>Back to List</Link>
                    </Button>
                </div>
            }
                        // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
                        navigationMenu={<IamNavigationMenu />}
        >
            <Head title="Create Role" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    {/* 3. ใช้ Card ห่อหุ้มฟอร์ม */}
                    <Card>
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <CardTitle>Role Details</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Role Name (Required) */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Manager, Technician"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* (ในเฟส 2: เราจะเพิ่ม Checklist ของ Permissions ที่นี่) */}

                            </CardContent>

                            <CardFooter className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Role'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
