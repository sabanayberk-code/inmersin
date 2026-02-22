import { getListing } from '@/actions/getListing';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PropertyGallery from '@/components/PropertyGallery';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShieldCheck, Phone, MessageSquare } from 'lucide-react';
import { ListingAgent } from '@/agents/ListingAgent';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }): Promise<Metadata> {
    const { locale, id } = await params;
    const propertyId = parseInt(id);
    if (isNaN(propertyId)) return {};

    const property = await getListing(propertyId, locale);
    if (!property) return {};

    const title = `${property.title} | Inmersin`;
    const description = property.description.slice(0, 160) + (property.description.length > 160 ? '...' : '');
    const imageUrl = property.images && property.images.length > 0 ? property.images[0] : undefined;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            images: imageUrl ? [{ url: imageUrl }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: imageUrl ? [imageUrl] : [],
        }
    };
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
    const { locale, id } = await params;
    const propertyId = parseInt(id);

    if (isNaN(propertyId)) return notFound();

    const t = await getTranslations('PropertyDetails');
    const property = await getListing(propertyId, locale);

    if (!property) return notFound();

    // Increment View Count
    const agent = new ListingAgent();
    await agent.incrementView(propertyId);

    const formattedPrice = new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
        style: 'currency',
        currency: property.currency || 'USD',
        maximumFractionDigits: 0
    }).format(property.price);

    const f = property.features as any;

    // Helper to format date
    const dateStr = property.createdAt ? new Date(property.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    // Attribute Table Data
    // Helper for translating values
    const tv = (key: string | undefined | null, prefix?: string) => {
        if (!key) return '-';
        const safeKey = key.toLowerCase().replace(/ /g, '_');

        // Try prefixed key first (e.g. val_parking_open)
        if (prefix) {
            const prefixedKey = `val_${prefix}_${safeKey}`;
            try {
                const translated = t(prefixedKey as any);
                if (translated !== prefixedKey && !translated.includes('PropertyDetails.')) return translated;
            } catch (e) {
                // Ignore missing translation
            }
        }

        // Fallback to generic key
        const genericKey = `val_${safeKey}`;
        try {
            const translatedGeneric = t(genericKey as any);
            if (translatedGeneric !== genericKey && !translatedGeneric.includes('PropertyDetails.')) {
                return translatedGeneric;
            }
        } catch (e) {
            // Ignore missing translation
        }

        return key;
    };

    // Attribute Table Data
    let attributes: any[] = [];

    if (property.type === 'vehicle') {
        const vehicleFeats = f as any;
        attributes = [
            { label: t('listingNo'), value: property.serialCode || '#' + property.id, highlight: true },
            { label: t('listingDate'), value: dateStr },
            { label: t('lbl_brand'), value: vehicleFeats.propertyType || '-' },
            { label: t('lbl_model'), value: vehicleFeats.model || '-' },
            { label: t('lbl_year'), value: vehicleFeats.year },
            { label: t('lbl_km'), value: vehicleFeats.km?.toLocaleString() },
            { label: t('lbl_fuel'), value: vehicleFeats.fuel || '-' },
            { label: t('lbl_gear'), value: vehicleFeats.gear || '-' },
            { label: t('lbl_color'), value: vehicleFeats.color || '-' },
            { label: t('lbl_case_type'), value: vehicleFeats.caseType || '-' },
            { label: t('lbl_engine_power'), value: vehicleFeats.enginePower ? `${vehicleFeats.enginePower} HP` : '-' },
            { label: t('lbl_engine_displacement'), value: vehicleFeats.engineDisplacement ? `${vehicleFeats.engineDisplacement} cc` : '-' },
            { label: t('lbl_traction'), value: vehicleFeats.drivetrain || '-' },
            { label: t('lbl_warranty'), value: vehicleFeats.warranty ? t('yes') : t('no') },
            { label: t('lbl_swap'), value: vehicleFeats.swap ? t('yes') : t('no') },
            { label: t('fromWhom'), value: tv(vehicleFeats.fromWhom), highlightRed: true },
            { label: t('lbl_damage_status'), value: vehicleFeats.damageStatus || '-' },
        ];
    } else if (property.type === 'part') {
        const partFeats = f as any;
        attributes = [
            { label: t('listingNo'), value: property.serialCode || '#' + property.id, highlight: true },
            { label: t('listingDate'), value: dateStr },
            { label: 'Category', value: partFeats.category || '-' },
            { label: 'Condition', value: partFeats.condition || '-' },
            { label: 'Brand', value: partFeats.brand || '-' },
            { label: 'Compatibility', value: partFeats.compatibility || '-' },
            { label: 'OEM No', value: partFeats.oemNo || '-' },
        ];
    } else {
        // Real Estate (Default)
        attributes = [
            { label: t('listingNo'), value: property.serialCode || '#' + property.id, highlight: true },
            { label: t('listingDate'), value: dateStr },
            { label: t('type'), value: `${(f.type || f.listingType) === 'Rent' ? t('rent') : t('sale')}${f.category ? ' ' + t(f.category.toLowerCase()) : ''}` },
            { label: t('grossArea'), value: f.area },
            { label: t('netArea'), value: f.netArea || '-' },
            { label: t('rooms'), value: f.bedrooms }, // Now displays "2+1"
            { label: t('buildingAge'), value: f.buildingAge || '-' },
            { label: t('floorLocation'), value: f.floorNumber || '-' },
            { label: t('totalFloors'), value: f.totalFloors || '-' },
            { label: t('heating'), value: tv(f.heating) },
            { label: t('bathrooms'), value: f.bathrooms },
            { label: t('kitchen'), value: tv(f.kitchen) }, // Open -> val_open
            { label: t('balcony'), value: f.balcony ? t('yes') : t('no') },
            { label: t('elevator'), value: f.elevator ? t('yes') : t('no') },
            { label: t('parking'), value: tv(f.parking, 'parking') }, // Open -> val_parking_open
            { label: t('furnished'), value: f.furnished ? t('yes') : t('no') },
            { label: t('usageStatus'), value: tv(f.usageStatus) },
            { label: t('inComplex'), value: f.inComplex ? t('yes') : t('no') },
            { label: t('complexName'), value: f.complexName || t('unspecified') },
            { label: t('dues'), value: f.dues ? `${f.dues} TL` : '-' },
            { label: t('deposit'), value: f.deposit ? `${f.deposit} TL` : '-' },
            { label: t('titleStatus'), value: tv(f.titleStatus) },
            { label: t('fromWhom'), value: tv(f.fromWhom), highlightRed: true },
        ];
    }

    // Images fallback
    const images = (property.images && property.images.length > 0)
        ? property.images
        : ["https://placehold.co/800x600?text=No+Image"];

    return (
        <div className="container mx-auto px-4 md:px-24 lg:px-44 py-8 min-h-screen bg-white dark:bg-gray-900">

            {/* Breadcrumb / Title Header */}
            <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 uppercase">
                    {property.title}
                </h2>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full w-max">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                    <span>{property.viewCount || 0} Görüntüleme</span>
                </div>
            </div>

            {/* Grid Container - 3 Columns (5 - 4 - 3) - Gallery medium */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Gallery (5 cols) - Medium size */}
                <div className="lg:col-span-5 space-y-6">
                    <PropertyGallery images={images} title={property.title} />

                    {/* Google Map Placeholder - Kept under gallery */}
                    <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center text-gray-400 mt-4">
                        <MapPin className="w-6 h-6 mr-2" /> Harita Konumu
                    </div>

                    {/* Description */}
                    <div className="prose dark:prose-invert max-w-none border-t pt-6">
                        <h3 className="text-lg font-bold mb-3">{t('description') || 'Açıklama'}</h3>
                        <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                            {property.description}
                        </p>
                    </div>
                </div>

                {/* Center Column: Listing Details (4 cols) - Adjusted */}
                <div className="lg:col-span-4 space-y-2">
                    {/* Price & Location Header */}
                    <div className="border-b pb-2 mb-2">
                        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                            {formattedPrice}
                        </h1>
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer hover:underline">
                            {(property.location as any).city} / {(property.location as any).district} / {(property.location as any).neighborhood}
                        </div>
                    </div>

                    {/* Attribute Table (Dense) */}
                    <div className="text-sm">
                        {attributes.map((attr, idx) => (
                            <div key={idx} className="flex items-center py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <span className="font-bold text-gray-800 dark:text-gray-200 text-xs w-[180px] flex-shrink-0">{attr.label}</span>
                                <span className={`text-xs ${attr.highlightRed ? 'text-red-600 font-bold' : attr.highlight ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-gray-400 font-normal'}`}>
                                    {attr.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Agent (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="sticky top-4 space-y-4">
                        {/* Agent Card */}
                        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
                            <div className="text-center mb-3 border-b pb-2">
                                <h4 className="font-bold text-blue-800 dark:text-blue-400 text-xs">{property.agent?.companyName || 'inmersin ajans'}</h4>
                            </div>

                            <div className="flex flex-col items-center mb-3">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 mb-2 overflow-hidden">
                                    <span>{property.agent?.name?.charAt(0) || 'A'}</span>
                                </div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 text-center">{property.agent?.name || 'Mert Kuruçeşme'}</h3>
                                <a href="#" className="text-xs text-blue-500 hover:underline mt-1">Tüm ilanları</a>
                                <a href="#" className="text-xs text-blue-500 hover:underline">Favori Satıcılarıma ekle</a>
                            </div>

                            <div className="space-y-2 text-sm mb-3">
                                <div className="flex justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                    <span className="text-gray-500 text-xs">İş</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">{property.agent?.phone || '0 (216) 208 92 15'}</span>
                                </div>
                                <div className="flex justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                    <span className="text-gray-500 text-xs">Cep</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">{property.agent?.phone || '0 (545) 581 37 54'}</span>
                                </div>
                            </div>

                            <button className="w-full text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center justify-center gap-2 py-2 border rounded hover:bg-blue-50 transition">
                                <MessageSquare className="w-4 h-4" /> Mesaj gönder
                            </button>
                        </div>
                        {/* Safety Tips */}
                        <div className="items-start gap-2 pt-2 text-gray-500 dark:text-gray-400 text-[10px] hidden lg:flex">
                            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>Kiralayacağınız gayrimenkulü görmeden kapora göndermeyin.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

