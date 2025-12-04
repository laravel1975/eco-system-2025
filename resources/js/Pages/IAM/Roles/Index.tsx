import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { useState } from 'react';
import { Badge } from '@/Components/ui/badge';
import IamNavigationMenu from '../Partials/IamNavigationMenu';

// --- 2. (คัดลอกมา) Logic การจัดกลุ่ม (จาก Edit.tsx) ---
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

// --- 3. (ใหม่) Logic การกำหนดสี Badge ---
function getGroupBadgeVariant(groupName: string): "default" | "secondary" | "outline" | "destructive" {
    switch (groupName) {
        case 'User Management':
            return 'default'; // สีหลัก (น้ำเงิน)
        case 'Role Management':
            return 'secondary'; // สีรอง (เทาเข้ม)
        case 'Company Management':
            return 'outline'; // สีโครง (เทาอ่อน)
        case 'Department Management':
            return 'outline'; // สีโครง (เทาอ่อน)
        default:
            return 'outline';
    }
}

// 4. อัปเดต Interface
interface Permission {
    name: string;
}
interface Role {
    id: number;
    name: string;
    permissions: Permission[]; // <-- เพิ่ม
}

export default function RoleIndex({ auth, roles }: PageProps<{ roles: Role[] }>) {

    // 4. สร้าง State และ Logic สำหรับ Modal (เหมือน User/Company)
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const { delete: inertiaDelete, processing } = useForm();

    const handleDeleteClick = (role: Role) => {
        setRoleToDelete(role);
        setConfirmingDeletion(true);
    };

    const submitDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleToDelete) return;

        inertiaDelete(route('iam.roles.destroy', roleToDelete.id), {
            onSuccess: () => {
                setConfirmingDeletion(false);
                setRoleToDelete(null);
            },
        });
    };
    // 5. สร้าง Array Role ที่ห้ามลบ (เพื่อเช็กใน UI)
    const systemRoles = ['Super Admin', 'Admin'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Role Management
                    </h2>
                    <Button asChild>
                        <Link href={route('iam.roles.create')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Role
                        </Link>
                    </Button>
                </div>
            }
                        // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
                        navigationMenu={<IamNavigationMenu />}
        >
            <Head title="Roles" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        {/* 5. เพิ่ม Column ใหม่ */}
                                        <TableHead>Permission Groups</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => {
                                        // 6. (ใหม่) Logic การดึงกลุ่ม (Unique)
                                        const groups = new Set(
                                            role.permissions.map(perm => getPermissionGroup(perm.name))
                                        );
                                        return (
                                            <TableRow key={role.id}>
                                                <TableCell>{role.name}</TableCell>

                                                {/* 7. (ใหม่) Cell สำหรับแสดง Badges */}
                                                <TableCell>
                                                    {/* (Super Admin มีทุกสิทธิ์) */}
                                                    {role.name === 'Super Admin' ? (
                                                        <Badge variant="destructive">All Permissions</Badge>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                            {[...groups].map((groupName) => (
                                                                <Badge
                                                                    key={groupName}
                                                                    variant={getGroupBadgeVariant(groupName)}
                                                                >
                                                                    {groupName}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* 6. แก้ไข Cell นี้ (เพิ่ม Dropdown) */}
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem asChild disabled={systemRoles.includes(role.name) || processing}>
                                                                <Link href={route('iam.roles.edit', role.id)}>
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {/* 7. เพิ่มเงื่อนไข (ห้ามลบ Role ระบบ) */}
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => handleDeleteClick(role)}
                                                                disabled={systemRoles.includes(role.name) || processing}
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 8. เพิ่ม Modal ยืนยัน */}
            <AlertDialog open={confirmingDeletion} onOpenChange={setConfirmingDeletion}>
                <AlertDialogContent>
                    <form onSubmit={submitDelete}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the role:
                                <span className="font-semibold"> {roleToDelete?.name}</span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                            <AlertDialogAction type="submit" disabled={processing}>
                                {processing ? 'Deleting...' : 'Continue'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
