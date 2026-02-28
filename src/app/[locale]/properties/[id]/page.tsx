import { getListing } from '@/actions/getListing';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ListingDetailView from '@/components/ListingDetailView';
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
        <div className="container mx-auto lg:px-44 lg:py-8 min-h-screen bg-white md:bg-gray-50 dark:bg-gray-950">
            <ListingDetailView
                property={property}
                attributes={attributes}
                formattedPrice={formattedPrice}
                images={images}
                texts={{ description: t('description') || 'Açıklama' }}
            />
        </div>
    );
}

