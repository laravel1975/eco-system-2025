import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Textarea } from "@/Components/ui/textarea";
import { CheckCircle, XCircle, FileText, Clock, AlertCircle } from 'lucide-react';
import { PageProps } from '@/types'; // หรือ path ที่คุณเก็บ types หลักไว้
import ApprovalsNavigationMenu from './Partials/ApprovalsNavigationMenu';

// --- Types Definition ---
interface ApprovalStep {
    order: number;
    approver_role: string;
}

interface Workflow {
    name: string;
}

interface Requester {
    name: string;
}

interface ApprovalItem {
    id: string;
    document_number?: string;
    subject_id: string;
    status: string;
    created_at: string;
    workflow: Workflow;
    requester: Requester;
    current_step?: ApprovalStep;
    current_step_order: number;
}

interface Props extends PageProps {
    approvals: {
        data: ApprovalItem[];
        links: any[]; // สำหรับ Pagination
    };
}

// --- Main Component ---
export default function ApprovalIndex({ auth, approvals }: Props) {
    // ใช้ useForm ของ Inertia เพื่อจัดการ State และ Post Data
    const { data, setData, post, processing, reset } = useForm({
        request_id: '',
        action: '',
        comment: ''
    });

    // State สำหรับควบคุมว่าจะเปิดกล่อง Comment ของ ID ไหน
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // ฟังก์ชันยิง Action ไปที่ Controller
    const handleAction = (id: string, action: 'approve' | 'reject') => {
        const actionLabel = action === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ / ตีกลับ';

        // 1. Confirm ก่อนทำรายการ
        if (!confirm(`ยืนยันการ ${actionLabel} รายการนี้?`)) return;

        // 2. ใช้ router.post แทน useForm.post
        // เพื่อให้เราสามารถ custom data payload (id, action) ผสมกับ state (comment) ได้อิสระ
        router.post(route('approval.action'), {
            // --- Payload (ข้อมูลที่จะส่งไป Controller) ---
            request_id: id,
            action: action,
            comment: data.comment // ดึง comment จาก state ของฟอร์ม
        }, {
            // --- Options (การจัดการหน้าเว็บหลังส่ง) ---
            preserveScroll: true, // ไม่ต้องเลื่อนหน้าจอกลับไปบนสุด
            onSuccess: () => {
                reset(); // ล้างช่อง comment
                setSelectedId(null); // ปิดกล่อง input
            },
            onFinish: () => {
                // (Optional) โค้ดที่จะรันเมื่อ process เสร็จไม่ว่าจะ success หรือ error
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} navigationMenu={<ApprovalsNavigationMenu/>}>
            <Head title="รายการรออนุมัติ" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <Card className="shadow-sm border-t-4 border-t-blue-600">
                        <CardHeader className="border-b bg-gray-50/50">
                            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                                <FileText className="w-5 h-5 text-blue-600" />
                                รายการที่ต้องตรวจสอบ (Pending Tasks)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {approvals.data.length === 0 ? (
                                    // --- กรณีไม่มีงานค้าง ---
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                        <CheckCircle className="w-12 h-12 text-green-100 mb-4" />
                                        <p className="text-lg font-medium">ไม่มีรายการค้างอนุมัติ</p>
                                        <p className="text-sm">งานทั้งหมดเรียบร้อยดี!</p>
                                    </div>
                                ) : (
                                    // --- Loop แสดงรายการ ---
                                    approvals.data.map((item) => (
                                        <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors duration-150">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                                                {/* ส่วนแสดงข้อมูลด้านซ้าย */}
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center flex-wrap gap-2">
                                                        <Badge variant="outline" className="font-mono text-blue-700 bg-blue-50 border-blue-200">
                                                            {item.workflow?.name}
                                                        </Badge>

                                                        {/* เลขที่เอกสาร */}
                                                        <span className="font-bold text-lg text-gray-900">
                                                            {item.document_number || item.subject_id}
                                                        </span>

                                                        {/* 🔥 Badge แสดงสถานะ: รอใครอยู่? */}
                                                        {item.status === 'pending' && item.current_step && (
                                                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 flex items-center gap-1 shadow-sm">
                                                                <Clock className="w-3 h-3" />
                                                                รอ: {item.current_step.approver_role} (Step {item.current_step.order})
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        <p className="flex items-center gap-2">
                                                            <span className="text-gray-400 min-w-[60px]">ผู้ร้องขอ:</span>
                                                            <span className="font-medium text-gray-900">{item.requester?.name || 'N/A'}</span>
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <span className="text-gray-400 min-w-[60px]">ส่งเมื่อ:</span>
                                                            <span>{new Date(item.created_at).toLocaleString('th-TH')}</span>
                                                        </p>
                                                    </div>

                                                    {/* กล่องใส่ Comment (จะโชว์เมื่อกดปุ่มตรวจสอบ) */}
                                                    {selectedId === item.id && (
                                                        <div className="mt-4 p-4 bg-white border border-blue-100 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                ความคิดเห็น / เหตุผลประกอบ (ถ้ามี)
                                                            </label>
                                                            <Textarea
                                                                placeholder="เช่น อนุมัติเบิกจ่ายได้ทันที, เอกสารไม่ครบ..."
                                                                className="min-h-[80px] mb-3 focus-visible:ring-blue-500"
                                                                value={data.comment}
                                                                onChange={e => setData('comment', e.target.value)}
                                                            />
                                                            <div className="flex gap-3 justify-end items-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    onClick={() => setSelectedId(null)}
                                                                    disabled={processing}
                                                                >
                                                                    ยกเลิก
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => handleAction(item.id, 'reject')}
                                                                    disabled={processing}
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-2" />
                                                                    ไม่อนุมัติ
                                                                </Button>
                                                                <Button
                                                                    className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                                                                    onClick={() => handleAction(item.id, 'approve')}
                                                                    disabled={processing}
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                                    ยืนยันอนุมัติ
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ปุ่ม Action ด้านขวา (ซ่อนเมื่อเปิดกล่อง Comment แล้ว) */}
                                                {selectedId !== item.id && (
                                                    <div className="flex items-center">
                                                        <Button
                                                            variant="default"
                                                            className="w-full md:w-auto shadow-sm"
                                                            onClick={() => {
                                                                setSelectedId(item.id);
                                                                setData('comment', ''); // เคลียร์ comment เก่า
                                                            }}
                                                        >
                                                            ตรวจสอบ / อนุมัติ
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
