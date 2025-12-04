import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Loader2, Wrench, AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from '@/Components/ui/badge';

interface AdjustStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    stockItem: any;
}

export default function AdjustStockModal({ isOpen, onClose, stockItem }: AdjustStockModalProps) {
    if (!stockItem) return null;

    const { data, setData, post, processing, errors, reset } = useForm({
        item_uuid: '',
        warehouse_uuid: '',
        location_uuid: '',
        new_quantity: 0 as number | string, // ✅ Allow string for empty state
        reason: ''
    });

    // คำนวณส่วนต่าง (Diff) เพื่อแสดงผล
    const currentQty = parseFloat(stockItem.quantity_on_hand);

    // ✅ Safe Calculation: แปลงเป็น 0 ถ้าเป็นค่าว่างหรือ NaN
    const newQtyNumeric = data.new_quantity === '' || isNaN(Number(data.new_quantity)) ? 0 : Number(data.new_quantity);
    const diff = newQtyNumeric - currentQty;

    const isZero = diff === 0;
    const isPositive = diff > 0;

    useEffect(() => {
        if (isOpen && stockItem) {
            setData({
                item_uuid: stockItem.item_uuid,
                warehouse_uuid: stockItem.warehouse_uuid,
                location_uuid: stockItem.location_uuid,
                new_quantity: currentQty,
                reason: ''
            });
        }
    }, [isOpen, stockItem]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('stock.adjust'), {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-700">
                        <div className="p-2 bg-orange-100 rounded-full">
                            <Wrench className="w-5 h-5" />
                        </div>
                        Adjust Stock Balance
                    </DialogTitle>
                    <DialogDescription>
                        Correcting stock quantity for <strong>{stockItem.item_part_number}</strong> at <strong>{stockItem.location_code}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">

                    {/* Warning Banner */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex gap-3 items-start text-sm text-yellow-800">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold">Admin/Audit Only:</span> This action will update the physical stock count immediately. Please ensure you have counted the items correctly.
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 items-center">
                        {/* Current (Read Only) */}
                        <div className="space-y-2">
                            <Label className="text-gray-500">Current On Hand</Label>
                            <div className="h-10 px-3 flex items-center justify-end bg-gray-100 border rounded-md font-mono font-bold text-gray-600">
                                {currentQty}
                            </div>
                        </div>

                        {/* New (Input) */}
                        <div className="space-y-2">
                            <Label className="text-blue-600 font-bold">New Quantity (Counted)</Label>
                            <Input
                                type="number"
                                step="any"
                                min="0"
                                // ✅ ป้องกัน NaN Warning: ถ้าเป็น NaN ให้ส่งค่าว่างไปแทน
                                value={data.new_quantity}
                                onChange={e => {
                                    const val = e.target.value;
                                    // ✅ Handle Empty String: ถ้าลบหมดให้เป็น '' ถ้ามีค่าให้เป็นตัวเลข
                                    setData('new_quantity', val === '' ? '' : parseFloat(val));
                                }}
                                className="text-right font-mono font-bold border-blue-300 focus-visible:ring-blue-500 text-lg"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Diff Indicator */}
                    {!isZero && (
                        <div className="flex items-center justify-center gap-3 p-2 bg-slate-50 rounded border border-dashed">
                            <span className="text-sm text-gray-500">Adjustment:</span>
                            <Badge variant={isPositive ? "default" : "destructive"} className="text-sm px-2">
                                {isPositive ? '+' : ''}{diff} Units
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">
                                {isPositive ? "Stock Increase (Found)" : "Stock Decrease (Loss/Damaged)"}
                            </span>
                        </div>
                    )}

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label>Reason for Adjustment <span className="text-red-500">*</span></Label>
                        <Textarea
                            placeholder="e.g. Cycle count mismatch, Damaged goods found"
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            className="resize-none h-20"
                            required
                        />
                        {errors.reason && <p className="text-red-500 text-xs">{errors.reason}</p>}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={processing || isZero || !data.reason}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Adjustment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
