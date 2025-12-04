import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps, Paginated } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import Pagination from '@/Components/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Label } from '@/Components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { Badge } from '@/Components/ui/badge'; // ต้องมี component นี้
import { Info, MoreHorizontal, ArrowRightLeft, FileBarChart, Wrench } from 'lucide-react';

import InventoryNavigationMenu from '../Inventory/Partials/InventoryNavigationMenu';
import TransferStockModal from './Partials/TransferStockModal';
import AdjustStockModal from './Partials/AdjustStockModal';

interface StockLevelIndexData {
    stock_level_uuid: string;
    item_uuid: string;
    warehouse_uuid: string;
    location_uuid: string;
    item_part_number: string;
    item_name: string;
    warehouse_code: string;
    warehouse_name: string;
    location_code: string;
    location_type: string;
    quantity_on_hand: number;
    quantity_reserved: number;
    quantity_soft_reserved: number;
    quantity_available: number;
}

interface WarehouseOption { uuid: string; name: string; code: string; }

interface IndexProps extends PageProps {
    stockLevels: Paginated<StockLevelIndexData>;
    warehouses: WarehouseOption[];
    filters: { search?: string; warehouse_uuid?: string; };
}

export default function Index({ auth, stockLevels, warehouses, filters }: IndexProps) {

    const { data, setData, get } = useForm({
        search: filters.search || '',
        warehouse_uuid: filters.warehouse_uuid || 'all',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('stock.index'), { preserveState: true, replace: true });
    };

    // ✅ Helper: เลือกสี Badge ตาม Location Type
    const getLocationBadge = (type: string, code: string) => {
        const styles: Record<string, string> = {
            'PICKING': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
            'BULK': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
            'RETURN': 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
            'DAMAGED': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
            'INBOUND': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
        };

        const style = styles[type] || 'bg-slate-100 text-slate-800 border-slate-200';

        return (
            <Badge variant="outline" className={`font-mono ${style}`}>
                {code}
                <span className="ml-1 text-[10px] opacity-70 uppercase">({type})</span>
            </Badge>
        );
    };

    // ✅ State สำหรับ Modal
    const [transferModalOpen, setTransferModalOpen] = React.useState(false);
    const [selectedStock, setSelectedStock] = React.useState<StockLevelIndexData | null>(null);

    const handleOpenTransfer = (stock: StockLevelIndexData) => {
        setSelectedStock(stock);
        setTransferModalOpen(true);
    };

    // ✅ State สำหรับ Adjust Modal
    const [adjustModalOpen, setAdjustModalOpen] = React.useState(false);

    // Helper function สำหรับเปิด Modal
    const handleOpenAdjust = (stock: StockLevelIndexData) => {
        setSelectedStock(stock);
        setAdjustModalOpen(true);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stock Levels</h2>}
            navigationMenu={<InventoryNavigationMenu />}
        >
            <Head title="Stock Levels" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Stock Master View</CardTitle>
                            <div className="flex gap-2">
                                {/* ปุ่มสำหรับรับของเข้า (Shortcut) */}
                                <Button asChild variant="outline" size="sm">
                                    <Link href={route('stock.receive')}>+ Inbound Receive</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end mb-4">
                                <div className="space-y-2">
                                    <Label>Search</Label>
                                    <Input
                                        placeholder="Part No, Name..."
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        className="w-[300px]"
                                    />
                                </div>
                                <div className="space-y-2 min-w-[200px]">
                                    <Label>Warehouse</Label>
                                    <Select value={data.warehouse_uuid} onValueChange={(v) => setData('warehouse_uuid', v)}>
                                        <SelectTrigger><SelectValue placeholder="All Warehouses" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Warehouses</SelectItem>
                                            {warehouses.map(wh => (
                                                <SelectItem key={wh.uuid} value={wh.uuid}>{`[${wh.code}] ${wh.name}`}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit">Search</Button>
                            </form>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="w-[300px]">Item Details</TableHead>
                                            <TableHead>Location (Bin)</TableHead>
                                            <TableHead className="text-right">On Hand</TableHead>
                                            <TableHead className="text-right text-orange-600">Soft Rsrv.</TableHead>
                                            <TableHead className="text-right text-red-600">Hard Rsrv.</TableHead>
                                            <TableHead className="text-right bg-green-50 text-green-700 font-bold">Available</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockLevels.data.length > 0 ? (
                                            stockLevels.data.map((stock) => (
                                                <TableRow key={stock.stock_level_uuid} className="group hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div className="font-bold text-gray-800">{stock.item_part_number}</div>
                                                        <div className="text-xs text-muted-foreground line-clamp-1" title={stock.item_name}>{stock.item_name}</div>
                                                        <div className="text-[10px] text-gray-400 mt-1">{stock.warehouse_code}</div>
                                                    </TableCell>

                                                    <TableCell>
                                                        {/* ✅ แสดง Location แบบ Professional Badge */}
                                                        {getLocationBadge(stock.location_type, stock.location_code)}
                                                    </TableCell>

                                                    <TableCell className="text-right font-mono text-base text-gray-700">
                                                        {stock.quantity_on_hand.toLocaleString()}
                                                    </TableCell>

                                                    <TableCell className="text-right font-mono text-orange-600">
                                                        {stock.quantity_soft_reserved > 0 ? stock.quantity_soft_reserved.toLocaleString() : '-'}
                                                    </TableCell>

                                                    <TableCell className="text-right font-mono text-red-600">
                                                        {stock.quantity_reserved > 0 ? stock.quantity_reserved.toLocaleString() : '-'}
                                                    </TableCell>

                                                    <TableCell className="text-right font-mono font-bold text-green-700 bg-green-50/50">
                                                        {stock.quantity_available.toLocaleString()}
                                                    </TableCell>

                                                    <TableCell>
                                                        {/* ✅ Action Menu สำหรับอนาคต */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => handleOpenTransfer(stock)}>
                                                                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Internal Transfer
                                                                </DropdownMenuItem>
                                                                {/* ✅ ผูกปุ่ม Adjust */}
                                                                <DropdownMenuItem onClick={() => handleOpenAdjust(stock)}>
                                                                    <Wrench className="mr-2 h-4 w-4" /> Adjust Stock
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem>
                                                                    <FileBarChart className="mr-2 h-4 w-4" /> View History (Card)
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                                    No stock found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <Pagination className="mt-4" links={stockLevels.links} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ✅ Put Modal here */}
            <TransferStockModal
                isOpen={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                stockItem={selectedStock}
                warehouseUuid={selectedStock?.warehouse_uuid || ''}
            />

            {/* ✅ Put Adjust Modal Here */}
            {selectedStock && (
                <AdjustStockModal
                    isOpen={adjustModalOpen}
                    onClose={() => setAdjustModalOpen(false)}
                    stockItem={selectedStock}
                />
            )}

        </AuthenticatedLayout>
    );
}
