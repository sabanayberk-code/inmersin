'use server';

import { db } from "@/lib/db";
import { listings, listingTranslations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getListing(id: number, locale: string = 'en') {
    const listing = await db.query.listings.findFirst({
        where: (listings, { eq }) => eq(listings.id, id),
        with: {
            translations: true,
            media: true,
            agent: true
        }
    });

    if (!listing) return null;

    // Find translation for locale, fallback to English or first available
    const translation = listing.translations.find(t => t.language === locale)
        || listing.translations.find(t => t.language === 'en')
        || listing.translations[0];

    return {
        id: listing.id,
        serialCode: listing.serialCode,
        agentId: listing.agentId,
        type: listing.type,
        price: listing.price,
        currency: listing.currency,
        location: listing.location,
        features: listing.features,
        isShowcase: listing.isShowcase,
        status: listing.status,
        viewCount: listing.viewCount,
        title: translation?.title || "Untitled",
        description: translation?.description || "",
        slug: translation?.slug || "",
        images: listing.media.sort((a, b) => (a.order || 0) - (b.order || 0)).map(m => m.url),
        agent: listing.agent,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
    };
}
