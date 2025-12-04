import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

// (1. Import ทุกอย่างที่เมนูนี้ต้องการ)
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

/*
|--------------------------------------------------------------------------
| (2. นี่คือ Component เมนูของ Maintenance BC)
|--------------------------------------------------------------------------
| (3. เพิ่ม export default)
*/
export default function MaintenanceNavigationMenu() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                {/* (เมนู 1: Dashboard ของ Maintenance) */}
                <NavigationMenuItem>
                    <Link
                        href={route('maintenance.dashboard.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('maintenance.dashboard.index') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Dashboard
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 2: Work Orders) */}
                <NavigationMenuItem>
                    <Link
                        href={route('maintenance.work-orders.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('maintenance.work-orders.*') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Work Orders
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 3: Requests) */}
                <NavigationMenuItem>
                    <Link
                        href={route('maintenance.requests.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('maintenance.requests.*') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Requests
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 3: PM Plans) */}
                <NavigationMenuItem>
                    <Link
                        href={route('maintenance.plans.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('maintenance.plans.*') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        PM Plans
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link
                        href={route('maintenance.calendar.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('maintenance.calendar.index') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Calendar
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 3: Reports (Dropdown)) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "h-10 px-4 py-2 text-sm font-medium",
                            (route().current('maintenance.reports.*'))
                                ? 'bg-accent text-accent-foreground' : ''
                        )}>
                            Reports <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.reports.index')}>Main Report (Cost/KPIs)</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.reports.pareto')}>Pareto Analysis (RCA)</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.reports.asset-pareto')}>Asset Pareto (Frequency)</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.reports.cost')}>Cost Trend (Monthly)</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.reports.technician')}>Technician KPI</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.reports.downtime')}>Downtime Report</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* (เมนู 4: Settings (Dropdown)) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "h-10 px-4 py-2 text-sm font-medium",
                            (route().current('maintenance.assets.*') ||
                                route().current('maintenance.spare-parts.*') ||
                                route().current('maintenance.types.*'))
                                ? 'bg-accent text-accent-foreground' : ''
                        )}>
                            Configuration <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.assets.index')}>Assets</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.spare-parts.index')}>Spare Parts</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.types.index')}>Types</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.activity-types.index')}>Activity Types (ประเภทกิจกรรม)</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('maintenance.failure-codes.index')}>Failure Codes (สาเหตุการเสีย)</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('warehouses.index')}>Warehouses</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('inventory.items.index')}>Items</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </NavigationMenuList>
        </NavigationMenu>
    );
};
