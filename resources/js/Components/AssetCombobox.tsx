import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";

/**
 * (1. 👈 [แก้ไข] Type ของ Asset ที่รับมา)
 */
interface AssetOption {
    id: number;
    name: string;
    asset_code: string;
    // (ลบ 'location' เก่า)
    // location: string | null;
    // (เพิ่ม 'warehouse' Relation ใหม่)
    warehouse: { uuid: string; name: string; } | null;
}

interface AssetComboboxProps {
    assets: AssetOption[];
    value: string; // (ค่าที่ถูกเลือก 'all' หรือ 'id')
    onSelect: (value: string | null) => void;
    placeholder?: string;
}

export function AssetCombobox({ assets, value, onSelect, placeholder = "Select asset..." }: AssetComboboxProps) {
    const [open, setOpen] = React.useState(false);

    // (หา Asset ที่ถูกเลือก เพื่อแสดงผลในปุ่ม)
    const selectedAsset = value === 'all'
        ? null
        : assets.find((asset) => String(asset.id) === value);

    const handleSelect = (currentValue: string) => {
        const newValue = currentValue === value ? null : currentValue;
        onSelect(newValue);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="truncate">
                        {selectedAsset ? `[${selectedAsset.asset_code}] ${selectedAsset.name}` : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search asset..." />
                    <CommandList>
                        <CommandEmpty>No asset found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="all"
                                onSelect={handleSelect}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === 'all' ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                ทั้งหมด
                            </CommandItem>
                            {assets.map((asset) => (
                                <CommandItem
                                    key={asset.id}
                                    value={String(asset.id)}
                                    onSelect={handleSelect}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            String(asset.id) === value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{`[${asset.asset_code}] ${asset.name}`}</span>
                                        {/* (2. 👈 [แก้ไข] แสดงชื่อ Warehouse) */}
                                        <span className="text-xs text-muted-foreground">
                                            {asset.warehouse ? asset.warehouse.name : 'N/A Location'}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
