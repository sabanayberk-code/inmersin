
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { LayoutDashboard, User } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations('Navigation');

    const user = await getCurrentUser();

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 min-h-screen">
            <Sidebar user={user} />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
