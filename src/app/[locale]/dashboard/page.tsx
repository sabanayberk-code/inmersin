import { ListingAgent } from '@/agents/ListingAgent';
import { getCurrentUser } from '@/lib/auth'; // Assuming this exists from previous context
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { deleteListingAction } from '@/actions/userActions';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Dashboard');
    const user = await getCurrentUser();

    if (!user) {
        redirect({ href: '/auth/login', locale });
    }

    const agent = new ListingAgent();
    // Assuming agent.getListingsByAgent returns listings with { id, title, image, price, currency, viewCount, status }
    const listings = await agent.getListingsByAgent(user!.id);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">{t('myListings')}</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-4">{t('image')}</th>
                            <th className="p-4">{t('title')}</th>
                            <th className="p-4 hidden md:table-cell">{t('location')}</th>
                            <th className="p-4">{t('price')}</th>
                            <th className="p-4 hidden md:table-cell">{t('listingDate')}</th>
                            <th className="p-4">{t('status')} / {t('daysLeft')}</th>
                            <th className="p-4">{t('views')}</th>
                            <th className="p-4 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {listings.map((listing) => (
                            <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-4">
                                    <div className="w-16 h-12 relative rounded overflow-hidden bg-gray-200">
                                        {listing.image ? (
                                            <Image
                                                src={listing.image}
                                                alt={listing.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Img</div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                                    {listing.title}
                                </td>
                                <td className="p-4 hidden md:table-cell text-sm text-gray-500">
                                    {listing.location ? (
                                        `${listing.location.city || ''} / ${listing.location.district || ''}`
                                    ) : '-'}
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">
                                    {new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
                                        style: 'currency',
                                        currency: listing.currency || 'USD',
                                        maximumFractionDigits: 0
                                    }).format(listing.price)}
                                </td>
                                <td className="p-4 hidden md:table-cell text-sm text-gray-500">
                                    {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString(locale) : '-'}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-1 rounded text-xs font-bold inline-block w-fit ${listing.status === 'published' ? 'bg-green-100 text-green-700' :
                                            listing.status === 'archived' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {listing.status === 'published' ? t('status_active') :
                                                listing.status === 'archived' ? t('status_passive') :
                                                    t('status_draft')}
                                        </span>
                                        {listing.status === 'published' && listing.createdAt && (
                                            <span className="text-xs text-gray-500">
                                                {Math.max(0, 90 - Math.ceil((new Date().getTime() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} {t('daysLeft')}
                                            </span>
                                        )}
                                        {listing.status === 'archived' && (
                                            <span className="text-xs text-red-500 font-medium">Expired</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {listing.viewCount}
                                    </div>
                                </td>
                                <td className="p-4 text-right space-x-2 flex justify-end items-center">
                                    {listing.status === 'archived' && (
                                        <form action={async (formData) => {
                                            'use server';
                                            const { republishListingAction } = await import('@/actions/userActions');
                                            await republishListingAction(formData);
                                        }}>
                                            <input type="hidden" name="id" value={listing.id} />
                                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 mr-2">
                                                {t('republish')}
                                            </Button>
                                        </form>
                                    )}

                                    <Link href={`/agents/edit-listing/${listing.id}`}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <form action={deleteListingAction}>
                                        <input type="hidden" name="id" value={listing.id} />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {listings.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    {t('noListings')}
                                    <Link href="/agents/new-listing" className="text-blue-600 hover:underline ml-1">
                                        {t('createOne')}
                                    </Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
