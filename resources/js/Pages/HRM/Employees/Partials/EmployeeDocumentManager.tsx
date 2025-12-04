import React, { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react'; // (1. Import Link)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/Components/ui/table';
import InputError from '@/Components/InputError';
import { Trash2, Download, FileText } from 'lucide-react'; // (ไอคอน)
import {
    AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog';

// --- (Interfaces) ---
interface EmployeeDocument {
    id: number;
    title: string;
    document_type: string;
    file_name: string;
    file_size: number;
    expires_at: string | null;
    created_at: string;
}
interface Employee {
    id: number;
    documents: EmployeeDocument[];
}
interface Props {
    employee: Employee;
}

// --- (Helper: แปลงขนาดไฟล์) ---
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function EmployeeDocumentManager({ employee }: Props) {

    // --- (1. ฟอร์มสำหรับ "อัปโหลด") ---
    // (สำคัญ: Inertia/useForm รองรับ File Upload อัตโนมัติ)
    const { data, setData, post, processing, errors, reset, progress } = useForm<{
        title: string;
        document_type: string;
        expires_at: string;
        document: File | null; // (นี่คือไฟล์)
    }>({
        title: '',
        document_type: '',
        expires_at: '',
        document: null,
    });

    // (ฟังก์ชันเมื่อกด "Upload")
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // (ยิงไปที่ Route ที่เราสร้างไว้)
        post(route('hrm.employees.documents.store', employee.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    // --- (2. Logic สำหรับ "ลบ") ---
    const [deletingDocument, setDeletingDocument] = useState<EmployeeDocument | null>(null);

    const submitDelete = () => {
        if (!deletingDocument) return;
        router.delete(route('hrm.documents.destroy', deletingDocument.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingDocument(null),
            onError: () => setDeletingDocument(null),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Employee Documents</CardTitle>
                <CardDescription>
                    Upload and manage contracts, resumes, ID cards, etc.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* --- (ส่วนที่ 1: ฟอร์ม อัปโหลด) --- */}
                <form onSubmit={handleSubmit} className="border p-4 rounded-lg space-y-4">
                    <h4 className="font-medium text-center">Upload New Document</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* (Title) */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Document Title</Label>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                            <InputError message={errors.title} />
                        </div>

                        {/* (Document Type) */}
                        <div className="space-y-2">
                            <Label htmlFor="document_type">Document Type</Label>
                            <Input id="document_type" placeholder="e.g., Contract, Resume, ID Card" value={data.document_type} onChange={(e) => setData('document_type', e.target.value)} />
                            <InputError message={errors.document_type} />
                        </div>

                        {/* (Expires At) */}
                        <div className="space-y-2">
                            <Label htmlFor="expires_at">Expires At (Optional)</Label>
                            <Input id="expires_at" type="date" value={data.expires_at} onChange={(e) => setData('expires_at', e.target.value)} />
                            <InputError message={errors.expires_at} />
                        </div>
                    </div>

                    {/* (File Input) */}
                    <div className="space-y-2">
                        <Label htmlFor="document">File</Label>
                        <Input
                            id="document"
                            type="file"
                            onChange={(e) => setData('document', e.target.files ? e.target.files[0] : null)}
                        />
                        <InputError message={errors.document} />
                    </div>

                    {/* (Upload Progress Bar) */}
                    {progress && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Uploading...' : 'Upload Document'}
                        </Button>
                    </div>
                </form>

                {/* --- (ส่วนที่ 2: ตารางแสดงเอกสาร) --- */}
                <div>
                    <h4 className="font-medium mb-2">Existing Documents</h4>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employee.documents.length > 0 ? (
                                    employee.documents.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell>{doc.title}</TableCell>
                                            <TableCell>{doc.document_type}</TableCell>
                                            <TableCell className="flex items-center space-x-2">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span>{doc.file_name}</span>
                                            </TableCell>
                                            <TableCell>{formatBytes(doc.file_size)}</TableCell>
                                            <TableCell>{doc.expires_at || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                {/* (สำคัญ) ปุ่ม Download ต้องเป็น <a> ธรรมดา */}
                                                <Button asChild variant="ghost" size="icon">
                                                    <a href={route('hrm.documents.download', doc.id)}>
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => setDeletingDocument(doc)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No documents uploaded yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

            </CardContent>

            {/* --- (AlertDialog สำหรับลบ) --- */}
            <AlertDialog open={!!deletingDocument} onOpenChange={(open) => !open && setDeletingDocument(null)}>
                <AlertDialogContent>
                    {deletingDocument ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {deletingDocument.title}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure? This file will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="outline" onClick={() => setDeletingDocument(null)}>Cancel</Button>
                                <Button variant="destructive" onClick={submitDelete}>
                                    Confirm Delete
                                </Button>
                            </AlertDialogFooter>
                        </>
                    ) : null}
                </AlertDialogContent>
            </AlertDialog>

        </Card>
    );
}
