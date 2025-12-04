import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/ui/accordion';
import InputError from '@/Components/InputError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { useMemo } from 'react';
import IamNavigationMenu from '../Partials/IamNavigationMenu';

// --- (Interface definitions ... ) ---
interface Role { id: number; name: string; }
interface Permission { id: number; name: string; }

type EditPageProps = PageProps & {
    role: Role;
    permissions: Permission[];
    rolePermissions: number[];
};

// --- โค้ด Helper จัดกลุ่ม ---
const PERMISSION_GROUPS: { [key: string]: string } = {
    'user': 'User Management',
    'employee': 'HRM',
    'role': 'Role Management',
    'company': 'Company Management',
    'department': 'Department Management',
    // (กลุ่มอื่นๆ ในอนาคต)
};
const DEFAULT_GROUP = 'General';

function getPermissionGroup(permissionName: string): string {
    const lowerName = permissionName.toLowerCase();
    const keyword = lowerName.split(' ')[1] ?? lowerName.split(' ')[0];

    for (const key in PERMISSION_GROUPS) {
        if (keyword.includes(key)) {
            return PERMISSION_GROUPS[key];
        }
    }
    return DEFAULT_GROUP;
}

export default function RoleEdit({ auth, role, permissions, rolePermissions }: EditPageProps) {

    const { data, setData, patch, processing, errors } = useForm({
        name: role.name,
        permissions: rolePermissions,
    });

    // Logic การจัดกลุ่ม ---
    // ใช้ useMemo เพื่อให้ Logic นี้ทำงานแค่ครั้งเดียว (ถ้า permissions ไม่เปลี่ยน)
    const groupedPermissions = useMemo(() => {
        const groups: { [groupName: string]: Permission[] } = {};

        permissions.forEach((permission) => {
            const groupName = getPermissionGroup(permission.name);
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(permission);
        });
        return groups;
    }, [permissions]); // <-- Dependency

    // (ฟังก์ชัน handlePermissionToggle และ handleSubmit ... ไม่ต้องแก้ไข)
    function handlePermissionToggle(permissionId: number, isChecked: boolean) {
        let currentPermissions = [...data.permissions];
        if (isChecked) {
            currentPermissions.push(permissionId);
        } else {
            currentPermissions = currentPermissions.filter((id) => id !== permissionId);
        }
        setData('permissions', currentPermissions);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('iam.roles.update', role.id));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                // 5. แก้ไข Title
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Role: {role.name}
                    </h2>
                    <Button variant="outline" asChild>
                        <Link href={route('iam.roles.index')}>Back to List</Link>
                    </Button>
                </div>
            }
                        // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
                        navigationMenu={<IamNavigationMenu />}
        >
            <Head title="Edit Role" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    {/* 6. แก้ไข onSubmit */}
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Details</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </CardContent>

                            <CardHeader className="pt-0">
                                <CardTitle>Permissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion
                                    type="multiple" // <-- อนุญาตให้เปิดหลายกลุ่มพร้อมกัน
                                    className="w-full"
                                    // (เปิดกลุ่มแรกไว้เป็นค่าเริ่มต้น)
                                    defaultValue={[Object.keys(groupedPermissions)[0]]}
                                >
                                    {/* 5. ลูปจาก 'groupedPermissions' (แทน 'permissions') */}
                                    {Object.entries(groupedPermissions).map(([groupName, permsInGroup]) => (
                                        <AccordionItem value={groupName} key={groupName}>
                                            <AccordionTrigger>{groupName}</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="grid grid-cols-2 gap-4 p-2">
                                                    {permsInGroup.map((permission) => (
                                                        <div key={permission.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`perm_${permission.id}`}
                                                                checked={data.permissions.includes(permission.id)}
                                                                onCheckedChange={(checked) =>
                                                                    handlePermissionToggle(permission.id, !!checked)
                                                                }
                                                            />
                                                            <Label
                                                                htmlFor={`perm_${permission.id}`}
                                                                className="text-sm font-normal cursor-pointer"
                                                            >
                                                                {permission.name}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                                <InputError message={errors.permissions} className="mt-2" />
                            </CardContent>

                            <CardFooter className="flex justify-end">
                                {/* 7. แก้ไข Text ปุ่ม */}
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
