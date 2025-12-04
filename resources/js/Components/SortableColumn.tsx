import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { TableHead } from '@/Components/ui/table';

interface SortableColumnProps {
    label: string;
    sortKey: string;
    currentSort: string;
    currentDirection: 'asc' | 'desc';
    onSort: (key: string) => void;
    className?: string;
}

export default function SortableColumn({
    label,
    sortKey,
    currentSort,
    currentDirection,
    onSort,
    className
}: SortableColumnProps) {
    const isSorted = currentSort === sortKey;

    return (
        <TableHead className={className}>
            <Button
                variant="ghost"
                onClick={() => onSort(sortKey)}
                className="-ml-4 h-8 data-[state=open]:bg-accent hover:bg-accent/50"
            >
                {label}
                {isSorted ? (
                    currentDirection === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                    )
                ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
                )}
            </Button>
        </TableHead>
    );
}
