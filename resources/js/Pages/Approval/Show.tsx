import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    FileText, Printer, CheckCircle2, XCircle,
    Clock, ArrowLeft, User, Calendar,
    AlertTriangle, Paperclip, ChevronRight
} from 'lucide-react';

// UI Components
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { Textarea } from "@/Components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import SalesNavigationMenu from '@/Pages/Sales/Partials/SalesNavigationMenu'; // หรือเมนูที่เหมาะสมกับ Context

// --- Interfaces ---
interface EmployeeProfile {
    id: number;
    position?: { name: string };
    signature_url?: string; // URL ลายเซ็น
}

interface Actor {
    id: number;
    name: string;
    employeeProfile?: EmployeeProfile;
}

interface ApprovalAction {
    id: number;
    action: 'approve' | 'reject' | 'comment';
    comment: string | null;
    created_at: string;
    actor: Actor;
}

interface ApprovalStep {
    id: number;
    order: number;
    approver_role: string;
}

interface ApprovalRequest {
    id: string;
    document_number: string;
    subject_id: string;
    subject_type: string;
    status: string;
    created_at: string;
    workflow: { name: string; code: string; };
    requester: { name: string; email: string; employeeProfile?: EmployeeProfile };
    current_step?: ApprovalStep;
    payload_snapshot: Record<string, any>;
    actions: ApprovalAction[];
    workflow_steps_count?: number; // Optional: จำนวน Step ทั้งหมด
}

interface Props {
    auth: any;
    request: ApprovalRequest;
}

