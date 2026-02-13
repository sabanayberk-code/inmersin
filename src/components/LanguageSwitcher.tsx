'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();

    const handleValueChange = (newLocale: string) => {
        const params = searchParams.toString();
        const query = params ? `?${params}` : '';

        startTransition(() => {
            router.replace(`${pathname}${query}`, { locale: newLocale });
        });
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => handleValueChange('tr')}
                disabled={isPending}
                className={`flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-100 ${locale === 'tr' ? 'opacity-100' : 'opacity-50'}`}
            >
                <img src="https://flagcdn.com/20x15/tr.png" alt="TR" width={20} height={15} className="rounded-sm object-cover" />
                <span>TR</span>
            </button>
            <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-700"></div>
            <button
                onClick={() => handleValueChange('en')}
                disabled={isPending}
                className={`flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-100 ${locale === 'en' ? 'opacity-100' : 'opacity-50'}`}
            >
                <img src="https://flagcdn.com/20x15/gb.png" alt="EN" width={20} height={15} className="rounded-sm object-cover" />
                <span>EN</span>
            </button>
            <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-700"></div>
            <button
                onClick={() => handleValueChange('ru')}
                disabled={isPending}
                className={`flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-100 ${locale === 'ru' ? 'opacity-100' : 'opacity-50'}`}
            >
                <img src="https://flagcdn.com/20x15/ru.png" alt="RU" width={20} height={15} className="rounded-sm object-cover" />
                <span>RU</span>
            </button>
        </div>
    );
}
