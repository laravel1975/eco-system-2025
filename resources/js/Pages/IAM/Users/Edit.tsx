import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types'; // <--- 1. Import User
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import IamNavigationMenu from '../Partials/IamNavigationMenu';

// (Interfaces ... แก้ไข)
interface Role { id: number; name: string; }
interface Company { id: number; name: string; }
interface UserWithRelations extends User {
}
type EditPageProps = PageProps & {
    user: UserWithRelations;
    companies: Company[];
    roles: Role[];
};

export default function UserEdit({ auth, user, companies, roles }: EditPageProps) {

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        avatar_url: user.avatar_url ?? '',
        password: '',
        password_confirmation: '',
        company_id: String(user.company_id),
        role_ids: user.roles.map(r => r.id),
        is_active: user.is_active,
    });

    function handleRoleToggle(roleId: number, isChecked: boolean) {
        let currentRoles = [...data.role_ids];
        if (isChecked) {
            currentRoles.push(roleId);
        } else {
            currentRoles = currentRoles.filter((id) => id !== roleId);
        }
        setData('role_ids', currentRoles);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('iam.update', user.id));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                // 7. แก้ไข Title
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit User: {user.name}
                    </h2>
                    <Button variant="outline" asChild>
                        <Link href={route('iam.index')}>Back to List</Link>
                    </Button>
                </div>
            }
            navigationMenu={<IamNavigationMenu />}
        >

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        {/* 8. แก้ไข onSubmit */}
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <CardTitle>User Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Company (Shared Kernel) */}
                                <div className="space-y-2">
                                    <Label htmlFor="company_id">Company</Label>
                                    <Select onValueChange={(value) => setData('company_id', value)} value={data.company_id}>
                                        <SelectTrigger id="company_id">
                                            <SelectValue placeholder="Select a company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map((company) => (
                                                <SelectItem key={company.id} value={String(company.id)}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.company_id} />
                                </div>

                                {/* Role (IAM) */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Roles</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-md border p-4">
                                        {roles.map((role) => (
                                            <div key={role.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role_${role.id}`}
                                                    checked={data.role_ids.includes(role.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleRoleToggle(role.id, !!checked)
                                                    }
                                                    // (กฎพิเศษ: Super Admin แก้ไข Role ของตัวเองได้
                                                    // แต่ห้ามเอาสิทธิ์ Super Admin ออกจากตัวเอง)
                                                    disabled={
                                                        role.name === 'Super Admin' &&
                                                        user.id === auth.user.id
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`role_${role.id}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {role.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    <InputError message={errors.role_ids} />
                                </div>

                                {/* 9. แก้ไข Password Inputs (เพิ่มคำอธิบาย) */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password" type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Leave blank to keep unchanged" // <-- เพิ่ม
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation" type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Leave blank to keep unchanged" // <-- เพิ่ม
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone (Optional)</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                    <InputError message={errors.phone} />
                                </div>

                                {/* Avatar URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
                                    <Input id="avatar_url" value={data.avatar_url} onChange={(e) => setData('avatar_url', e.target.value)} />
                                    <InputError message={errors.avatar_url} />
                                </div>

                                {/* Status (is_active) */}
                                <div className="flex items-center space-x-2 pt-4 md:col-span-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(val) => setData('is_active', val)}
                                    />
                                    <Label htmlFor="is_active">User is Active</Label>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-end">
                                {/* 10. แก้ไข Text ปุ่ม */}
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout >
    );
}
