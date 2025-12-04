import React from 'react';
import { useForm, Link } from '@inertiajs/react'; // (1. Import Link)
import { Button } from '@/components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { FileUp, Download } from 'lucide-react'; // (2. Import Download icon)

interface ImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
    const { data, setData, post, processing, errors, reset, progress } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hrm.attendances.import'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Attendance (CSV/Text)</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with columns: `employee_id_no`, `date` (YYYY-MM-DD), `clock_in` (HH:mm), `clock_out` (HH:mm).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* (File Input - เหมือนเดิม) */}
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">Attendance File (.csv)</Label>
                        <Input
                            id="file-upload"
                            type="file"
                            accept=".csv,.txt"
                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                        />
                        <InputError message={errors.file} />
                    </div>

                    {/* (Upload Progress Bar - เหมือนเดิม) */}
                    {progress && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                        </div>
                    )}

                    {/* --- (3. แก้ไข Footer) --- */}
                    <DialogFooter className="flex justify-between sm:justify-between w-full">
                        {/* (ปุ่ม Download Template - วางด้านซ้าย) */}
                        <Button asChild variant="link" className="p-0">
                            {/* (ใช้ <a> ธรรมดา หรือ <Link> ก็ได้ ถ้า route() รู้จัก) */}
                            <a href={route('hrm.attendances.import-template')} target="_blank">
                                <Download className="mr-2 h-4 w-4" />
                                Download Template
                            </a>
                        </Button>

                        {/* (กลุ่มปุ่ม Cancel/Import - วางด้านขวา) */}
                        <div className="flex space-x-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={processing || !data.file}>
                                <FileUp className="mr-2 h-4 w-4" />
                                {processing ? 'Uploading...' : 'Start Import'}
                            </Button>
                        </div>
                    </DialogFooter>
                    {/* --- (สิ้นสุดการแก้ไข) --- */}
                </form>
            </DialogContent>
        </Dialog>
    );
}
