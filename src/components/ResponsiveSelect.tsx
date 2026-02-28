'use client';

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown } from "lucide-react"

interface ResponsiveSelectProps {
    options: { label: string, value: string; className?: string }[];
    value: string;
    onValueChange: (val: string) => void;
    placeholder: string;
    label?: string;
    disabled?: boolean;
}

export function ResponsiveSelect({
    options,
    value,
    onValueChange,
    placeholder,
    label,
    disabled
}: ResponsiveSelectProps) {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const selectedItem = React.useMemo(() => options.find(o => o.value === value), [options, value]);

    if (isDesktop) {
        return (
            <Select open={open} onOpenChange={setOpen} value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger className="w-full bg-white dark:bg-gray-900 h-9 md:h-10 text-xs md:text-sm">
                    <SelectValue placeholder={placeholder}>
                        {selectedItem?.label}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                    <SelectGroup>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className={opt.className}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild disabled={disabled}>
                <button className="flex w-full items-center justify-between rounded-md border border-input bg-white dark:bg-gray-900 px-3 py-2 text-xs h-9 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className={value ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-500"}>
                        {selectedItem ? selectedItem.label : placeholder}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
            </DrawerTrigger>
            {/* 85vh to cover most of the screen but leave enough context that it's a drawer */}
            <DrawerContent className="h-[85vh] max-h-[85vh] fixed bottom-0 left-0 right-0 z-50 flex flex-col items-stretch outline-none">
                {label && (
                    <DrawerHeader className="border-b shrink-0 py-4">
                        <DrawerTitle className="text-left font-bold text-gray-800 dark:text-gray-100">
                            {label}
                        </DrawerTitle>
                    </DrawerHeader>
                )}
                <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1 pb-10">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            className={`px-4 py-3 text-left w-full rounded-md text-sm transition-colors ${value === opt.value ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-200 dark:shadow-none" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-transparent border border-transparent dark:border-gray-800 mb-1"}`}
                            onClick={() => { onValueChange(opt.value); setOpen(false); }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </DrawerContent>
        </Drawer>
    )
}
