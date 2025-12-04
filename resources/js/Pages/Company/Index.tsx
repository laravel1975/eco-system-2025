import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import { useState } from 'react';
import IamNavigationMenu from '../IAM/Partials/IamNavigationMenu';

// สร้าง Interface สำหรับ Company (จาก Company.php)
interface Company {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    is_active: boolean;
}

type IndexPageProps = PageProps & {
    companies: Company[];
}

export default function CompanyIndex({ auth, companies }: PageProps<{ companies: Company[] }>) {

    // สร้าง State สำหรับ Modal
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

    // ใช้ useForm สำหรับการ Delete
    // (เราใช้ useForm เพื่อให้สามารถ track 'processing' state ได้)
    const { delete: inertiaDelete, processing } = useForm();

    // ฟังก์ชันเมื่อคลิกปุ่ม "Delete" ใน Dropdown
    const handleDeleteClick = (company: Company) => {
        setCompanyToDelete(company);
        setConfirmingDeletion(true);
    };

    // ฟังก์ชันเมื่อยืนยันการลบ (คลิกปุ่ม "Continue" ใน Modal)
    const submitDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyToDelete) return;

        inertiaDelete(route('companies.destroy', companyToDelete.id), {
            // ปิด Modal หลังจากลบเสร็จ
            onSuccess: () => {
                setConfirmingDeletion(false);
                setCompanyToDelete(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Company Management
                    </h2>
                    {/* --- ปุ่มสร้างใหม่ --- */}
                    <Button asChild>
                        <Link href={route('companies.create')}>Create Company</Link>
                    </Button>
                </div>
            }
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<IamNavigationMenu />}
        >
            <Head title="Company Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companies.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell>{company.name}</TableCell>
                                            <TableCell>{company.email ?? company.phone ?? 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={company.is_active ? 'default' : 'outline'}>
                                                    {company.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
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
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('companies.edit', company.id)}>
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            // 8. เปลี่ยน onClick
                                                            onClick={() => handleDeleteClick(company)}
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
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

            {/* --- เพิ่ม Modal ไว้ที่ท้าย Component --- */}
            <AlertDialog open={confirmingDeletion} onOpenChange={setConfirmingDeletion}>
                <AlertDialogContent>
                    <form onSubmit={submitDelete}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                company: <span className="font-semibold">{companyToDelete?.name}</span>
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
