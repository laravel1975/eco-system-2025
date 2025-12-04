import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeft, Printer, RotateCcw,
    FileText, User, Calendar, Package, Image as ImageIcon, AlertTriangle
} from "lucide-react";
import { format } from 'date-fns';
import InventoryNavigationMenu from '@/Pages/Inventory/Partials/InventoryNavigationMenu';
import ImageViewer from '@/Components/ImageViewer';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

// --- Types ---
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
    status: string;
    reason: string;
    created_at: string;
    customer_name: string;
    order_number: string;
    items: ReturnItem[];
    evidences?: { id: number, url: string }[];
}

interface Props {
    auth: any;
    returnNote: ReturnNote;
}

export default function ReturnNoteShow({ auth, returnNote }: Props) {

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            completed: "bg-green-100 text-green-700 border-green-200",
        };
        return (
            <Badge variant="outline" className={`px-3 py-1 rounded-full font-semibold print:hidden ${styles[status] || "bg-gray-100 text-gray-700"}`}>
                {status.toUpperCase()}
            </Badge>
        );
    };

    const encodeCode128 = (text: string) => text;

    return (
        <AuthenticatedLayout user={auth.user} navigationMenu={<div className="print:hidden"><InventoryNavigationMenu /></div>}>
            <Head>
                <title>{`Return ${returnNote.return_number}`}</title>
                <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <style>{`
                    @media print {
                        @page { margin: 0; size: A4; }
                        body { background-color: white !important; -webkit-print-color-adjust: exact; }
                        nav, header, .no-print { display: none !important; }
                        .print-container { width: 100%; margin: 0; padding: 1.5cm; box-shadow: none !important; border: none !important; }
                        .print-hidden { display: none; }
                    }
                `}</style>
            </Head>

            <div className="min-h-screen bg-gray-100/80 pb-12 pt-6 print:bg-white print:pt-0 print:pb-0">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">

                    {/* Action Toolbar */}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white shadow-sm hover:bg-gray-50 border-gray-300" asChild>
                                <Link href={route('logistics.return-notes.index')}>
                                    <ArrowLeft className="h-4 w-4 text-gray-600" />
                                </Link>
                            </Button>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold text-gray-900">{returnNote.return_number}</h1>
                                    {getStatusBadge(returnNote.status)}
                                </div>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <RotateCcw className="w-3 h-3" /> Ref Order: {returnNote.order_number}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* <Button variant="outline" onClick={() => window.print()} className="flex-1 sm:flex-none bg-white shadow-sm gap-2 border-gray-300">
                                <Printer className="w-4 h-4" /> Print Note
                            </Button> */}

                            {/* ✅ เปลี่ยนเป็นปุ่ม Download PDF */}
                            <a href={route('logistics.return-notes.pdf', returnNote.id)} target="_blank">
                                <Button variant="outline" className="flex-1 sm:flex-none bg-white shadow-sm gap-2 border-gray-300">
                                    <Printer className="w-4 h-4" /> Print PDF
                                </Button>
                            </a>

                            {returnNote.status === 'pending' && (
                                <Button asChild className="flex-1 sm:flex-none gap-2 bg-orange-600 hover:bg-orange-700 shadow-md text-white">
                                    <Link href={route('logistics.return-notes.show', returnNote.id)}>Process Return</Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Document Sheet */}
                    <div className="print-container bg-white rounded-xl shadow-xl border border-gray-200 p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-red-500 no-print" />

                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center font-bold text-2xl rounded-lg shadow-sm">T</div>
                                    <div>
                                        <h2 className="font-bold text-xl leading-none tracking-tight text-gray-900">TMR EcoSystem</h2>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Logistics Division</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> <span className="font-semibold text-gray-900">Date:</span></div>
                                    <div>{format(new Date(), 'dd MMM yyyy')}</div>
                                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> <span className="font-semibold text-gray-900">Customer:</span></div>
                                    <div className="font-medium text-gray-900">{returnNote.customer_name}</div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 mb-2">
                                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Document Type</span>
                                    <div className="text-lg font-black text-red-600">RETURN NOTE</div>
                                </div>
                                <div className="relative mt-2">
                                    <div className="text-6xl text-gray-900 select-none transform scale-y-110 scale-x-90" style={{ fontFamily: '"Libre Barcode 128", cursive' }}>
                                        {encodeCode128(returnNote.return_number)}
                                    </div>
                                    <div className="text-center font-mono font-bold text-sm tracking-widest text-gray-500 -mt-2">
                                        {returnNote.return_number}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reason Block */}
                        <div className="mb-8 bg-red-50 border border-red-100 rounded-lg p-4">
                            <h3 className="text-xs font-bold uppercase text-red-500 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Return Reason
                            </h3>
                            <p className="text-sm font-medium text-gray-800">{returnNote.reason}</p>
                        </div>

                        {/* Items Table */}
                        <div className="mb-10">
                            <div className="rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                                        <tr>
                                            <th className="py-3 pl-4 text-left w-12">#</th>
                                            <th className="py-3 text-left">Product Details</th>
                                            <th className="py-3 text-left w-32">Part No.</th>
                                            <th className="py-3 text-right w-32 pr-6 bg-red-50/50 text-red-700 border-l">Qty Return</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {returnNote.items.map((item, index) => (
                                            <tr key={index} className="group page-break hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 pl-4 align-top text-gray-400 font-medium">{index + 1}</td>
                                                <td className="py-4 align-top">
                                                    <div className="flex gap-4">
                                                        {item.image_url ? (
                                                            <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden print-hidden">
                                                                <ImageViewer images={[item.image_url]} alt={item.product_name} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 print-hidden">
                                                                <Package className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-base">{item.product_name}</div>
                                                            <div className="text-xs text-gray-500 mt-1">Product ID: {item.product_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 align-top font-mono text-xs text-gray-600">{item.product_id}</td>
                                                <td className="py-4 align-top text-right pr-6 font-bold text-lg text-red-700 bg-red-50/10 border-l border-gray-100">
                                                    +{item.quantity} <span className="text-xs font-normal text-gray-500">Units</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Evidence Photos (Show on Print if needed, usually optional) */}
                        {returnNote.evidences && returnNote.evidences.length > 0 && (
                            <div className="mb-10 page-break break-inside-avoid">
                                <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 flex items-center gap-2 border-b pb-2">
                                    <ImageIcon className="w-4 h-4" /> Evidence Photos
                                </h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {returnNote.evidences.map((ev) => (
                                        <div key={ev.id} className="aspect-square rounded border bg-gray-50 overflow-hidden">
                                            <img src={ev.url} className="w-full h-full object-cover grayscale-[50%]" alt="Evidence" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Signature */}
                        <div className="mt-auto page-break break-inside-avoid">
                            <div className="grid grid-cols-2 gap-12 pt-8 border-t-2 border-gray-100">
                                <div className="text-center group">
                                    <p className="font-bold text-xs uppercase text-gray-400 mb-12 tracking-widest group-hover:text-gray-600 transition-colors">Returned By (Customer)</p>
                                    <div className="border-b border-gray-300 mx-8 mb-2"></div>
                                    <p className="text-[10px] text-gray-400">Date: ____ / ____ / ________</p>
                                </div>
                                <div className="text-center group">
                                    <p className="font-bold text-xs uppercase text-gray-400 mb-12 tracking-widest group-hover:text-gray-600 transition-colors">Received By (Warehouse)</p>
                                    <div className="border-b border-gray-300 mx-8 mb-2"></div>
                                    <p className="text-[10px] text-gray-400">Date: ____ / ____ / ________</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
