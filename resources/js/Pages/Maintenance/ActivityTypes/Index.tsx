import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';
import { PaginatedResponse } from '@/types/maintenance';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import InputError from '@/Components/InputError';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/Components/ui/alert-dialog";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/
interface ActivityType {
    id: number;
    name: string;
    code: string;
}
interface Props {
    activities: PaginatedResponse<ActivityType>;
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/
export default function ActivityTypeIndex({ auth, activities }: PageProps & Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset } = useForm({
        id: undefined as number | undefined,
        name: '',
        code: '',
    });

    const openModal = (activity: ActivityType | null = null) => {
        if (activity) {
            setIsEditMode(true);
            setData({ id: activity.id, name: activity.name, code: activity.code });
        } else {
            setIsEditMode(false);
            reset();
        }
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    const openDeleteConfirm = (activity: ActivityType) => {
        setData('id', activity.id);
        setConfirmingDeletion(true);
    };
    const closeDeleteConfirm = () => setConfirmingDeletion(false);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEditMode) {
            patch(route('maintenance.activity-types.update', data.id), { onSuccess: () => closeModal() });
        } else {
            post(route('maintenance.activity-types.store'), { onSuccess: () => closeModal() });
        }
    };

    const deleteActivity = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        destroy(route('maintenance.activity-types.destroy', data.id), { onSuccess: () => closeDeleteConfirm() });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">ประเภทกิจกรรม (Activity Types)</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="ประเภทกิจกรรม" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => openModal(null)}>+ สร้างประเภทใหม่</Button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>ชื่อ</TableHead>
                                    <TableHead>ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activities.data.length === 0 && (
                                    <TableRow><TableCell colSpan={3} className="text-center">ไม่พบข้อมูล</TableCell></TableRow>
                                )}
                                {activities.data.map((act) => (
                                    <TableRow key={act.id}>
                                        <TableCell>{act.code}</TableCell>
                                        <TableCell>{act.name}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => openModal(act)}>แก้ไข</Button>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => openDeleteConfirm(act)}>ลบ</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* (Modal สร้าง/แก้ไข) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isEditMode ? 'แก้ไขประเภทกิจกรรม' : 'สร้างประเภทกิจกรรมใหม่'}</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="p-6 space-y-4">
                        <div>
                            <Label htmlFor="name">ชื่อ *</Label>
                            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1" />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <Label htmlFor="code">Code *</Label>
                            <Input id="code" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1" />
                            <InputError message={errors.code} className="mt-2" />
                        </div>
                        <DialogFooter>
                            <SecondaryButton type="button" onClick={closeModal}>ยกเลิก</SecondaryButton>
                            <PrimaryButton className="ml-3" disabled={processing}>บันทึก</PrimaryButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* (Modal ยืนยันการลบ) */}
            <AlertDialog open={confirmingDeletion} onOpenChange={setConfirmingDeletion}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDeleteConfirm}>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteActivity} disabled={processing} className="bg-red-600 hover:bg-red-700">ยืนยัน</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
