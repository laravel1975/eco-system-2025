import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/Components/ui/dropdown-menu';
import {
    AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardFooter } from '@/Components/ui/card';
import { Textarea } from '@/Components/ui/textarea'; // (ใช้ Textarea)

// --- (Interfaces) ---
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface Department {
    id: number;
    name: string;
    company_id: number;
}
interface Position {
    id: number;
    title: string;
    description: string | null;
    department?: Department | null;
    company?: Company | null;
    department_id: number;
    company_id: number;
}
// (แก้ไข AuthUser ให้อนุญาต null)
interface AuthUser extends User {
    company: Company | null;    // <-- (แก้ไข)
}
interface IndexPageProps extends PageProps {
    auth: { user: AuthUser; };
    positions: {
        data: Position[];
        links: any[];
    };
    commonData: {
        departments: Department[];
        companies: Company[];
    };
    query: {
        action?: 'create' | 'edit';
        id?: number;
    };
    positionToEdit?: Position;
}

// --- (Component ย่อย: PositionForm) ---
function PositionForm({ position, commonData, onClose, auth }: {
    position?: Position;
    commonData: IndexPageProps['commonData'];
    onClose: () => void;
    auth: IndexPageProps['auth'];
}) {
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    // --- (2. แก้ไข useForm) ---
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title: position?.title || '',
        description: position?.description || '',
        department_id: String(position?.department_id || ''),
        // (แก้ไข) เพิ่มการตรวจสอบ auth.user.company_id
        company_id: String(position?.company_id || (isSuperAdmin ? '' : (auth.user.company_id || ''))),
    });
    // --- (สิ้นสุดการแก้ไข useForm) ---

    // (Logic กรอง Department - เหมือนเดิม)
    const filteredDepartments = useMemo(() => {
        if (!data.company_id) return [];
        return commonData.departments.filter(
            (dept) => dept.company_id === parseInt(data.company_id, 10)
        );
    }, [data.company_id, commonData.departments]);

    // (handleSubmit - เหมือนเดิม)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // (แก้ไข) เพิ่ม Data เข้าไปใน Post/Patch
        const formData = { ...data };

        if (position) {
            patch(route('hrm.positions.update', position.id), {
                data: formData, // (เพิ่ม data)
                onSuccess: () => { reset(); onClose(); },
                preserveState: true,
                preserveScroll: true,
            });
        } else {
            post(route('hrm.positions.store'), {
                data: formData, // (เพิ่ม data)
                onSuccess: () => { reset(); onClose(); },
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* (Company Dropdown) */}
            {isSuperAdmin && (
                <div className="space-y-2">
                    <Label htmlFor="company_id">Company</Label>
                    <Select
                        onValueChange={(value) => {
                            setData('company_id', value);
                            setData('department_id', '');
                        }}
                        value={data.company_id}
                        disabled={!isSuperAdmin}
                    >
                        <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                        <SelectContent>
                            {/* --- (3. แก้ไข) เพิ่ม Guard Clause `&& auth.user.company` --- */}
                            {!isSuperAdmin && auth.user.company ? (
                                <SelectItem
                                    key={auth.user.company.id}
                                    value={String(auth.user.company.id)}
                                >
                                    {auth.user.company.name}
                                </SelectItem>
                            ) : (
                                commonData.companies.map((company) => (
                                    <SelectItem key={company.id} value={String(company.id)}>{company.name}</SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.company_id} />
                </div>
            )}

            {/* (Department Dropdown) */}
            <div className="space-y-2">
                <Label htmlFor="department_id">Department</Label>
                <Select
                    onValueChange={(value) => setData('department_id', value)}
                    value={data.department_id}
                    disabled={!data.company_id}
                >
                    <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                    <SelectContent>
                        {filteredDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.department_id} />
            </div>

            {/* (Title) */}
            <div className="space-y-2">
                <Label htmlFor="title">Position Title</Label>
                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                <InputError message={errors.title} />
            </div>

            {/* (Description) */}
            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" value={data.description || ''} onChange={(e) => setData('description', e.target.value)} />
                <InputError message={errors.description} />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    );
}

// --- (Component หลัก: PositionIndex) ---
export default function PositionIndex({ auth, positions, commonData, query, positionToEdit }: IndexPageProps) {
    const [modalState, setModalState] = useState<'create' | 'edit' | 'closed'>('closed');
    const [editingPosition, setEditingPosition] = useState<Position | undefined>();
    const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);

    const { delete: inertiaDelete, processing: deleting } = useForm();

    // (Wizard Logic)
    useEffect(() => {
        if (query.action === 'create') {
            setModalState('create');
        }
        if (query.action === 'edit' && positionToEdit) {
            setEditingPosition(positionToEdit);
            setModalState('edit');
        }
    }, [query, positionToEdit]);

    // (Close Modal)
    const closeModal = () => {
        setModalState('closed');
        setEditingPosition(undefined);
        router.visit(route('hrm.positions.index'), { preserveState: true });
    };

    // (Delete Logic)
    const submitDelete = () => {
        if (!deletingPosition) return;
        inertiaDelete(route('hrm.positions.destroy', deletingPosition.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingPosition(null),
            onError: () => setDeletingPosition(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Position Management
                    </h2>
                    <Button onClick={() => setModalState('create')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Position
                    </Button>
                </div>
            }
        >
            <Head title="Positions" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Position Title</TableHead>
                                        <TableHead>Department</TableHead>
                                        {/* (แสดง Company ถ้าเป็น Super Admin) */}
                                        {auth.user.roles.some(r => r.name === 'Super Admin') && (
                                            <TableHead>Company</TableHead>
                                        )}
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {positions.data.map((pos) => (
                                        <TableRow key={pos.id}>
                                            <TableCell>{pos.title}</TableCell>
                                            <TableCell>{pos.department?.name ?? 'N/A'}</TableCell>
                                            {auth.user.roles.some(r => r.name === 'Super Admin') && (
                                                <TableCell>{pos.company?.name ?? 'N/A'}</TableCell>
                                            )}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => {
                                                            setEditingPosition(pos);
                                                            setModalState('edit');
                                                        }}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setDeletingPosition(pos)} className="text-red-600">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Pagination links={positions.links} />
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* (Modal: Create/Edit) */}
            <Dialog open={modalState !== 'closed'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {modalState === 'create' ? 'Create New Position' : `Edit Position: ${editingPosition?.title}`}
                        </DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <PositionForm
                        position={editingPosition}
                        commonData={commonData}
                        onClose={closeModal}
                        auth={auth}
                    />
                </DialogContent>
            </Dialog>

            {/* (Modal: Delete) */}
            <AlertDialog open={!!deletingPosition} onOpenChange={(open) => !open && setDeletingPosition(null)}>
                <AlertDialogContent>
                    {deletingPosition ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {deletingPosition.title}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button variant="destructive" onClick={submitDelete} disabled={deleting}>
                                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                                </Button>
                            </AlertDialogFooter>
                        </>
                    ) : null}
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
