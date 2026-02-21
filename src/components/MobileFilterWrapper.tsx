'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileFilterWrapper({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger Button for Mobile */}
            <div className="lg:hidden flex justify-end mb-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 border rounded-md bg-white dark:bg-gray-800 shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-sm font-medium">Filtreler</span>
                </button>
            </div>

            {/* Backdrop & Sidebar for Mobile */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sidebar Panel */}
                    <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto animate-in slide-in-from-left duration-300">
                        {/* Close button */}
                        <div className="sticky top-0 z-10 flex justify-end p-2 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filter Content */}
                        <div className="p-4 h-full">
                            {children}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop View (always visible, controlled by grid in parent) */}
            <div className="hidden lg:block h-full">
                {children}
            </div>
        </>
    );
}
