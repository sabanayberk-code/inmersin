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
    const whereConditions = [eq(listings.status, 'draft')]; // Should be 'published' in prod, keeping 'draft' for dev

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

        // Category Filter (Konut, Arsa, etc.)
        if (filters?.category && features.category && features.category !== filters.category) {
            return false;
        }

        // Property Type Filter (Daire, Villa)
        if (filters?.propertyType && features.propertyType !== filters.propertyType) {
            return false;
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
    konut: { total: number; sale: number; rent: number; types: Record<string, number> };
    workplace: { total: number; sale: number; rent: number; types: Record<string, number> };
    land: { total: number; sale: number; rent: number; types: Record<string, number> };
    vasita: {
        total: number;
        sale: number;
        rent: number;
        automobile: { total: number; brands: Record<string, { total: number; sale: number; rent: number }> };
        suv: { total: number; brands: Record<string, { total: number; sale: number; rent: number }> };
        motorcycle: { total: number; brands: Record<string, { total: number; sale: number; rent: number }> };
        electric: number;
        minivan: number;
        commercial: number;
        damaged: number;
    };
    part: { total: number; sale: number };
}

export async function getListingCounts(): Promise<CategoryCounts> {
    const all = await db.select({ type: listings.type, features: listings.features }).from(listings);

    const counts: CategoryCounts = {
        konut: { total: 0, sale: 0, rent: 0, types: {} },
        workplace: { total: 0, sale: 0, rent: 0, types: {} },
        land: { total: 0, sale: 0, rent: 0, types: {} },
        vasita: {
            total: 0,
            sale: 0,
            rent: 0,
            automobile: { total: 0, brands: {} },
            suv: { total: 0, brands: {} },
            motorcycle: { total: 0, brands: {} },
            electric: 0,
            minivan: 0,
            commercial: 0,
            damaged: 0
        },
        part: { total: 0, sale: 0 }
    };

    all.forEach(item => {
        const feat = item.features as any;
        // Check Real Estate vs Vehicle vs Part
        if (item.type === 'real_estate') {
            const cat = feat.category; // 'Konut', 'İş Yeri', 'Arsa'
            const pType = feat.propertyType;

            if (cat === 'Konut' || !cat && feat.bedrooms) { // Default or Konut
                counts.konut.total++;
                if (feat.type === 'Sale') counts.konut.sale++;
                if (feat.type === 'Rent') counts.konut.rent++;
                if (pType) counts.konut.types[pType] = (counts.konut.types[pType] || 0) + 1;
            } else if (cat === 'İş Yeri') {
                counts.workplace.total++;
                if (feat.type === 'Sale') counts.workplace.sale++;
                if (feat.type === 'Rent') counts.workplace.rent++;
                if (pType) counts.workplace.types[pType] = (counts.workplace.types[pType] || 0) + 1;
            } else if (cat === 'Arsa') {
                counts.land.total++;
                if (feat.type === 'Sale') counts.land.sale++;
                if (feat.type === 'Rent') counts.land.rent++;
                if (pType) counts.land.types[pType] = (counts.land.types[pType] || 0) + 1;
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
                if (pType) {
                    initBrand(counts.vasita.automobile.brands, pType);
                    counts.vasita.automobile.brands[pType].total++;
                    if (isSale) counts.vasita.automobile.brands[pType].sale++;
                    if (isRent) counts.vasita.automobile.brands[pType].rent++;
                }
            }
            else if (cat === 'Arazi, SUV & Pickup') {
                counts.vasita.suv.total++;
                if (pType) {
                    initBrand(counts.vasita.suv.brands, pType);
                    counts.vasita.suv.brands[pType].total++;
                    if (isSale) counts.vasita.suv.brands[pType].sale++;
                    if (isRent) counts.vasita.suv.brands[pType].rent++;
                }
            }
            else if (cat === 'Motosiklet') {
                counts.vasita.motorcycle.total++;
                if (pType) {
                    initBrand(counts.vasita.motorcycle.brands, pType);
                    counts.vasita.motorcycle.brands[pType].total++;
                    if (isSale) counts.vasita.motorcycle.brands[pType].sale++;
                    if (isRent) counts.vasita.motorcycle.brands[pType].rent++;
                }
            }
            else if (cat === 'Elektrikli Araçlar') counts.vasita.electric++;
            else if (cat === 'Minivan & Panelvan') counts.vasita.minivan++;
            else if (cat === 'Ticari Araçlar') counts.vasita.commercial++;
            else if (cat === 'Hasarlı Araçlar') counts.vasita.damaged++;

        } else if (item.type === 'part') {
            counts.part.total++;
            if (feat.listingType === 'Sale') counts.part.sale++;
        }
    });

    return counts;
}

