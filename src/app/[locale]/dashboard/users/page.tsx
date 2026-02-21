import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { approveUser, deleteUser } from "./actions";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    const t = await getTranslations('Users');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t('title')}</h2>

            <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-300 uppercase">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">{t('name')}</th>
                            <th className="px-6 py-3">{t('email')}</th>
                            <th className="px-6 py-3">{t('role')}</th>
                            <th className="px-6 py-3">{t('status')}</th>
                            <th className="px-6 py-3">{t('approved')}</th>
                            <th className="px-6 py-3">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {allUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{user.id}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.name}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 uppercase text-xs font-bold">{user.role}</td>
                                <td className="px-6 py-4">
                                    {user.emailVerified ? (
                                        <span className="text-green-600 dark:text-green-400 font-semibold">{t('verified')}</span>
                                    ) : (
                                        <span className="text-amber-600 dark:text-amber-400">{t('unverified')}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {user.isApproved ? (
                                        <span className="text-green-600 dark:text-green-400 font-semibold">{t('yes')}</span>
                                    ) : (
                                        <span className="text-red-500 dark:text-red-400 font-bold">{t('no')}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    {!user.isApproved && (
                                        <form action={approveUser.bind(null, user.id)}>
                                            <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors">
                                                {t('approve')}
                                            </button>
                                        </form>
                                    )}

                                    {user.role !== 'admin' && (
                                        <form
                                            action={deleteUser.bind(null, user.id)}
                                        // Provide basic warning message in JS (hardcoded to English/Turkish for form submission fallback if CSR isn't handling it)
                                        >
                                            <button
                                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                            >
                                                {t('delete')}
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
