import { getListings } from '@/actions/getListings';
import ListingCard from '@/components/ListingCard';
import { getTranslations } from 'next-intl/server';

export default async function PropertiesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('PropertiesPage');
    const listings = await getListings(locale);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
                {t('title') || 'All Properties'}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((property) => (
                    <ListingCard
                        key={property.id}
                        {...property}
                        serialCode={property.serialCode ?? undefined} // Null gelirse Undefined'a zorla
                        locale={locale}
                    />
                ))}
            </div>

            {listings.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p>{t('noProperties') || 'No properties found.'}</p>
                </div>
            )}
        </div>
    );
}
