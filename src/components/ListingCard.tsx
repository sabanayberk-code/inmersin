import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    return (
        <Link href={`/properties/${id}`} className="block group">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="relative h-48 w-full overflow-hidden rounded-t-xl group">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <Badge className="absolute top-2 right-2 bg-black/70 hover:bg-black/80">
                        {formattedPrice}
                    </Badge>
                    <Badge className="absolute top-2 left-2 bg-blue-600/90 text-white hover:bg-blue-700/90 mix-blend-hard-light backdrop-blur-md shadow-md border border-white/20">
                        NO: {code}
                    </Badge>
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>

                    <div className="flex items-center text-gray-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="line-clamp-1">
                            {location.neighborhood ? `${location.neighborhood}, ` : ''}
                            {location.district}/{location.city}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
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

                    <div className="flex justify-between items-end mt-auto pt-3 border-t gap-2">
                        <div className="flex items-center gap-2.5 text-xs text-gray-600 flex-wrap flex-1">
                            {props.type === 'real_estate' || !props.type ? (
                                <>
                                    <div className="flex items-center gap-1" title={t('rooms')}>
                                        <Bed className="w-3.5 h-3.5" />
                                        <span>{features.bedrooms || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-1" title={t('bathrooms')}>
                                        <Bath className="w-3.5 h-3.5" />
                                        <span>{features.bathrooms || '-'}</span>
                                    </div>
                                    {features.wc > 0 && (
                                        <div className="flex items-center gap-1" title="WC">
                                            <Armchair className="w-3.5 h-3.5" />
                                            <span>{features.wc}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1" title={t('grossArea')}>
                                        <Move className="w-3.5 h-3.5" />
                                        <span>{features.area || '-'}m²</span>
                                    </div>
                                </>
                            ) : props.type === 'vehicle' ? (
                                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                                    <span className="font-medium text-gray-700">{features.year || '-'}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>{features.km ? features.km.toLocaleString() + ' km' : '-'}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="truncate max-w-[50px] sm:max-w-none">{features.gear || '-'}</span>
                                </div>
                            ) : (
                                <div className="text-xs">
                                    <span>{features.category || '-'}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full text-[10px] shrink-0 border border-gray-100 dark:border-gray-800 dark:bg-gray-800" title="Görüntülenme">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                            <span className="font-medium">{props.viewCount || 0}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link >
    );
}
