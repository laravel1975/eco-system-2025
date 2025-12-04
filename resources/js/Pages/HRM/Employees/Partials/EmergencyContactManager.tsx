import React, { useState } from 'react'; // <-- (1. Import useState)
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/Components/ui/table';
import InputError from '@/Components/InputError';
import { Trash2 } from 'lucide-react';

// --- (2. Import AlertDialog) ---
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
// --- (สิ้นสุดการ Import) ---


// --- (Interfaces - เหมือนเดิม) ---
interface EmergencyContact {
    id: number;
    name: string;
    relationship: string;
    phone_number: string;
}
interface Employee {
    id: number;
    emergency_contacts: EmergencyContact[];
}
interface Props {
    employee: Employee;
}

export default function EmergencyContactManager({ employee }: Props) {

    // (ฟอร์มสำหรับ "เพิ่ม" - เหมือนเดิม)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        relationship: '',
        phone_number: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hrm.employees.emergency-contacts.store', employee.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    // --- (3. แก้ไข Logic การลบ) ---

    // (สร้าง State ใหม่สำหรับควบคุม Modal)
    const [deletingContact, setDeletingContact] = useState<EmergencyContact | null>(null);

    // (ลบฟังก์ชัน handleDelete เดิม)
    /*
    const handleDelete = (contactId: number) => {
        if (!window.confirm('Are you sure...')) { return; }
        router.delete(route('hrm.emergency-contacts.destroy', contactId), {
            preserveScroll: true,
        });
    };
    */

    // (สร้างฟังก์ชันใหม่สำหรับ "ยืนยัน" การลบ)
    const submitDelete = () => {
        if (!deletingContact) return;

        router.delete(route('hrm.employees.emergency-contacts.destroy', deletingContact.id), {
            preserveScroll: true,
            // (เมื่อลบสำเร็จ ให้ปิด Modal)
            onSuccess: () => setDeletingContact(null),
            onError: () => setDeletingContact(null),
        });
    };
    // --- (สิ้นสุดการแก้ไข Logic) ---


    return (
        <Card>
            <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>
                    Add and manage the employee's emergency contacts.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* (ฟอร์มเพิ่มผู้ติดต่อ - เหมือนเดิม) */}
                <form onSubmit={handleSubmit} className="border p-4 rounded-lg space-y-4">
                    {/* ... (เนื้อหาฟอร์มเหมือนเดิม) ... */}
                     <h4 className="font-medium text-center">Add New Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="relationship">Relationship</Label>
                            <Input id="relationship" placeholder="e.g., Spouse, Parent, Sibling" value={data.relationship} onChange={(e) => setData('relationship', e.target.value)} />
                            <InputError message={errors.relationship} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input id="phone_number" value={data.phone_number} onChange={(e) => setData('phone_number', e.target.value)} />
                            <InputError message={errors.phone_number} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Add Contact'}
                        </Button>
                    </div>
                </form>

                {/* (ตารางแสดงผู้ติดต่อ - แก้ไข onClick) */}
                <div>
                    <h4 className="font-medium mb-2">Existing Contacts</h4>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                {/* ... (Header เหมือนเดิม) ... */}
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Relationship</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employee.emergency_contacts.length > 0 ? (
                                    employee.emergency_contacts.map((contact) => (
                                        <TableRow key={contact.id}>
                                            <TableCell>{contact.name}</TableCell>
                                            <TableCell>{contact.relationship}</TableCell>
                                            <TableCell>{contact.phone_number}</TableCell>
                                            <TableCell className="text-right">

                                                {/* --- (4. แก้ไข onClick) --- */}
                                                {/* (เปลี่ยนจาก handleDelete เป็น setDeletingContact) */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => setDeletingContact(contact)} // <-- แก้ไขตรงนี้
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                {/* --- (สิ้นสุดการแก้ไข) --- */}

                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No emergency contacts added yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

            </CardContent>

            {/* --- (5. เพิ่ม AlertDialog ที่นี่) --- */}
            {/* (วางไว้ข้างนอก CardContent แต่ยังอยู่ใน <Card>) */}
            <AlertDialog open={!!deletingContact} onOpenChange={(open) => !open && setDeletingContact(null)}>
                <AlertDialogContent>
                    {deletingContact ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {deletingContact.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="outline" onClick={() => setDeletingContact(null)}>Cancel</Button>
                                <Button variant="destructive" onClick={submitDelete}>
                                    Confirm Delete
                                </Button>
                            </AlertDialogFooter>
                        </>
                    ) : null}
                </AlertDialogContent>
            </AlertDialog>
            {/* --- (สิ้นสุดการเพิ่ม) --- */}

        </Card>
    );
}
