import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Paginated } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryNavigationMenu from '@/Pages/Inventory/Partials/InventoryNavigationMenu';

// Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import FilterDropdown from '@/Components/FilterDropdown';
import SortableColumn from '@/Components/SortableColumn';
import ImageViewer from '@/Components/ImageViewer'; // ✅ Import LightBox

// Icons
import { Plus, RefreshCcw, PackageSearch } from 'lucide-react';

// ✅ เพิ่ม image_url ใน Interface
interface ItemIndexData {
    uuid: string;
    part_number: string;
    name: string;
    uom: string;
    category: string;
    images: string[]; // ✅ รับเป็น Array
}

interface IndexProps extends PageProps {
    items: Paginated<ItemIndexData>;
    categories: string[];
    filters: {
        search?: string;
        category?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function Index({ auth, items, categories, filters }: IndexProps) {
    // ... (State Management และ Logic เหมือนเดิม) ...
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [sort, setSort] = useState(filters.sort || 'created_at');
    const [direction, setDirection] = useState<'asc' | 'desc'>(filters.direction || 'desc');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== filters.search) {
                applyFilters(search, category, sort, direction);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const applyFilters = (s: string, c: string, srt: string, dir: 'asc' | 'desc') => {
        router.get(
            route('inventory.items.index'),
            { search: s, category: c, sort: srt, direction: dir },
            { preserveState: true, replace: true }
        );
    };

    const handleCategoryChange = (val: string) => {
        setCategory(val);
        applyFilters(search, val, sort, direction);
    };

    const handleSort = (field: string) => {
        let newDirection: 'asc' | 'desc' = 'asc';
        if (sort === field) {
            newDirection = direction === 'asc' ? 'desc' : 'asc';
        }
        setSort(field);
        setDirection(newDirection);
        applyFilters(search, category, field, newDirection);
    };

    const handleReset = () => {
        setSearch('');
        setCategory('');
        setSort('created_at');
        setDirection('desc');
        applyFilters('', '', 'created_at', 'desc');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Inventory Overview</h2>}
            navigationMenu={<InventoryNavigationMenu />}
        >
            <Head title="Inventory Items" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold tracking-tight">Products</CardTitle>
                                <CardDescription>
                                    Manage your product catalog, categories, and attributes.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleReset}>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                                <Button asChild size="sm">
                                    <Link href={route('inventory.items.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Product
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* --- Toolbar Area --- */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-end sm:items-center">
                                <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <div className="w-full sm:w-[300px]">
                                        <SearchFilter
                                            placeholder="Search by Part No, Name..."
                                            value={search}
                                            onChange={setSearch}
                                            className="w-full"
                                        />
                                    </div>
                                    <FilterDropdown
                                        value={category}
                                        onChange={handleCategoryChange}
                                        options={categories}
                                        placeholder="Filter by Category"
                                        className="w-full sm:w-[200px]"
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Showing <strong>{items.from}-{items.to}</strong> of <strong>{items.total}</strong> products
                                </div>
                            </div>

                            {/* --- Table Area --- */}
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            {/* ✅ เพิ่มคอลัมน์รูปภาพ */}
                                            <TableHead className="w-[60px]">Image</TableHead>

                                            <SortableColumn
                                                label="Part Number"
                                                sortKey="part_number"
                                                currentSort={sort}
                                                currentDirection={direction}
                                                onSort={handleSort}
                                                className="w-[200px]"
                                            />
                                            <SortableColumn
                                                label="Product Name"
                                                sortKey="name"
                                                currentSort={sort}
                                                currentDirection={direction}
                                                onSort={handleSort}
                                            />
                                            <SortableColumn
                                                label="Category"
                                                sortKey="category"
                                                currentSort={sort}
                                                currentDirection={direction}
                                                onSort={handleSort}
                                                className="w-[150px]"
                                            />
                                            <TableHead className="w-[100px]">UoM</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.data.length > 0 ? (
                                            items.data.map((item) => (
                                                <TableRow key={item.uuid} className="hover:bg-muted/5 transition-colors">

                                                    {/* ✅ ส่ง Array images ไปให้ Component */}
                                                    <TableCell className="py-2 pl-4">
                                                        <ImageViewer
                                                            images={item.images}
                                                            alt={item.name}
                                                            className="w-10 h-10 rounded-md border bg-white"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="font-medium font-mono text-primary">
                                                        <Link href={route('inventory.items.show', item.uuid)} className="hover:underline">
                                                            {item.part_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{item.name}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="font-normal">
                                                            {item.category || 'Uncategorized'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {item.uom}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('inventory.items.edit', item.uuid)}>
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                        <PackageSearch className="h-8 w-8 mb-2 opacity-50" />
                                                        <p>No products found matching your criteria.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* --- Pagination --- */}
                            <div className="mt-4">
                                <Pagination links={items.links} />
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
