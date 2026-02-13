'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

import { logout } from '@/app/[locale]/auth/actions';

interface NavbarProps {
    user?: {
        name: string;
        email: string;
        role?: string | null;
    } | null;
}

export default function Navbar({ user }: NavbarProps) {
    const t = useTranslations('Navigation');
    const tAuth = useTranslations('Auth');

    return (
        <nav className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Inmersin
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <Link href="/contact" className="text-sm font-medium hover:text-blue-600 transition-colors">
                    {t('contact')}
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <LanguageSwitcher />

                <Link href="/agents/new-listing" className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-600/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
                    {t('postAd')}
                </Link>

                {user?.role === 'admin' && (
                    <Link href="/admin/users" className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
                        Admin
                    </Link>
                )}

                {user ? (
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">
                            {t('dashboard')}
                        </Link>
                        <span className="text-sm font-medium hidden md:block">{user.name}</span>
                        <button onClick={() => logout()} className="text-sm font-medium text-red-600 hover:text-red-500">
                            {tAuth('logout')}
                        </button>
                    </div>
                ) : (
                    <Link href="/auth/login" className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-600/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
                        {tAuth('signInButton')}
                    </Link>
                )}
            </div>
        </nav>
    );
}
