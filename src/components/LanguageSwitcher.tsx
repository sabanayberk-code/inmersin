'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    const handleValueChange = (newLocale: string) => {
        setIsOpen(false);
        const params = searchParams.toString();
        const query = params ? `?${params}` : '';

        startTransition(() => {
            router.replace(`${pathname}${query}`, { locale: newLocale });
        });
    };

    const flags: Record<string, { label: string, src: string }> = {
        tr: { label: 'TR', src: "https://flagcdn.com/20x15/tr.png" },
        en: { label: 'EN', src: "https://flagcdn.com/20x15/gb.png" },
        ru: { label: 'RU', src: "https://flagcdn.com/20x15/ru.png" }
    };

    const currentFlag = flags[locale] || flags['tr'];

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <img src={currentFlag.src} alt={currentFlag.label} width={20} height={15} className="rounded-sm object-cover" />
                <span className="text-sm font-medium">{currentFlag.label}</span>
                <Menu className="w-5 h-5 text-gray-500 ml-1" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full mt-1 left-0 md:left-auto md:right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-1 z-50 flex flex-col gap-1 min-w-[100px]">
                        {Object.entries(flags).map(([key, item]) => (
                            <button
                                key={key}
                                onClick={() => handleValueChange(key)}
                                disabled={isPending}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left ${locale === key ? 'bg-gray-50 dark:bg-gray-700 font-bold' : ''}`}
                            >
                                <img src={item.src} alt={item.label} width={20} height={15} className="rounded-sm object-cover" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
