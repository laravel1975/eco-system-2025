import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react'; // (1. แก้ไข) Import Link
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/Components/ui/dropdown-menu';
// (2. แก้ไข) Import ไอคอน Briefcase
import { Briefcase, MoreHorizontal, PlusCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import IamNavigationMenu from '../Partials/IamNavigationMenu';

// (3. แก้ไข) สร้าง Interface สำหรับ Profile (Employee)
interface ProfileStub {
    id: number;
    user_id: number;
}

// (4. แก้ไข) อัปเดต Interface User ให้รับ 'profile'
interface UserWithRelations extends User {
    profile: ProfileStub | null; // (นี่คือ Field ที่เพิ่มเข้ามาจาก Controller)
}

export default function UserIndex({ auth, users }: PageProps<{ users: UserWithRelations[] }>) {

    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserWithRelations | null>(null);
    const { delete: inertiaDelete, processing } = useForm();

    const handleDeleteClick = (user: UserWithRelations) => {
        setUserToDelete(user);
        setConfirmingDeletion(true);
    };

    const submitDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToDelete) return;

        inertiaDelete(route('iam.destroy', userToDelete.id), {
            onSuccess: () => {
                setConfirmingDeletion(false);
                setUserToDelete(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        User Management
                    </h2>
                    <Button asChild>
                        <Link href={route('iam.create')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New User
                        </Link>
                    </Button>
                </div>
            }
            navigationMenu={<IamNavigationMenu />}
        >
            {/* (ส่วน Head และ div py-12 ไม่ต้องแก้ไข) */}
            <Head title="User Management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.company?.name ?? 'N/A'}</TableCell>
                                            <TableCell>
                                                {user.roles.map((role) => (
                                                    <Badge key={role.name} variant="outline" className="mr-1">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        {auth.user.id !== user.id ? (
                                                            <>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('iam.edit', user.id)}>
                                                                        Edit User
                                                                    </Link>
                                                                </DropdownMenuItem>

                                                                {/* --- (5. แก้ไข) นี่คือ Logic ใหม่ของคุณ --- */}
                                                                {user.profile ? (
                                                                    // 5.a. ถ้า User มี Profile แล้ว (เป็น Employee)
                                                                    <DropdownMenuItem asChild>
                                                                        {/* คลิกแล้วไปหน้า HRM Employee โดยเปิด Modal Edit */}
                                                                        <Link href={route('hrm.employees.index', { action: 'edit', id: user.profile.id })}>
                                                                            <Briefcase className="mr-2 h-4 w-4" />
                                                                            View Employee Profile
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    // 5.b. ถ้า User ยังไม่มี Profile
                                                                    <DropdownMenuItem asChild>
                                                                        {/* คลิกแล้วไปหน้า HRM Employee โดยเปิด Modal Create (Wizard) */}
                                                                        <Link href={route('hrm.employees.index', { action: 'create', link_user_id: user.id })}>
                                                                            <Briefcase className="mr-2 h-4 w-4" />
                                                                            Create Employee Profile
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {/* --- (สิ้นสุด Logic ใหม่) --- */}

                                                                <DropdownMenuSeparator />

                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => handleDeleteClick(user)}
                                                                    disabled={processing}
                                                                >
                                                                    Delete User
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) : (
                                                            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                                                                (Cannot edit/delete self)
                                                            </DropdownMenuLabel>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* (Modal Delete ไม่ต้องแก้ไข) */}
            <AlertDialog open={confirmingDeletion} onOpenChange={setConfirmingDeletion}>
                <AlertDialogContent>
                    <form onSubmit={submitDelete}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the user:
                                <span className="font-semibold"> {userToDelete?.name}</span>.
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
