import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Move, Waves, Trees, Car, Armchair } from 'lucide-react';
import { Link } from '@/i18n/routing';

import { useTranslations } from 'next-intl';

interface ListingCardProps {
    id: number;
    title: string;
    description: string;
    price: number;
    currency: string;
    location: any;
    features: any;
    imageUrl: string;
    locale: string;
}

export default function ListingCard({
    id, title, price, currency, location, features, imageUrl, locale, ...props
}: ListingCardProps & { serialCode?: string, type?: string, viewCount?: number | null }) {
    const t = useTranslations('PropertyDetails');

    // Simple currency formatter
    const formattedPrice = new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(price);

    const code = props.serialCode || `#${id}`;

    // Helper text for mobile badge
    let badgeText = '';
    if (props.type === 'real_estate') badgeText = t('emlak');
    else if (props.type === 'vehicle') badgeText = t('vasıta');
    else if (props.type === 'part') badgeText = t('yedek parça');

    return (
        <Link href={`/properties/${id}`} className="block group">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-row sm:flex-col rounded-none sm:rounded-xl border-b border-x-0 border-t-0 sm:border border-gray-200 dark:border-gray-800 bg-transparent sm:bg-card">

                <div className="relative w-[130px] sm:w-full sm:h-48 shrink-0 group">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Desktop Price Badge */}
                    <Badge className="hidden sm:inline-flex absolute top-2 right-2 bg-black/70 hover:bg-black/80">
                        {formattedPrice}
                    </Badge>
                    {/* Desktop NO Badge */}
                    <Badge className="hidden sm:inline-flex absolute top-2 left-2 bg-blue-600/90 text-white hover:bg-blue-700/90 mix-blend-hard-light backdrop-blur-md shadow-md border border-white/20 text-xs">
                        {code}
                    </Badge>
                </div>

                <CardContent className="p-2 pl-3 sm:p-4 flex flex-col flex-grow justify-between border-gray-200 dark:border-gray-800">
                    <div>
                        <h3 className="font-semibold sm:font-bold text-[13px] sm:text-lg mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-1 group-hover:text-blue-600 transition-colors uppercase sm:normal-case leading-snug">
                            {title}
                        </h3>

                        {/* Mobile Specific Badge to simulate Premium Galeri style */}
                        {badgeText && (
                            <div className="flex sm:hidden mb-1.5">
                                <span className="text-[9px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-medium">
                                    {badgeText}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center text-gray-500 text-[11px] sm:text-sm mb-2 sm:mb-4">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 shrink-0" />
                            <span className="line-clamp-1">
                                {location.neighborhood ? `${location.neighborhood}, ` : ''}
                                {location.district}/{location.city}
                            </span>
                        </div>
                    </div>

                    <div className="hidden sm:flex flex-wrap gap-1 mb-2">
                        {features.hasPool && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 gap-1 pl-1">
                                <Waves className="w-3 h-3" /> {t('pool')}
                            </Badge>
                        )}
                        {features.hasGarden && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-200 gap-1 pl-1">
                                <Trees className="w-3 h-3" /> {t('garden')}
                            </Badge>
                        )}
                        {features.hasGarage && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 gap-1 pl-1">
                                <Car className="w-3 h-3" /> {t('garage')}
                            </Badge>
                        )}
                    </div>

                    <div className="flex justify-between items-end mt-auto pt-1 sm:pt-3 sm:border-t gap-2 w-full">
                        <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex-wrap flex-1">
                            {props.type === 'real_estate' || !props.type ? (
                                <>
                                    <div className="flex items-center gap-1" title={t('rooms')}>
                                        <Bed className="hidden sm:block w-3.5 h-3.5" />
                                        <span>{features.bedrooms || '-'}</span>
                                    </div>
                                    <span className="sm:hidden font-bold opacity-50">•</span>
                                    <div className="flex items-center gap-1" title={t('bathrooms')}>
                                        <Bath className="hidden sm:block w-3.5 h-3.5 text-gray-400" />
                                        <span>{features.bathrooms || '-'}</span>
                                    </div>
                                    {features.wc > 0 && (
                                        <>
                                            <span className="hidden sm:inline font-bold opacity-50">•</span>
                                            <div className="hidden sm:flex items-center gap-1" title="WC">
                                                <Armchair className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{features.wc}</span>
                                            </div>
                                        </>
                                    )}
                                    <span className="sm:hidden font-bold opacity-50">•</span>
                                    <div className="flex items-center gap-1" title={t('grossArea')}>
                                        <Move className="hidden sm:block w-3.5 h-3.5 text-gray-400" />
                                        <span>{features.area || '-'}m²</span>
                                    </div>
                                </>
                            ) : props.type === 'vehicle' ? (
                                <>
                                    <span className="font-semibold sm:font-medium text-gray-700 dark:text-gray-300">{features.year || '-'}</span>
                                    <span className="opacity-50">•</span>
                                    <span>{features.km ? features.km.toLocaleString() + ' km' : '-'}</span>
                                    <span className="hidden sm:inline opacity-50">•</span>
                                    <span className="truncate hidden sm:inline">{features.gear || '-'}</span>
                                </>
                            ) : (
                                <span>{features.category || '-'}</span>
                            )}
                        </div>

                        {/* Mobile Price */}
                        <div className="sm:hidden font-bold text-[#2d62a3] dark:text-blue-500 text-[14px] whitespace-nowrap">
                            {formattedPrice}
                        </div>

                        {/* Desktop View Count */}
                        <div className="hidden sm:flex items-center gap-1 text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full text-[10px] shrink-0 border border-gray-100 dark:border-gray-800 dark:bg-gray-800" title="Görüntülenme">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                            <span className="font-medium">{props.viewCount || 0}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