export default function ApprovalShow({ auth, request }: Props) {
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [comment, setComment] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Helpers ---
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    // --- Action Handler ---
    const handleActionClick = (type: 'approve' | 'reject') => {
        setActionType(type);
        setComment('');
        setActionModalOpen(true);
    };

    const confirmAction = () => {
        if (!actionType) return;
        setIsProcessing(true);

        router.post(route('approval.action'), {
            request_id: request.id,
            action: actionType,
            comment: comment
        }, {
            onSuccess: () => {
                setIsProcessing(false);
                setActionModalOpen(false);
            },
            onError: () => setIsProcessing(false)
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            // เลือกเมนูตาม Context ของงาน (ตัวอย่างใส่ Sales)
            navigationMenu={request.workflow.code.startsWith('SALES') ? <SalesNavigationMenu /> : undefined}
        >
            <Head title={`Approval ${request.document_number}`} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* --- 1. Top Header & Breadcrumbs --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Link href={route('sales.approvals.index')} className="hover:text-blue-600 flex items-center gap-1">
                                <ArrowLeft className="w-3 h-3" /> Back to List
                            </Link>
                            <span className="text-gray-300">/</span>
                            <span>Details</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {request.document_number}
                            <Badge variant="outline" className={`gap-1 ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                {request.status.toUpperCase()}
                            </Badge>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Print Button */}
                        <a href={route('approval.print', request.id)} target="_blank" rel="noreferrer">
                            <Button variant="outline" className="gap-2 border-gray-300">
                                <Printer className="w-4 h-4 text-gray-600" />
                                Print PDF
                            </Button>
                        </a>

                        {/* Action Buttons (Show only if Pending) */}
                        {request.status === 'pending' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleActionClick('reject')}
                                >
                                    Reject
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm"
                                    onClick={() => handleActionClick('approve')}
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Approve Request
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* --- 2. Left Column: Details & Payload --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Info Card */}
                        <Card>
                            <CardHeader className="bg-gray-50/50 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-gray-800">
                                            {request.workflow.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <FileText className="w-3.5 h-3.5" />
                                            Ref ID: <span className="font-mono font-medium text-blue-600">{request.subject_id}</span>
                                        </CardDescription>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <p className="flex items-center justify-end gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(request.created_at).toLocaleDateString('th-TH')}
                                        </p>
                                        <p className="text-xs mt-0.5">
                                            {new Date(request.created_at).toLocaleTimeString('th-TH')}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Requester</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                {request.requester.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{request.requester.name}</p>
                                                <p className="text-sm text-gray-500">{request.requester.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Department / Position</p>
                                        <p className="font-medium text-gray-900">
                                            {request.requester.employeeProfile?.position?.name || 'Staff'}
                                        </p>
                                        <p className="text-sm text-gray-500">Sales Department</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payload Details (Smart View) */}
                        <Card className="border-l-4 border-l-blue-500 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-blue-500" />
                                    Request Details (รายละเอียดคำขอ)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {Object.entries(request.payload_snapshot).map(([key, value], index) => (
                                                <tr key={key} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                                    <td className="px-4 py-3 font-medium text-gray-600 w-1/3 border-r border-gray-100 capitalize">
                                                        {key.replace(/_/g, ' ')}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-900 font-mono">
                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {request.subject_type.includes('Order') && (
                                    <div className="mt-4 flex justify-end">
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                            View Original Document <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* --- 3. Right Column: Timeline & Signatures --- */}
                    <div className="lg:col-span-1">
                        <Card className="h-full border-gray-200 shadow-sm">
                            <CardHeader className="bg-gray-50 border-b border-gray-100">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    Approval Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">

                                    {/* Render Actions History */}
                                    {request.actions.map((action, index) => (
                                        <div key={action.id} className="relative pl-8">
                                            {/* Icon Dot */}
                                            <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ring-4 ring-white ${
                                                action.action === 'approve' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />

                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                                                        action.action === 'approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {action.action}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(action.created_at).toLocaleDateString('th-TH')}
                                                    </span>
                                                </div>

                                                <p className="font-semibold text-sm text-gray-900 mt-1">{action.actor.name}</p>
                                                <p className="text-xs text-gray-500">{action.actor.employeeProfile?.position?.name || 'Approver'}</p>

                                                {/* 🔥 แสดงลายเซ็น (Signature) ถ้ามี */}
                                                {action.action === 'approve' && action.actor.employeeProfile?.signature_url && (
                                                    <div className="mt-2 p-2 border border-dashed border-gray-300 bg-gray-50 rounded w-fit">
                                                        <img
                                                            src={action.actor.employeeProfile.signature_url}
                                                            alt="Signature"
                                                            className="h-8 object-contain opacity-90"
                                                        />
                                                    </div>
                                                )}

                                                {/* Comment */}
                                                {action.comment && (
                                                    <div className="mt-2 text-sm bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-100 italic">
                                                        "{action.comment}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Current/Next Step Indicator */}
                                    {request.status === 'pending' && request.current_step && (
                                        <div className="relative pl-8 animate-pulse">
                                            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full ring-4 ring-white bg-orange-400" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-orange-600">
                                                    Current Step: {request.current_step.approver_role}
                                                </span>
                                                <span className="text-xs text-gray-500">Waiting for approval...</span>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>

                {/* --- Action Modal --- */}
                <AlertDialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className={actionType === 'approve' ? 'text-green-600' : 'text-red-600'}>
                                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                คุณกำลังจะ <strong>{actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}</strong> เอกสารนี้
                                ระบบจะบันทึกลายเซ็นดิจิทัลของคุณลงในเอกสาร
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <label className="text-sm font-medium mb-2 block text-gray-700">
                                ความคิดเห็นเพิ่มเติม (Optional)
                            </label>
                            <Textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder={actionType === 'approve' ? "ระบุหมายเหตุ..." : "ระบุเหตุผลที่ปฏิเสธ..."}
                                className={actionType === 'reject' ? 'border-red-200 focus:ring-red-500' : ''}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmAction}
                                disabled={isProcessing || (actionType === 'reject' && !comment)}
                                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            >
                                {isProcessing ? 'Processing...' : 'Confirm'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </AuthenticatedLayout>
    );
}
