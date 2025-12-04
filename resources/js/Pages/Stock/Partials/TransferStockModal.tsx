import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import { Loader2, ArrowRight, ArrowRightLeft } from "lucide-react";
import axios from 'axios';
import { Badge } from '@/Components/ui/badge';

interface TransferStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    stockItem: any;
    warehouseUuid: string;
}

export default function TransferStockModal({ isOpen, onClose, stockItem, warehouseUuid }: TransferStockModalProps) {
    // 1. Hooks
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        item_uuid: '',
        warehouse_uuid: '', // เริ่มต้นว่างไว้ก่อน
        from_location_uuid: '',
        to_location_uuid: '',
        quantity: 1,
        reason: ''
    });

    const [locations, setLocations] = useState<any[]>([]);
    const [isLoadingLocs, setIsLoadingLocs] = useState(false);

    // 2. Calculated Values
    const maxQty = stockItem ? parseFloat(stockItem.quantity_available) : 0;
    const isQtyValid = data.quantity > 0 && data.quantity <= maxQty;

    // 3. Effects
    useEffect(() => {
        if (isOpen && stockItem && warehouseUuid) {
            // ✅ Reset form เฉพาะตอนเปิด Modal ครั้งแรก หรือเปลี่ยน Item
            setData({
                item_uuid: stockItem.item_uuid || '',
                warehouse_uuid: warehouseUuid,
                from_location_uuid: stockItem.location_uuid || '',
                to_location_uuid: '', // Reset destination
                quantity: 1,
                reason: ''
            });
            clearErrors();

            // Load Locations
            setIsLoadingLocs(true);
            axios.get(route('stock.api.warehouse.locations', warehouseUuid))
                .then(res => {
                    setLocations(res.data);
                })
                .catch(console.error)
                .finally(() => setIsLoadingLocs(false));
        }
    }, [isOpen, stockItem?.stock_level_uuid]); // ✅ Dependency แค่นี้พอ ไม่ต้องใส่ warehouseUuid ซ้ำซ้อน

    // 4. Handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isQtyValid) return;

        post(route('stock.transfer'), {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    const handleSetMax = () => setData('quantity', maxQty);

    // ✅ Debug: เช็คค่าเมื่อมีการเลือก
    const handleLocationChange = (val: string) => {
        console.log("Selected Location UUID:", val);
        setData('to_location_uuid', val);
    };

    if (!stockItem) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                        </div>
                        Internal Stock Transfer
                    </DialogTitle>
                    <DialogDescription>
                        Moving stock within <strong>{stockItem.warehouse_name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">

                    {/* ... (Product Card & From Location เหมือนเดิม) ... */}
                    <div className="flex items-start gap-4 p-4 bg-slate-50 border rounded-lg">
                        <div className="flex-1 space-y-1">
                            <p className="text-xs text-gray-500 font-mono">Part No.</p>
                            <p className="font-bold text-gray-800">{stockItem.item_part_number}</p>
                        </div>
                        <div className="flex-[2] space-y-1">
                            <p className="text-xs text-gray-500">Item Name</p>
                            <p className="font-medium text-gray-700 line-clamp-1" title={stockItem.item_name}>
                                {stockItem.item_name}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-500">From Location</Label>
                            <div className="h-10 px-3 flex items-center bg-gray-100 border rounded-md font-mono text-sm text-gray-600 cursor-not-allowed">
                                {stockItem.location_code}
                            </div>
                        </div>
                        <div className="pb-3 text-gray-400"><ArrowRight className="w-5 h-5" /></div>

                        <div className="space-y-2">
                            <Label className="text-xs text-gray-500">To Location</Label>

                            {/* ✅ Select Component */}
                            <Select
                                value={data.to_location_uuid}
                                onValueChange={handleLocationChange} // ใช้ Handler แยกเพื่อ Debug
                                disabled={isLoadingLocs}
                            >
                                <SelectTrigger className={errors.to_location_uuid ? "border-red-500" : ""}>
                                    <SelectValue placeholder={isLoadingLocs ? "Loading..." : "Select Bin..."} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {locations
                                        .filter(loc => loc.uuid !== data.from_location_uuid)
                                        .map(loc => (
                                        <SelectItem key={loc.uuid} value={loc.uuid}>
                                            <span className="font-mono font-bold mr-2">{loc.code}</span>
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1">{loc.type}</Badge>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {errors.to_location_uuid && <p className="text-red-500 text-xs text-right">{errors.to_location_uuid}</p>}

                    {/* ... (Quantity & Reason เหมือนเดิม) ... */}
                    <div className="space-y-2">
                        <Label>Quantity to Move</Label>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="any"
                                    max={maxQty}
                                    value={data.quantity}
                                    onChange={e => setData('quantity', parseFloat(e.target.value))}
                                    className={!isQtyValid ? "border-red-500 text-red-600 focus-visible:ring-red-500" : "font-bold"}
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-gray-400">Units</span>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={handleSetMax} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                Max ({maxQty})
                            </Button>
                        </div>
                        {!isQtyValid && <p className="text-red-500 text-xs">Quantity must be between 0.01 and {maxQty}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Reason / Note</Label>
                        <Textarea
                            placeholder="Why are you moving this stock?"
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            className="resize-none h-20"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.to_location_uuid || !isQtyValid}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Transfer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
