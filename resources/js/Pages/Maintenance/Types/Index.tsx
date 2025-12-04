import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { MaintenanceType, PaginatedResponse } from '@/types/maintenance';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/

// (ข้อมูลสำหรับ Form - เราไม่ส่ง 'id' ตอนสร้าง)
type MaintenanceTypeFormData = Omit<MaintenanceType, 'id'>;

interface Props {
    types: PaginatedResponse<MaintenanceType>;
}

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function MaintenanceTypeIndex({ auth, types }: PageProps & Props) {
    // (State สำหรับ Modal)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset } = useForm({
        id: undefined as number | undefined,
        name: '',
        code: '',
        description: '',
    });

    // (ฟังก์ชันเปิด Modal)
    const openModal = (type: MaintenanceType | null = null) => {
        if (type) {
            // (โหมดแก้ไข)
            setIsEditMode(true);
            setData({
                id: type.id,
                name: type.name,
                code: type.code,
                description: type.description || '',
            });
        } else {
            // (โหมดสร้างใหม่)
            setIsEditMode(false);
            reset(); // (ล้างฟอร์ม)
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    // (ฟังก์ชันยืนยันการลบ)
    const openDeleteConfirm = (type: MaintenanceType) => {
        setData('id', type.id); // (เก็บ ID ที่จะลบ)
        setConfirmingDeletion(true);
    };

    const closeDeleteConfirm = () => setConfirmingDeletion(false);

    // (ฟังก์ชัน Submit)
    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEditMode) {
            // (Update)
            patch(route('maintenance.types.update', data.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            // (Store)
            post(route('maintenance.types.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    // (ฟังก์ชันลบ)
    const deleteType = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        destroy(route('maintenance.types.destroy', data.id), {
            onSuccess: () => closeDeleteConfirm(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">ประเภทงานซ่อม</h2>}
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="ประเภทงานซ่อม" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* (ปุ่มสร้าง) */}
                    <div className="flex justify-end mb-4">
                        <PrimaryButton onClick={() => openModal(null)}>
                            + สร้างประเภทใหม่
                        </PrimaryButton>
                    </div>

                    {/* (ตาราง) */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="w-full whitespace-nowrap">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-left font-bold">
                                    <th className="px-6 py-3">Code</th>
                                    <th className="px-6 py-3">ชื่อ</th>
                                    <th className="px-6 py-3">คำอธิบาย</th>
                                    <th className="px-6 py-3">ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {types.data.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
                                )}
                                {types.data.map((type) => (
                                    <tr key={type.id} className="hover:bg-gray-100 border-b">
                                        <td className="px-6 py-4">{type.code}</td>
                                        <td className="px-6 py-4">{type.name}</td>
                                        <td className="px-6 py-4">{type.description}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openModal(type)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => openDeleteConfirm(type)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* (Modal สำหรับ สร้าง/แก้ไข) */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEditMode ? 'แก้ไขประเภทงานซ่อม' : 'สร้างประเภทงานซ่อมใหม่'}
                    </h2>
                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="ชื่อ *" />
                            <TextInput id="name" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="code" value="Code *" />
                            <TextInput id="code" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.code} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="description" value="คำอธิบาย" />
                            <TextInput id="description" value={data.description} onChange={e => setData('description', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>ยกเลิก</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>
                            {isEditMode ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึก'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* (Modal ยืนยันการลบ) */}
            <Modal show={confirmingDeletion} onClose={closeDeleteConfirm}>
                <form onSubmit={deleteType} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">ยืนยันการลบ</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? (อาจเกิดข้อผิดพลาดหากข้อมูลนี้ถูกใช้งานอยู่)
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeDeleteConfirm}>ยกเลิก</SecondaryButton>
                        <DangerButton className="ml-3" disabled={processing}>ยืนยันการลบ</DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
