'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, User, ShieldCheck, Tags } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
    user?: {
        role?: string | null;
    } | null;
}

export default function Sidebar({ user }: SidebarProps) {
    const t = useTranslations('Navigation');
    const pathname = usePathname();

    const links = [
        {
            href: '/dashboard',
            label: t('dashboard'),
            icon: LayoutDashboard,
            exact: true
        },
        {
            href: '/dashboard/profile',
            label: t('profile'),
            icon: User,
            exact: false
        }
    ];

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                {links.map((link) => {
                    const isActive = link.exact
                        ? pathname === link.href
                        : pathname.startsWith(link.href);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 font-medium border-l-4 border-blue-600"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-l-4 border-transparent"
                            )}
                        >
                            <link.icon size={20} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}

                {user?.role === 'admin' && (
                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                        <Link
                            href="/dashboard/users"
                            className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover:bg-red-50 text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            <ShieldCheck size={20} />
                            <span>Kullanıcılar</span>
                        </Link>
                        <Link
                            href="/dashboard/brands"
                            className="flex items-center gap-3 px-4 py-3 mt-2 rounded-md transition-colors hover:bg-purple-50 text-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                        >
                            <Tags size={20} />
                            <span>Marka Talepleri</span>
                        </Link>
                    </div>
                )}
            </nav>
        </aside>
    );
}
