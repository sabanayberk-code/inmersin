'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';

export default function ViewToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentView = searchParams.get('view') || 'grid';

    const handleViewChange = (view: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', view);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border rounded p-1">
            <button
                onClick={() => handleViewChange('grid')}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${currentView === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-500'}`}
                title="Grid Görünüm"
            >
                <LayoutGrid className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleViewChange('table')}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${currentView === 'table' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-500'}`}
                title="Liste Görünüm"
            >
                <List className="w-4 h-4" />
            </button>
        </div>
    );
}
