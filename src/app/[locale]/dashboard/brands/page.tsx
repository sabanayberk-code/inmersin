import { getPendingBrandRequests } from "@/actions/brandRequests";
import { approveBrandAction, rejectBrandAction } from "./actions";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
    const { data: pendingRequests } = await getPendingBrandRequests();
    // Using translation keys from general or fallback to hardcoded if not present.
    // For now we assume a basic admin view with TR support built in.

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Bekleyen Marka Talepleri</h2>
            <p className="text-sm text-gray-500">Kullanıcıların kategori listesinde bulamayıp eklenmesini talep ettiği markalar onaylandıktan sonra herkes için görünür olacaktır.</p>

            <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-300 uppercase">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Kategori</th>
                            <th className="px-6 py-3">Marka Adı</th>
                            <th className="px-6 py-3">Tarih</th>
                            <th className="px-6 py-3">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingRequests?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Mevcut bekleyen marka talebi bulunmamaktadır.
                                </td>
                            </tr>
                        )}
                        {pendingRequests?.map((request) => (
                            <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{request.id}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold">{request.parentCategory}</td>
                                <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-bold">{request.name}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString('tr-TR') : '-'}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <form action={approveBrandAction.bind(null, request.id)}>
                                        <button className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-semibold shadow hover:bg-green-700 hover:shadow-md transition-all">
                                            Onayla
                                        </button>
                                    </form>

                                    <form action={rejectBrandAction.bind(null, request.id)}>
                                        <button className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-semibold shadow hover:bg-red-700 hover:shadow-md transition-all">
                                            Reddet
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
