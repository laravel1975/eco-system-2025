import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

// 1. Import (อ้างอิงจาก MaintenanceNavigationMenu.tsx)
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/Components/ui/navigation-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/Components/ui/button';
import { ChevronDown } from 'lucide-react';

/**
 * (นี่คือ Component เมนูของ Inventory BC)
 * (สร้างโดยอ้างอิงจาก MaintenanceNavigationMenu.tsx)
 */
export default function InventoryNavigationMenu() {
    return (
        <NavigationMenu>
            <NavigationMenuList>

                {/* (เมนู 1: Dashboard - ใส่ไว้เป็น Placeholder) */}
                <NavigationMenuItem>
                    <Link
                        href={route('inventory.dashboard.index')} // (ในอนาคตอาจจะเป็น route('inventory.dashboard.index'))
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('inventory.dashboard.index') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Dashboard
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 2: Operation - Placeholder) */}
                {/* (เมนู 4: Reports - Dropdown Placeholder) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "h-10 px-4 py-2 text-sm font-medium",
                            (route().current('logistics.*')) ? 'bg-accent text-accent-foreground' : ''
                        )}>
                            Operations <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link href={route('logistics.picking.index')}>Picking</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('logistics.delivery.index')}>Delivery</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('logistics.return-notes.index')}>Return Note</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* (เมนู 3: Items - นี่คือส่วนหลักของเรา) */}
                <NavigationMenuItem>
                    <Link
                        href={route('inventory.items.index')} // (Route ที่เราสร้างใน Backend)
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('inventory.items.*') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Products
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 4: Reports - Dropdown Placeholder) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "h-10 px-4 py-2 text-sm font-medium",
                            (route().current('stock.index')) ? 'bg-accent text-accent-foreground' : ''
                        )}>
                            Reports <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link href={route('stock.index')}>Stock On Hand</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="#">Low Stock Report</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* (เมนู 5: Settings - Dropdown Placeholder) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "h-10 px-4 py-2 text-sm font-medium",
                            (route().current('warehouses.index')) ? 'bg-accent text-accent-foreground' : ''
                        )}>
                            Settings <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link href={route('warehouses.index')}>Warehouse</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </NavigationMenuList>
        </NavigationMenu>
    );
};
