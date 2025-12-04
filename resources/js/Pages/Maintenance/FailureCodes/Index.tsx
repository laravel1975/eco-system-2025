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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
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
interface FailureCode {
    id: number;
    name: string;
    code: string;
    parent_id: number | null;
    parent: { id: number; name: string } | null; // (Loaded relation)
}
interface AllCodeOption { // (สำหรับ Dropdown)
    id: number;
    name: string;
    code: string;
}
interface Props {
    failureCodes: PaginatedResponse<FailureCode>;
    allCodes: AllCodeOption[]; // (List ทั้งหมดสำหรับ Dropdown)
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/
export default function FailureCodeIndex({ auth, failureCodes, allCodes }: PageProps & Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset } = useForm({
        id: undefined as number | undefined,
        name: '',
        code: '',
        parent_id: '' as string | number | null, // (ใช้ string สำหรับ Select)
    });

    const openModal = (code: FailureCode | null = null) => {
        if (code) {
            setIsEditMode(true);
            setData({
                id: code.id,
                name: code.name,
                code: code.code,
                parent_id: code.parent_id ? String(code.parent_id) : ''
            });
        } else {
            setIsEditMode(false);
            reset();
        }
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    const openDeleteConfirm = (code: FailureCode) => {
        setData('id', code.id);
        setConfirmingDeletion(true);
    };
    const closeDeleteConfirm = () => setConfirmingDeletion(false);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // (แปลง parent_id ที่เป็น '' กลับเป็น null)
        const submitData = {
            ...data,
            parent_id: data.parent_id || null,
        };

        if (isEditMode) {
            patch(route('maintenance.failure-codes.update', data.id), { data: submitData, onSuccess: () => closeModal() });
        } else {
            post(route('maintenance.failure-codes.store'), { data: submitData, onSuccess: () => closeModal() });
        }
    };

    const deleteCode = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        destroy(route('maintenance.failure-codes.destroy', data.id), { onSuccess: () => closeDeleteConfirm() });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">สาเหตุการเสีย (Failure Codes)</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="สาเหตุการเสีย" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => openModal(null)}>+ สร้าง Code ใหม่</Button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>ชื่อ</TableHead>
                                    <TableHead>กลุ่มแม่ (Parent)</TableHead>
                                    <TableHead>ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {failureCodes.data.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="text-center">ไม่พบข้อมูล</TableCell></TableRow>
                                )}
                                {failureCodes.data.map((code) => (
                                    <TableRow key={code.id}>
                                        <TableCell>{code.code}</TableCell>
                                        <TableCell>{code.name}</TableCell>
                                        <TableCell>{code.parent?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => openModal(code)}>แก้ไข</Button>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => openDeleteConfirm(code)}>ลบ</Button>
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
                    <DialogHeader><DialogTitle>{isEditMode ? 'แก้ไข Failure Code' : 'สร้าง Failure Code ใหม่'}</DialogTitle></DialogHeader>
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
                        <div>
                            <Label htmlFor="parent_id">กลุ่มแม่ (Parent)</Label>
                            <Select value={String(data.parent_id || '')} onValueChange={(v) => setData('parent_id', v)}>
                                <SelectTrigger id="parent_id"><SelectValue placeholder="-- (ไม่มีกลุ่มแม่) --" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- (ไม่มีกลุ่มแม่) --</SelectItem>
                                    {allCodes.map(opt => (
                                        // (ป้องกันไม่ให้เลือกตัวเองเป็น Parent)
                                        <SelectItem key={opt.id} value={String(opt.id)} disabled={data.id === opt.id}>
                                            {opt.code} - {opt.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.parent_id} className="mt-2" />
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
                {/* ... (โค้ด Modal ยืนยันการลบ เหมือนของ ActivityType) ... */}
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
