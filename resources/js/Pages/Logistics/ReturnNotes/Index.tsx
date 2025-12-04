import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Search, RotateCcw, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

// Components
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent } from "@/Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import InventoryNavigationMenu from '@/Pages/Inventory/Partials/InventoryNavigationMenu';

interface ReturnNote {
    id: string;
    return_number: string;
    order_number: string;
    customer_name: string;
    status: string;
    reason: string;
    created_at: string;
}

interface Props {
    auth: any;
    returnNotes: { data: ReturnNote[]; links: any[]; total: number };
    filters: { search: string; };
}

export default function ReturnNoteIndex({ auth, returnNotes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('logistics.return-notes.index'), { search }, { preserveState: true, replace: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Restock</Badge>;
            case 'completed': return <Badge className="bg-green-600">Restocked</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} navigationMenu={<InventoryNavigationMenu />}>
            <Head title="Return Notes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold text-2xl text-gray-800 leading-tight flex items-center gap-2">
                                <RotateCcw className="w-6 h-6 text-orange-600" /> Return Notes (ใบคืนสินค้า)
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">จัดการสินค้านำกลับเข้าคลังจากการยกเลิกออเดอร์</p>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Return No, Order No..."
                                        className="pl-8"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Search</Button>
                            </form>

                            {/* Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Return No.</TableHead>
                                            <TableHead>Order Ref.</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {returnNotes.data.length > 0 ? (
                                            returnNotes.data.map((note) => (
                                                <TableRow key={note.id}>
                                                    <Link href={route('logistics.return-notes.show', note.id)}>
                                                        <TableCell className="font-medium">{note.return_number}</TableCell>
                                                    </Link>
                                                    <TableCell>{note.order_number}</TableCell>
                                                    <TableCell>{note.customer_name}</TableCell>
                                                    <TableCell className="text-gray-500 max-w-[200px] truncate" title={note.reason}>
                                                        {note.reason}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(note.status)}</TableCell>
                                                    <TableCell className="text-gray-500">{note.created_at}</TableCell>
                                                    <TableCell className="text-right">
                                                        {note.status === 'pending' ? (
                                                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700" asChild>
                                                                <Link href={route('logistics.return-notes.process', note.id)}>
                                                                    Process <ArrowRight className="w-3 h-3 ml-1" />
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <Button size="sm" variant="ghost" asChild>
                                                                <Link href={route('logistics.return-notes.show', note.id)}>
                                                                    View
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                                                    No return notes found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
