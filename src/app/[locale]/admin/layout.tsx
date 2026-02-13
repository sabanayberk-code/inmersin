
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const user = await getCurrentUser();
    const t = await getTranslations('Navigation');

    if (!user) {
        redirect(`/${locale}/auth/login`);
    }

    if (user.role !== 'admin') {
        redirect(`/${locale}/dashboard`);
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-slate-900 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <nav className="space-x-4">
                        <a href={`/${locale}/admin/users`} className="hover:text-blue-300">Users</a>
                        <a href={`/${locale}`} className="hover:text-blue-300">Back to Site</a>
                    </nav>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 py-8">
                {children}
            </main>
        </div>
    );
}
