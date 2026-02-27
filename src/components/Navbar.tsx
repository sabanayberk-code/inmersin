'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { Phone, MessageCircle, Plus, User, LogIn } from 'lucide-react';

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
        <nav className="flex flex-wrap items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50 gap-y-4">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Inmersin
                </Link>
            </div>

            <div className="flex items-center justify-center gap-3 md:gap-6 bg-gray-50/50 dark:bg-gray-800/50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-100 dark:border-gray-800 w-full order-last md:order-none md:w-max">
                <a href="tel:+905327054990" className="flex items-center gap-1.5 text-[13px] md:text-sm font-bold text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                    <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                    <span className="hidden sm:inline">Destek:</span> 0532 705 49 90
                </a>
                <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-600"></div>
                <a href="https://wa.me/905327054990" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] md:text-sm font-bold text-green-600 hover:text-green-500 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                </a>
            </div>

            <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-0">
                <LanguageSwitcher />

                <Link href="/agents/new-listing" className="inline-flex h-9 items-center justify-center rounded-md bg-green-600 px-3 md:px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-600/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
                    <Plus className="w-5 h-5 md:hidden" />
                    <span className="hidden md:inline">{t('postAd')}</span>
                </Link>

                {user ? (
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link href="/dashboard" className="inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-3 md:px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
                            <User className="w-5 h-5 md:hidden" />
                            <span className="hidden md:inline">{t('dashboard') || "Panel"}</span>
                        </Link>
                        <span className="text-sm font-medium hidden md:block">{user.name}</span>
                        <button onClick={() => logout()} className="hidden md:block text-sm font-medium text-red-600 hover:text-red-500">
                            {tAuth('logout')}
                        </button>
                    </div>
                ) : (
                    <Link href="/auth/login" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-3 md:px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-600/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
                        <LogIn className="w-5 h-5 md:hidden" />
                        <span className="hidden md:inline">{tAuth('signInButton')}</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
