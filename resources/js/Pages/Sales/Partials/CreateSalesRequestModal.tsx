import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/Components/ui/select";
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Configuration: 15 Scenarios ---
const REQUEST_TYPES = [
    { group: 'Sales & Price', items: [
        { code: 'SALES_PRICE_APPROVE', label: '1. ขออนุมัติราคาพิเศษ (Special Price)', needs: ['order_id', 'target_price'] },
        { code: 'SALES_DISCOUNT_APPROVE', label: '2. ขออนุมัติส่วนลด (Discount)', needs: ['order_id', 'discount_percent'] },
        { code: 'SALES_QUOTATION_APPROVE', label: '3. อนุมัติใบเสนอราคา (Quotation)', needs: ['quotation_id'] },
    ]},
    { group: 'Customer & Credit', items: [
        { code: 'CRM_NEW_CUSTOMER', label: '4. อนุมัติเปิดลูกค้าใหม่ (New Customer)', needs: ['customer_id'] },
        { code: 'FINANCE_CREDIT_LIMIT', label: '5. อนุมัติวงเงินเครดิต (Credit Limit)', needs: ['customer_id', 'new_credit_limit'] },
    ]},
    { group: 'Production & Product', items: [
        { code: 'PROD_URGENT_ORDER', label: '6. อนุมัติงานด่วน (Urgent Order)', needs: ['order_id', 'reason'] },
        { code: 'QC_SPEC_CHANGE', label: '8. อนุมัติแก้ไขสเปค (Spec Change)', needs: ['product_id', 'change_details'] },
        { code: 'MKT_ARTWORK_APPROVE', label: '9. อนุมัติ Artwork / Packaging', needs: ['product_id', 'file_attachment'] },
        { code: 'ENG_NEW_MOLD', label: '10. อนุมัติเปิดโมลด์ใหม่ (New Mold)', needs: ['project_name', 'mold_cost'] },
        { code: 'PROD_START_JOB', label: '11. อนุมัติเปิดงานผลิต (Start Job)', needs: ['job_order_id'] },
    ]},
    { group: 'After Sales & Others', items: [
        { code: 'LOG_RMA_APPROVE', label: '7. อนุมัติคืนสินค้า (RMA)', needs: ['invoice_id', 'reason'] },
        { code: 'GEN_NEW_PROJECT', label: '12. อนุมัติ Project ใหม่', needs: ['project_name', 'budget'] },
        { code: 'QC_CLAIM_REQUEST', label: '13. อนุมัติ Claim / Warranty', needs: ['claim_id', 'defect_desc'] },
        { code: 'SALES_REPLACEMENT', label: '14. อนุมัติส่งของทดแทน', needs: ['original_order_id', 'reason'] },
        { code: 'ACC_EXTRA_EXPENSE', label: '15. อนุมัติค่าใช้จ่ายเพิ่มเติม', needs: ['expense_type', 'amount'] },
    ]}
];

export default function CreateSalesRequestModal() {
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const { data, setData, post, processing, errors, reset } = useForm({
        workflow_code: '',
        // Common Fields
        subject_id: '', // Reference ID (Order ID, Customer ID)
        remark: '',
        // Dynamic Payload Fields
        payload: {} as Record<string, any>
    });

    const handleTypeChange = (value: string) => {
        setData(prev => ({
            ...prev,
            workflow_code: value,
            payload: {} // Reset payload when type changes
        }));
    };

    const handlePayloadChange = (key: string, value: any) => {
        setData('payload', { ...data.payload, [key]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // ยิงไปที่ Route กลางสำหรับสร้าง Request
        post(route('sales.approvals.store'), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            }
        });
    };

    // --- Dynamic Form Renderer ---
    const renderDynamicFields = () => {
        switch (data.workflow_code) {
            case 'SALES_DISCOUNT_APPROVE':
                return (
                    <div className="space-y-2">
                        <Label>Reference Order ID / Number</Label>
                        <Input
                            placeholder="e.g. SO-2025-001"
                            value={data.subject_id}
                            onChange={e => setData('subject_id', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-red-600">Discount Percent (%)</Label>
                                <Input
                                    type="number"
                                    placeholder="0-100"
                                    onChange={e => handlePayloadChange('discount_percent', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Total Amount (Before)</Label>
                                <Input type="number" onChange={e => handlePayloadChange('total_amount', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );

            case 'PROD_URGENT_ORDER':
                return (
                    <div className="space-y-2">
                        <Label>Urgent Order Number</Label>
                        <Input
                            placeholder="e.g. SO-2025-888"
                            value={data.subject_id}
                            onChange={e => setData('subject_id', e.target.value)}
                        />
                        <Label className="text-red-600">Reason for Urgency</Label>
                        <Textarea
                            placeholder="Why is this urgent? (e.g. Line down, Customer escalation)"
                            onChange={e => {
                                handlePayloadChange('reason', e.target.value);
                                handlePayloadChange('is_urgent', true); // Auto set flag
                            }}
                        />
                    </div>
                );

            case 'FINANCE_CREDIT_LIMIT':
                return (
                    <div className="space-y-2">
                        <Label>Customer Code / Name</Label>
                        <Input
                            placeholder="e.g. CUS-001"
                            value={data.subject_id}
                            onChange={e => setData('subject_id', e.target.value)}
                        />
                        <Label className="text-blue-600">Requested Credit Limit (THB)</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 1,000,000"
                            onChange={e => handlePayloadChange('new_credit_limit', e.target.value)}
                        />
                    </div>
                );

            // ... เพิ่ม Case สำหรับข้ออื่นๆ ตามต้องการ ...

            default:
                // Default Form for generic requests
                if (!data.workflow_code) return <div className="text-sm text-gray-400 text-center py-4">Please select a request type first</div>;

                return (
                    <div className="space-y-2">
                        <Label>Reference Document / ID</Label>
                        <Input
                            placeholder="Document Number or ID"
                            value={data.subject_id}
                            onChange={e => setData('subject_id', e.target.value)}
                        />
                        <Label>Additional Details</Label>
                        <Textarea
                            placeholder="Details..."
                            onChange={e => handlePayloadChange('details', e.target.value)}
                        />
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size={'icon'} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="w-2 h-2" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Sales Approval Request</DialogTitle>
                    <DialogDescription>
                        เลือกประเภทคำขอและกรอกข้อมูลให้ครบถ้วนเพื่อส่งอนุมัติ
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">

                    {/* 1. Select Type */}
                    <div className="space-y-2">
                        <Label>Request Type (ประเภทคำขอ)</Label>
                        <Select onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="-- Select Type --" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {REQUEST_TYPES.map((group, i) => (
                                    <React.Fragment key={i}>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                                            {group.group}
                                        </div>
                                        {group.items.map((item) => (
                                            <SelectItem key={item.code} value={item.code}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.workflow_code && <p className="text-red-500 text-xs">{errors.workflow_code}</p>}
                    </div>

                    {/* 2. Dynamic Fields Area */}
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-100 min-h-[150px]">
                        {renderDynamicFields()}
                    </div>

                    {/* 3. Common Remark */}
                    <div className="space-y-2">
                        <Label>Remark (Optional)</Label>
                        <Input
                            placeholder="Note for approver..."
                            value={data.remark}
                            onChange={e => setData('remark', e.target.value)}
                        />
                    </div>

                </form>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={processing || !data.workflow_code || !data.subject_id} className="bg-blue-600 hover:bg-blue-700">
                        {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
