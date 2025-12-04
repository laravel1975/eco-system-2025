import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, RotateCcw, PackageCheck, AlertCircle, Image as ImageIcon, Camera, Loader2, CheckCircle2 } from "lucide-react";

// Components
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import InventoryNavigationMenu from '@/Pages/Inventory/Partials/InventoryNavigationMenu';
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import ImageViewer from '@/Components/ImageViewer';
import ImageUploader from '@/Components/ImageUploader';

interface ReturnItem {
    id: number;
    product_id: string;
    product_name: string;
    quantity: number;
    image_url?: string;
}

interface ReturnNote {
    id: string;
    return_number: string;
    order_number: string;
    customer_name: string;
    status: string;
    reason: string;
    created_at: string;
}

interface EvidenceImage {
    id: number;
    url: string;
    description?: string;
}

interface Props {
    auth: any;
    returnNote: ReturnNote;
    items: ReturnItem[];
    evidences: EvidenceImage[];
}

export default function ReturnNoteProcess({ auth, returnNote, items, evidences }: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const isPending = returnNote.status === 'pending';

    // ✅ Helper: ตรวจสอบว่ามีรูปหลักฐานหรือยัง
    const hasEvidence = evidences.length > 0;

    // Helper Icon (ถ้าไม่มี import)
    // const CheckCircle2 = ({ className }: { className?: string }) => (
    //     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
    // );

    const handleConfirm = () => {
        // Double Check (เผื่อ Hack ปุ่ม)
        if (!hasEvidence) {
            alert('⚠️ จำเป็นต้องอัปโหลดรูปภาพหลักฐานก่อนยืนยัน');
            return;
        }

        if (confirm('ยืนยันการรับสินค้าคืนเข้าคลัง? สต็อกจะถูกเพิ่มทันที')) {
            router.post(route('logistics.return-notes.confirm', returnNote.id));
        }
    };

    // ✅ Handler: อัปโหลดรูปทันทีเมื่อเลือกไฟล์
    const handleUploadEvidence = (files: File[]) => {
        if (files.length === 0) return;

        setIsUploading(true); // เปิด Loading

        router.post(route('logistics.return-notes.evidence.store', returnNote.id), {
            images: files
        }, {
            preserveScroll: true,
            forceFormData: true, // 👈 สำคัญ! บังคับส่งเป็น Multipart Form Data
            onSuccess: () => {
                setIsUploading(false);
                // หน้าเว็บจะ Refresh และรูปจะโผล่มาใน evidences
            },
            onError: () => {
                setIsUploading(false);
                alert('Upload failed. Please try again.');
            }
        });
    };

    // ✅ Handler: ลบรูป
    const handleRemoveEvidence = (id: number) => {
        if (confirm('Delete this evidence image?')) {
            router.delete(route('logistics.return-notes.evidence.destroy', id), {
                preserveScroll: true
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} navigationMenu={<InventoryNavigationMenu />}>
            <Head title={`Return ${returnNote.return_number}`} />

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('logistics.return-notes.index')}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                {returnNote.return_number}
                                {returnNote.status === 'completed' && <Badge className="bg-green-600">Restocked</Badge>}
                                {returnNote.status === 'pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>}
                            </h1>
                            <p className="text-sm text-gray-500">Ref Order: {returnNote.order_number}</p>
                        </div>
                    </div>

                    {/* ✅ ปุ่ม Confirm (จะ Disabled ถ้ายังไม่มีรูป) */}
                    {isPending && (
                        <Button
                            size="lg"
                            className={`gap-2 ${hasEvidence ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-300 cursor-not-allowed'}`}
                            onClick={handleConfirm}
                            disabled={!hasEvidence} // 👈 ล็อกปุ่ม
                        >
                            <PackageCheck className="w-5 h-5" /> Confirm Restock
                        </Button>
                    )}
                </div>

                {/* Info & Alert */}
                <div className="grid gap-6">
                    {isPending && (
                        <Alert className={hasEvidence ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}>
                            {hasEvidence ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                            )}
                            <AlertTitle className={hasEvidence ? "text-green-800" : "text-orange-800"}>
                                {hasEvidence ? "Ready to Restock" : "Action Required"}
                            </AlertTitle>
                            <AlertDescription className={hasEvidence ? "text-green-700" : "text-orange-700"}>
                                {hasEvidence
                                    ? "คุณได้แนบหลักฐานครบถ้วนแล้ว สามารถกดปุ่ม Confirm Restock เพื่อรับของเข้าคลังได้เลย"
                                    : "กรุณาตรวจสอบสินค้าจริง **ถ่ายรูปสภาพสินค้าเป็นหลักฐาน** ก่อนกดรับของคืนเข้าสต็อก"
                                }
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* รายละเอียด */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">รายละเอียดการคืน</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Customer:</span><span className="font-medium">{returnNote.customer_name}</span></div>
                                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Reason:</span><span className="font-medium text-red-600">{returnNote.reason}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Created At:</span><span>{returnNote.created_at}</span></div>
                            </CardContent>
                        </Card>

                        {/* ✅ Evidence Upload Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Camera className="w-5 h-5 text-gray-500" /> Evidence / หลักฐานสภาพสินค้า
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isPending && (
                                    <div className="mb-4">
                                        {/* Uploader */}
                                        <div className={isUploading ? "opacity-50 pointer-events-none" : ""}>
                                            <ImageUploader
                                                value={[]}
                                                onChange={handleUploadEvidence}
                                                // แสดงรูปที่มีอยู่
                                                existingImages={evidences.map(e => ({ id: e.id, url: e.url, is_primary: false }))}
                                                onRemoveExisting={handleRemoveEvidence}
                                            />
                                        </div>

                                        {/* Loading State */}
                                        {isUploading && (
                                            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mt-2">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                                            </div>
                                        )}

                                        {/* Warning Message */}
                                        {!hasEvidence && !isUploading && (
                                            <p className="text-xs text-red-500 mt-2 text-center font-medium bg-red-50 py-1 rounded">
                                                * จำเป็นต้องอัปโหลดรูปอย่างน้อย 1 รูป
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Read-only View (เมื่อจบงานแล้ว) */}
                                {!isPending && (
                                    evidences.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {evidences.map(e => (
                                                <div key={e.id} className="aspect-square rounded-md overflow-hidden border bg-gray-50">
                                                    <ImageViewer images={[e.url]} alt="Evidence" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic text-center py-4 border rounded bg-gray-50">No evidence uploaded.</p>
                                    )
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Items List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><RotateCcw className="w-5 h-5 text-gray-500" /> Items to Restock</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">#</TableHead>
                                        <TableHead className="w-[80px] text-center">Image</TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Qty Return</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-gray-500">{index + 1}</TableCell>
                                            <TableCell className="text-center">
                                                {item.image_url ? (
                                                    <ImageViewer images={[item.image_url]} alt={item.product_name} className="w-10 h-10 rounded border bg-white object-contain" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border text-gray-300 mx-auto"><ImageIcon className="w-5 h-5" /></div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.product_name}</div>
                                                <div className="text-xs text-gray-500">{item.product_id}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-lg text-orange-600">+{item.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
