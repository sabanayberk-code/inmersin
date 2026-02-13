import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Move, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ListingTableViewProps {
    listings: any[];
    locale: string;
}

export default function ListingTableView({ listings, locale }: ListingTableViewProps) {
    const tForm = useTranslations('Form');
    const tProp = useTranslations('PropertyDetails');

    // Detect predominant type or if mixed
    const isAllVehicles = listings.length > 0 && listings.every(l => l.type === 'vehicle');
    const isAllRealEstate = listings.length > 0 && listings.every(l => l.type === 'real_estate');

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-4 py-3 min-w-[120px]">
                            {/* Image Placeholder */}
                        </th>
                        <th scope="col" className="px-4 py-3 font-bold text-center">
                            {tForm('title')}
                        </th>

                        {/* Dynamic Headers */}
                        {isAllVehicles ? (
                            <>
                                <th scope="col" className="px-4 py-3 font-bold text-center">{tProp('lbl_year')}</th>
                                <th scope="col" className="px-4 py-3 font-bold text-center">{tProp('lbl_km')}</th>
                            </>
                        ) : isAllRealEstate ? (
                            <>
                                <th scope="col" className="px-4 py-3 font-bold text-center">{tProp('grossArea')}</th>
                                <th scope="col" className="px-4 py-3 font-bold text-center">{tProp('rooms')}</th>
                            </>
                        ) : (
                            <>
                                <th scope="col" className="px-4 py-3 font-bold text-center">{tProp('type')}</th>
                                <th scope="col" className="px-4 py-3 font-bold text-center">{tProp('description')}</th>
                            </>
                        )}

                        <th scope="col" className="px-4 py-3 font-bold text-center">
                            {tForm('price')}
                        </th>
                        <th scope="col" className="px-4 py-3 font-bold text-center">
                            {tProp('listingDate')}
                        </th>
                        <th scope="col" className="px-4 py-3 font-bold text-center">
                            {tForm('sec_location')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {listings.map((listing) => (
                        <tr key={listing.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="p-2">
                                <div className="relative h-20 w-32 overflow-hidden rounded">
                                    <Image
                                        src={listing.imageUrl}
                                        alt={listing.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </td>
                            <td className="px-4 py-4 font-medium text-blue-600 dark:text-blue-400">
                                <Link href={`/properties/${listing.id}`} className="hover:underline flex flex-col gap-1">
                                    <span className="line-clamp-2 text-base">{listing.title}</span>
                                    {listing.isPremium && (
                                        <Badge variant="secondary" className="w-fit text-[10px] bg-gray-200 text-gray-700">Premium Ofis</Badge>
                                    )}
                                </Link>
                            </td>

                            {/* Dynamic Cells */}
                            {isAllVehicles ? (
                                <>
                                    <td className="px-4 py-4 text-center text-gray-900 dark:text-white font-medium">
                                        {listing.features.year || '-'}
                                    </td>
                                    <td className="px-4 py-4 text-center text-gray-900 dark:text-white font-medium">
                                        {listing.features.km ? `${listing.features.km.toLocaleString()} km` : '-'}
                                    </td>
                                </>
                            ) : isAllRealEstate ? (
                                <>
                                    <td className="px-4 py-4 text-center text-gray-900 dark:text-white font-medium">
                                        {listing.features.area}
                                    </td>
                                    <td className="px-4 py-4 text-center text-gray-900 dark:text-white font-medium">
                                        {listing.features.bedrooms}
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-4 py-4 text-center text-gray-900 dark:text-white font-medium">
                                        {listing.features.category || listing.type}
                                    </td>
                                    <td className="px-4 py-4 text-center text-gray-900 dark:text-white font-medium text-xs">
                                        <span className="line-clamp-1">{listing.description}</span>
                                    </td>
                                </>
                            )}

                            <td className="px-4 py-4 text-center font-bold text-red-600 dark:text-red-400 text-base">
                                {formatPrice(listing.price, listing.currency)}
                            </td>
                            <td className="px-4 py-4 text-center text-gray-900 dark:text-white">
                                {formatDate(listing.createdAt)}
                            </td>
                            <td className="px-4 py-4 text-center text-gray-900 dark:text-white">
                                <div className="flex flex-col items-center">
                                    <span>{listing.location.city}</span>
                                    <span>{listing.location.district}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

