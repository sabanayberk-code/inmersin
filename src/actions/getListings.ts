'use server';

import { db } from "@/lib/db";
import { listings, listingTranslations, media } from "@/db/schema";
import { eq, desc, asc, gte, lte, and } from "drizzle-orm";

export interface ListingFilters {
    type?: 'real_estate' | 'vehicle' | 'part';
    isShowcase?: boolean;
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    city?: string;
    district?: string;
    bedrooms?: string[]; // For real estate
    listingType?: string; // 'Sale' | 'Rent'
    category?: string; // e.g. 'Konut', 'Arsa', 'İş Yeri'
    propertyType?: string; // e.g. 'Daire', 'Villa'
    sort?: string; // 'price_asc' | 'price_desc' | 'date_desc'

    // Vehicle specific
    minYear?: number;
    maxYear?: number;
    minKm?: number;
    maxKm?: number;

    // Part specific
    brand?: string;
    condition?: 'New' | 'Used' | string[];
}

export async function getListings(locale: string = 'en', filters?: ListingFilters) {
    const targetLocale = locale as "en" | "tr" | "ru" | "zh" | "ar";

    // Build Where Conditions
    const whereConditions = [eq(listings.status, 'published')];

    if (filters?.type) {
        whereConditions.push(eq(listings.type, filters.type));
    }

    if (filters?.isShowcase !== undefined) {
        whereConditions.push(eq(listings.isShowcase, filters.isShowcase));
    }

    if (filters?.minPrice) {
        whereConditions.push(gte(listings.price, filters.minPrice));
    }
    if (filters?.maxPrice) {
        whereConditions.push(lte(listings.price, filters.maxPrice));
    }
    if (filters?.currency) {
        whereConditions.push(eq(listings.currency, filters.currency));
    }

    // Determine Sort Order
    let orderByCondition = [desc(listings.createdAt)];
    if (filters?.sort === 'price_asc') {
        orderByCondition = [asc(listings.price)];
    } else if (filters?.sort === 'price_desc') {
        orderByCondition = [desc(listings.price)];
    }

    // Fetch listings
    const data = await db.query.listings.findMany({
        where: and(...whereConditions),
        orderBy: orderByCondition,
        with: {
            translations: true,
            media: true,
            agent: true
        }
    });

    // In-memory filtering for JSON features
    const filtered = data.filter(item => {
        const features = item.features as any;
        const location = item.location as any;

        // Common Location Filter
        if (filters?.city && filters.city !== 'İl' && location.city !== filters.city) {
            return false;
        }

        // Listing Type (Sale vs Rent)
        if (filters?.listingType) {
            const queryType = filters.listingType;
            // Handle features.type (Real Estate) vs features.listingType (Vehicle)
            const itemType = features.type || features.listingType || "Sale";

            // Normalize
            const isSale = (queryType === 'Satılık' || queryType === 'Sale') && itemType === 'Sale';
            const isRent = (queryType === 'Kiralık' || queryType === 'Rent') && itemType === 'Rent';

            if (!isSale && !isRent && queryType !== itemType) return false;
        }

        // Analyze actual Category (handle legacy DB records without 'category' or wrong parent category)
        let actualCategory = features.category;
        if (actualCategory === 'Emlak') actualCategory = 'Konut'; // Patch for forms that saved parent category
        if (!actualCategory && item.type === 'real_estate' && ('bedrooms' in features)) actualCategory = 'Konut';

        // Category Filter (Konut, Arsa, etc.)
        if (filters?.category) {
            if (actualCategory !== filters.category) {
                return false;
            }
        }

        // Subcategory / Property Type Filter (Daire, Villa, vs)
        if (filters?.propertyType) {
            if (features.propertyType !== filters.propertyType) {
                return false;
            }
        }

        // Real Estate Specific
        if (filters?.bedrooms && filters.bedrooms.length > 0) {
            const match = filters.bedrooms.some(opt => {
                // Extract "N+M" pattern (e.g. "2+1", "1.5+1", "1+0")
                const optMatch = opt.match(/(\d+(\.\d+)?\+\d+)/);
                const targetValue = optMatch ? optMatch[0] : opt;

                const dbValue = String(features.bedrooms);

                // If dbValue is also a pattern like "3+1", we compare directly
                // If dbValue is just number "3", we might want to check if it starts with "3"? 
                // But for now, assuming DB matches the standard N+M format for these options.
                return dbValue === targetValue;
            });
            if (!match) return false;
        }

        // Vehicle Specific
        if (filters?.minYear && features.year < filters.minYear) return false;
        if (filters?.maxYear && features.year > filters.maxYear) return false;
        if (filters?.minKm && features.km < filters.minKm) return false;
        if (filters?.maxKm && features.km > filters.maxKm) return false;

        // Part Specific
        if (filters?.brand && features.brand && !features.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
        if (filters?.condition) {
            // If condition is an array (from UI usually)
            if (Array.isArray(filters.condition)) {
                if (filters.condition.length > 0 && !filters.condition.includes(features.condition)) return false;
            }
            // If condition is string
            else if (features.condition !== filters.condition) return false;
        }

        return true;
    });

    return filtered.map((p) => {
        const trans = p.translations.find(t => t.language === targetLocale)
            || p.translations.find(t => t.language === 'en')
            || p.translations[0];

        return {
            id: p.id,
            serialCode: p.serialCode,
            type: p.type,
            price: p.price,
            currency: p.currency || "USD",
            location: p.location as any,
            features: p.features as any,
            title: trans?.title || "Untitled",
            description: trans?.description || "No description.",
            slug: trans?.slug || "",
            imageUrl: p.media[0]?.url || "https://placehold.co/600x400?text=No+Image",
            imageCount: p.media.length,
            isShowcase: p.isShowcase,
            createdAt: p.createdAt
        };
    });
}

export interface CategoryCounts {
    konut: { total: number; sale: number; rent: number; types: Record<string, { total: number; sale: number; rent: number }> };
    workplace: { total: number; sale: number; rent: number; types: Record<string, { total: number; sale: number; rent: number }> };
    land: { total: number; sale: number; rent: number; types: Record<string, { total: number; sale: number; rent: number }> };
    vasita: {
        total: number;
        sale: number;
        rent: number;
        automobile: { total: number; sale: number; rent: number; brands: Record<string, { total: number; sale: number; rent: number }> };
        suv: { total: number; sale: number; rent: number; brands: Record<string, { total: number; sale: number; rent: number }> };
        motorcycle: { total: number; sale: number; rent: number; brands: Record<string, { total: number; sale: number; rent: number }> };
        electric: { total: number; sale: number; rent: number };
        minivan: { total: number; sale: number; rent: number };
        commercial: { total: number; sale: number; rent: number };
        damaged: { total: number; sale: number; rent: number };
    };
    part: { total: number; sale: number; subcategories: Record<string, number> };
}

export async function getListingCounts(): Promise<CategoryCounts> {
    const all = await db.select({ type: listings.type, features: listings.features })
        .from(listings)
        .where(eq(listings.status, 'published'));

    const counts: CategoryCounts = {
        konut: { total: 0, sale: 0, rent: 0, types: {} },
        workplace: { total: 0, sale: 0, rent: 0, types: {} },
        land: { total: 0, sale: 0, rent: 0, types: {} },
        vasita: {
            total: 0,
            sale: 0,
            rent: 0,
            automobile: { total: 0, sale: 0, rent: 0, brands: {} },
            suv: { total: 0, sale: 0, rent: 0, brands: {} },
            motorcycle: { total: 0, sale: 0, rent: 0, brands: {} },
            electric: { total: 0, sale: 0, rent: 0 },
            minivan: { total: 0, sale: 0, rent: 0 },
            commercial: { total: 0, sale: 0, rent: 0 },
            damaged: { total: 0, sale: 0, rent: 0 }
        },
        part: { total: 0, sale: 0, subcategories: {} }
    };

    all.forEach(item => {
        const feat = item.features as any;

        // Helper to init propertyType/brand object if missing
        const initTypeCount = (obj: any, type: string) => {
            if (!obj[type]) obj[type] = { total: 0, sale: 0, rent: 0 };
        };

        // Check Real Estate vs Vehicle vs Part
        if (item.type === 'real_estate') {
            let cat = feat.category;
            if (cat === 'Emlak') cat = 'Konut'; // Patch backwards compatibility
            if (!cat && ('bedrooms' in feat)) cat = 'Konut';

            const pType = feat.propertyType;
            const isSale = feat.type === 'Sale' || feat.listingType === 'Sale';
            const isRent = feat.type === 'Rent' || feat.listingType === 'Rent';

            if (cat === 'Konut') { // Default or Konut
                counts.konut.total++;
                if (isSale) counts.konut.sale++;
                if (isRent) counts.konut.rent++;
                if (pType) {
                    initTypeCount(counts.konut.types, pType);
                    counts.konut.types[pType].total++;
                    if (isSale) counts.konut.types[pType].sale++;
                    if (isRent) counts.konut.types[pType].rent++;
                }
            } else if (cat === 'İş Yeri') {
                counts.workplace.total++;
                if (isSale) counts.workplace.sale++;
                if (isRent) counts.workplace.rent++;
                if (pType) {
                    initTypeCount(counts.workplace.types, pType);
                    counts.workplace.types[pType].total++;
                    if (isSale) counts.workplace.types[pType].sale++;
                    if (isRent) counts.workplace.types[pType].rent++;
                }
            } else if (cat === 'Arsa') {
                counts.land.total++;
                if (isSale) counts.land.sale++;
                if (isRent) counts.land.rent++;
                if (pType) {
                    initTypeCount(counts.land.types, pType);
                    counts.land.types[pType].total++;
                    if (isSale) counts.land.types[pType].sale++;
                    if (isRent) counts.land.types[pType].rent++;
                }
            }
        } else if (item.type === 'vehicle') {
            counts.vasita.total++;
            const isSale = feat.listingType === 'Sale';
            const isRent = feat.listingType === 'Rent';

            if (isSale) counts.vasita.sale++;
            if (isRent) counts.vasita.rent++;

            // Sub-category counting
            const cat = feat.category;
            const pType = feat.propertyType; // Brands for vehicles

            // Helper to init brand if empty
            const initBrand = (obj: any, brand: string) => {
                if (!obj[brand]) obj[brand] = { total: 0, sale: 0, rent: 0 };
            };

            if (cat === 'Otomobil') {
                counts.vasita.automobile.total++;
                if (isSale) counts.vasita.automobile.sale++;
                if (isRent) counts.vasita.automobile.rent++;
                if (pType) {
                    initBrand(counts.vasita.automobile.brands, pType);
                    counts.vasita.automobile.brands[pType].total++;
                    if (isSale) counts.vasita.automobile.brands[pType].sale++;
                    if (isRent) counts.vasita.automobile.brands[pType].rent++;
                }
            }
            else if (cat === 'Arazi, SUV & Pickup') {
                counts.vasita.suv.total++;
                if (isSale) counts.vasita.suv.sale++;
                if (isRent) counts.vasita.suv.rent++;
                if (pType) {
                    initBrand(counts.vasita.suv.brands, pType);
                    counts.vasita.suv.brands[pType].total++;
                    if (isSale) counts.vasita.suv.brands[pType].sale++;
                    if (isRent) counts.vasita.suv.brands[pType].rent++;
                }
            }
            else if (cat === 'Motosiklet') {
                counts.vasita.motorcycle.total++;
                if (isSale) counts.vasita.motorcycle.sale++;
                if (isRent) counts.vasita.motorcycle.rent++;
                if (pType) {
                    initBrand(counts.vasita.motorcycle.brands, pType);
                    counts.vasita.motorcycle.brands[pType].total++;
                    if (isSale) counts.vasita.motorcycle.brands[pType].sale++;
                    if (isRent) counts.vasita.motorcycle.brands[pType].rent++;
                }
            }
            else if (cat === 'Elektrikli Araçlar') {
                counts.vasita.electric.total++;
                if (isSale) counts.vasita.electric.sale++;
                if (isRent) counts.vasita.electric.rent++;
            }
            else if (cat === 'Minivan & Panelvan') {
                counts.vasita.minivan.total++;
                if (isSale) counts.vasita.minivan.sale++;
                if (isRent) counts.vasita.minivan.rent++;
            }
            else if (cat === 'Ticari Araçlar') {
                counts.vasita.commercial.total++;
                if (isSale) counts.vasita.commercial.sale++;
                if (isRent) counts.vasita.commercial.rent++;
            }
            else if (cat === 'Hasarlı Araçlar') {
                counts.vasita.damaged.total++;
                if (isSale) counts.vasita.damaged.sale++;
                if (isRent) counts.vasita.damaged.rent++;
            }

        } else if (item.type === 'part') {
            counts.part.total++;
            if (feat.listingType === 'Sale') counts.part.sale++;

            // Sub-category counting for parts
            // feat.category stores the subcategory for parts (e.g. 'Otomotiv Ekipmanları')
            const cat = feat.category;
            if (cat) {
                counts.part.subcategories[cat] = (counts.part.subcategories[cat] || 0) + 1;
            }
        }
    });

    console.log("Calculated Counts:", JSON.stringify(counts, null, 2));
    return counts;
}

