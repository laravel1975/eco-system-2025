import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Loader2, Package, Ruler, Info } from "lucide-react";
import axios from 'axios';

interface ProductDetail {
    id: string;
    part_number: string;
    name: string;
    description: string;
    image_url: string | null;
    stock_on_hand: number;
    price: number;
}

interface Props {
    productId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ViewProductModal({ productId, isOpen, onClose }: Props) {
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && productId) {
            setLoading(true);
            setError('');
            // เรียก API ที่เราสร้างไว้ในขั้นตอนที่ 1
            axios.get(route('inventory.items.api-show', productId))
                .then(res => setProduct(res.data))
                .catch(() => setError('Failed to load product details.'))
                .finally(() => setLoading(false));
        } else {
            setProduct(null);
        }
    }, [isOpen, productId]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Product Details
                    </DialogTitle>
                    <DialogDescription>
                        รายละเอียดสินค้าสำหรับรหัส: <span className="font-mono font-bold text-gray-800">{productId}</span>
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : product ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        {/* ส่วนรูปภาพ */}
                        <div className="bg-gray-50 rounded-lg flex items-center justify-center h-48 md:h-full border">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                                <Package className="h-16 w-16 text-gray-300" />
                            )}
                        </div>

                        {/* ส่วนข้อมูล */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-500">{product.part_number}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{product.description || "No description available."}</span>
                                </div>
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-sm text-gray-500">Stock on Hand:</span>
                                    <span className="font-mono font-bold">{product.stock_on_hand} Units</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end mt-4">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
