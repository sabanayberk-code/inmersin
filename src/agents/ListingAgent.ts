import { db } from "../lib/db";
import { listings, listingTranslations, media, LANGUAGES } from "../db/schema";
import { listingInputSchema, ListingInput } from "../lib/validations/listing";
import { translateText } from "../skills/TranslationSkill";
import sanitizeHtml from "sanitize-html";
import { sql, eq, and, lt } from "drizzle-orm";

export class ListingAgent {

    async createListing(input: ListingInput) {
        // 1. Validate Input
        const validated = listingInputSchema.parse(input);

        // 2. Sanitize Text inputs
        const cleanTitle = sanitizeHtml(validated.title, { allowedTags: [] });
        const cleanDescription = sanitizeHtml(validated.description);

        // 3. Process Images (Already optimized by upload route)
        // Just use the URLs directly
        const optimizedImages = validated.images;

        // 4. Generate Translations (Parallel)
        // Ensure EN is obtained via translation if input is not EN
        const languages = ["ru", "ar", "zh", "tr", "en"] as const;
        const translations = await Promise.all(
            languages.map(async (lang) => {
                const titleTx = await translateText({ text: cleanTitle, targetLanguage: lang });
                const descTx = await translateText({ text: cleanDescription, targetLanguage: lang });
                return {
                    lang,
                    title: titleTx.translatedText,
                    description: descTx.translatedText
                };
            })
        );

        // 5. Database Transaction
        return await db.transaction(async (tx) => {
            // Insert Listing
            const info = await tx.insert(listings).values({
                agentId: validated.agentId,
                type: validated.type,
                price: validated.price,
                currency: validated.currency,
                location: validated.location,
                features: validated.features,
                isShowcase: validated.isShowcase,
                status: "draft",
            }).returning({ id: listings.id }).get();

            const newId = Number(info?.id);
            if (!newId || isNaN(newId)) {
                throw new Error("Failed to retrieve new listing ID");
            }

            // Insert Translations (Input Language + Generated)

            // 1. Insert/Update English (Base)
            // If input is not EN, we need to translate to EN for the base record
            let enTitle = cleanTitle;
            let enDesc = cleanDescription;

            // Find EN translation from the generated batch if input wasn't EN
            // (Assuming input might be TR, and we want EN as base)
            const enTranslation = translations.find(t => t.lang === 'en');
            if (enTranslation) {
                enTitle = enTranslation.title;
                enDesc = enTranslation.description;
            }

            await tx.insert(listingTranslations).values({
                listingId: newId,
                language: "en",
                title: enTitle,
                description: enDesc,
                slug: this.generateSlug(enTitle)
            });

            // 2. Insert other generated translations
            for (const t of translations) {
                if (t.lang === 'en') continue; // Already inserted above

                await tx.insert(listingTranslations).values({
                    listingId: newId,
                    language: t.lang,
                    title: t.title,
                    description: t.description,
                    slug: this.generateSlug(t.title)
                });
            }

            // 3. Generate Serial Code
            let prefix = "L";
            if (validated.type === "real_estate") prefix = "E";
            if (validated.type === "vehicle") prefix = "V";
            if (validated.type === "part") prefix = "YP";

            const serialCode = `${prefix}-${10000 + newId}`;

            await tx.update(listings)
                .set({ serialCode })
                .where(eq(listings.id, newId));

            // Insert Media
            for (const [index, img] of optimizedImages.entries()) {
                await tx.insert(media).values({
                    listingId: newId,
                    url: img, // Use the URL string directly
                    type: "image",
                    order: index
                });
            }

            return { id: newId, serialCode };
        });
    }

    async incrementView(id: number) {
        // Simple increment
        await db.update(listings)
            .set({ viewCount: sql`${listings.viewCount} + 1` })
            .where(sql`${listings.id} = ${id}`)
            .run();
    }

    async getListingsByAgent(agentId: number) {
        // Check for expirations first
        await this.checkExpirations(agentId);

        const results = await db.query.listings.findMany({
            where: (listings, { eq }) => eq(listings.agentId, agentId),
            with: {
                media: true,
                translations: true
            },
            orderBy: (listings, { desc }) => [desc(listings.createdAt)]
        });

        // Map to simpler structure if needed, or return raw
        return results.map(r => ({
            ...r,
            title: r.translations.find(t => t.language === 'en')?.title || "Untitled", // Fallback
            image: r.media.find(m => m.order === 0)?.url || null,
            location: r.location as any, // Cast JSON
        }));
    }

    async getAllListings() {
        // Admin view - get everything
        const results = await db.query.listings.findMany({
            with: {
                media: true,
                translations: true
            },
            orderBy: (listings, { desc }) => [desc(listings.createdAt)]
        });

        return results.map(r => ({
            ...r,
            title: r.translations.find(t => t.language === 'en')?.title || "Untitled",
            image: r.media.find(m => m.order === 0)?.url || null,
            location: r.location as any,
        }));
    }

    async checkExpirations(agentId: number) {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        await db.update(listings)
            .set({ status: "archived" }) // archived = passive/waiting
            .where(
                and(
                    eq(listings.agentId, agentId),
                    eq(listings.status, 'published'),
                    lt(listings.createdAt, ninetyDaysAgo)
                )
            )
            .run();
    }

    async republishListing(id: number) {
        await db.update(listings)
            .set({
                status: "published",
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .where(sql`${listings.id} = ${id}`)
            .run();
    }

    async updateListing(id: number, input: ListingInput, locale: string = 'en') {
        const validated = listingInputSchema.parse(input);

        // 1. Sanitize Text
        const cleanTitle = sanitizeHtml(validated.title, { allowedTags: [] });
        const cleanDescription = sanitizeHtml(validated.description);

        // 2. Images (Already optimized by upload route)
        // Just use the URLs directly
        const optimizedImages = validated.images;

        // 3. Database Transaction
        return await db.transaction(async (tx) => {
            // Update Main Listing
            await tx.update(listings)
                .set({
                    price: validated.price,
                    currency: validated.currency,
                    location: validated.location,
                    features: validated.features,
                    isShowcase: validated.isShowcase,
                    updatedAt: new Date()
                })
                .where(sql`${listings.id} = ${id}`);

            // Update Translations (Locale Aware)
            // Ensure locale is valid, fallback to 'en'
            const validLocale = LANGUAGES.includes(locale as any) ? (locale as typeof LANGUAGES[number]) : 'en';
            const targetLocale = validLocale;

            const existingTrans = await tx.select().from(listingTranslations)
                .where(and(eq(listingTranslations.listingId, id), eq(listingTranslations.language, targetLocale)))
                .get();

            if (existingTrans) {
                await tx.update(listingTranslations)
                    .set({
                        title: cleanTitle,
                        description: cleanDescription,
                        slug: this.generateSlug(cleanTitle)
                    })
                    .where(eq(listingTranslations.id, existingTrans.id));
            } else {
                await tx.insert(listingTranslations).values({
                    listingId: id,
                    language: targetLocale,
                    title: cleanTitle,
                    description: cleanDescription,
                    slug: this.generateSlug(cleanTitle)
                });
            }

            // Update Images:
            // Strategy: Delete all existing images and re-insert.
            await tx.delete(media)
                .where(and(eq(media.listingId, id), eq(media.type, 'image')));

            // Insert Media
            for (const [index, img] of optimizedImages.entries()) {
                await tx.insert(media).values({
                    listingId: id,
                    url: img, // Use the URL string directly
                    type: "image",
                    order: index
                });
            }
        });
    }

    async deleteListing(id: number) {
        await db.delete(listings).where(sql`${listings.id} = ${id}`).run();
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
