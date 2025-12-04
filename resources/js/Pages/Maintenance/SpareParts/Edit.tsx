import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SparePartForm, { SparePartFormData } from './Partials/SparePartForm'; // (1. 👈 [แก้ไข] Import Type)
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';
import DangerButton from '@/Components/DangerButton'; // (Import DangerButton)
import Modal from '@/Components/Modal'; // (Import Modal)
import SecondaryButton from '@/Components/SecondaryButton'; // (Import SecondaryButton)

// (2. 👈 [ใหม่] Type สำหรับ List Item)
interface ItemOption {
    uuid: string;
    name: string;
    part_number: string;
}

// (3. 👈 [แก้ไข] Type ของ SparePart ที่รับมา)
interface SparePart {
    id: number;
    name: string;
    part_number: string;
    description: string | null;
    item_uuid: string | null; // (เพิ่ม 'item_uuid')
    // (ลบ field เก่า)
    // location: string | null;
    // unit_cost: string | null;
    // reorder_level: string | null;
    // stock_quantity: number;
}

// (4. 👈 [แก้ไข] รับ 'items' prop)
interface Props {
    sparePart: SparePart;
    items: ItemOption[];
}

export default function EditSparePart({ auth, sparePart, items }: PageProps & Props) {

    // (5. 👈 [แก้ไข] แก้ไข useForm)
    const { data, setData, patch, processing, errors, delete: destroy } = useForm<SparePartFormData>({
        name: sparePart.name,
        part_number: sparePart.part_number,
        description: sparePart.description || '', // (แก้จาก null)
        item_uuid: sparePart.item_uuid || '', // (เพิ่ม 'item_uuid')
        // (ลบ field เก่า)
    });

    // (Modal State)
    const [confirmingDeletion, setConfirmingDeletion] = React.useState(false);

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        patch(route('maintenance.spare-parts.update', sparePart.id));
    }

    // (Delete Functions)
    const confirmDeletion = () => { setConfirmingDeletion(true); };
    const closeModal = () => { setConfirmingDeletion(false); };
    const deleteSparePart = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        destroy(route('maintenance.spare-parts.destroy', sparePart.id), {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">แก้ไขอะไหล่: {sparePart.name}</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title={`แก้ไข ${sparePart.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <SparePartForm
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    items={items} // (6. 👈 [ส่ง] prop ลงไป)
                                    // (ลบ isEditMode)
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t">
                                <DangerButton
                                    type="button"
                                    onClick={confirmDeletion}
                                    disabled={processing}
                                >
                                    ลบข้อมูล
                                </DangerButton>
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={route('maintenance.spare-parts.index')}
                                        as="button"
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        ยกเลิก
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        บันทึกการเปลี่ยนแปลง
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* (Modal ยืนยันการลบ) */}
            <Modal show={confirmingDeletion} onClose={closeModal}>
                <form onSubmit={deleteSparePart} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        ยืนยันการลบข้อมูล
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        คุณแน่ใจหรือไม่ว่าต้องการลบอะไหล่นี้ ({sparePart.name})?
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>
                            ยกเลิก
                        </SecondaryButton>
                        <DangerButton className="ml-3" disabled={processing}>
                            ยืนยันการลบ
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
