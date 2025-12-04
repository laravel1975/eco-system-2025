import React from 'react';
import NavLink from '@/Components/NavLink';
import { usePage } from '@inertiajs/react';

export default function StockNavigationMenu() {
    const { component } = usePage();
    const isStockModule = component.startsWith('Stock/');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16">
                <div className="flex space-x-8">
                    <NavLink
                        href={route('stock.index')}
                        active={isStockModule}
                    >
                        Stock Levels
                    </NavLink>
                </div>
            </div>
        </div>
    );
}
