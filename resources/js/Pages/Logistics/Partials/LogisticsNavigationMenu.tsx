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
export default function LogisticsNavigationMenu() {
    return (
        <NavigationMenu>
            <NavigationMenuList>

                {/* (เมนู 1: Dashboard - ใส่ไว้เป็น Placeholder) */}
                <NavigationMenuItem>
                    <Link
                        href="#" // (ในอนาคตอาจจะเป็น route('inventory.dashboard.index'))
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('logistics.dashboard') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Dashboard
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 2: Delivery - Placeholder) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "h-10 px-4 py-2 text-sm font-medium",
                            (route().current('logistics.delivery.index')||route().current('logistics.shipments.index')) ? 'bg-accent text-accent-foreground' : ''
                        )}>
                            TPMS <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link href={route('logistics.shipments.index')}>Shipments</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('logistics.vehicles.index')}>Vehicles</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* (เมนู 3: Items - นี่คือส่วนหลักของเรา) */}
                <NavigationMenuItem>
                    <Link
                        href={route('logistics.vehicles.index')} // (Route ที่เราสร้างใน Backend)
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('logistics.vehicles.index') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Reports
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 4: Reports - Dropdown Placeholder) */}
                {/* <DropdownMenu>
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
                </DropdownMenu> */}

            </NavigationMenuList>
        </NavigationMenu>
    );
};
