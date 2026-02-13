import { db } from "../lib/db";
import { listings, listingTranslations, media } from "../db/schema";
import { listingInputSchema, ListingInput } from "../lib/validations/listing";
import { translateText } from "../skills/TranslationSkill";
import { optimizeImage } from "../skills/ImageOptimizationSkill";
import sanitizeHtml from "sanitize-html";
import { sql, eq, and, lt } from "drizzle-orm";

export class ListingAgent {

    async createListing(input: ListingInput) {
        // 1. Validate Input
        const validated = listingInputSchema.parse(input);

        // 2. Sanitize Text inputs
        const cleanTitle = sanitizeHtml(validated.title, { allowedTags: [] });
        const cleanDescription = sanitizeHtml(validated.description);

        // 3. Process Images (Parallel)
        const optimizedImages = await Promise.all(
            validated.images.map(url => optimizeImage({ imageUrl: url }))
        );

        // 4. Generate Translations (Parallel)
        const languages = ["ru", "ar", "zh", "tr"] as const;
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
        return db.transaction(async (tx) => {
            // Insert Listing
            const info = tx.insert(listings).values({
                agentId: validated.agentId,
                type: validated.type,
                price: validated.price,
                currency: validated.currency,
                location: validated.location,
                features: validated.features,
                isShowcase: validated.isShowcase,
                status: "draft",
            }).run() as any;

            const newId = Number(info.lastInsertRowid);

            // Insert Translations (Input Language + Generated)
            tx.insert(listingTranslations).values({
                listingId: newId,
                language: "en",
                title: cleanTitle,
                description: cleanDescription,
                slug: this.generateSlug(cleanTitle)
            }).run();

            // Generated
            for (const t of translations) {
                tx.insert(listingTranslations).values({
                    listingId: newId,
                    language: t.lang,
                    title: t.title,
                    description: t.description,
                    slug: this.generateSlug(t.title)
                }).run();
            }

            // Insert Media
            for (const [index, img] of optimizedImages.entries()) {
                tx.insert(media).values({
                    listingId: newId,
                    url: img.optimizedUrl,
                    type: "image",
                    order: index
                }).run();
            }

            return newId;
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

    async updateListing(id: number, input: ListingInput) {
        const validated = listingInputSchema.parse(input);

        // 1. Sanitize Text
        const cleanTitle = sanitizeHtml(validated.title, { allowedTags: [] });
        const cleanDescription = sanitizeHtml(validated.description);

        // 2. Optimize Images
        const optimizedImages = await Promise.all(
            validated.images.map(url => optimizeImage({ imageUrl: url }))
        );

        // 3. Database Transaction
        return db.transaction(async (tx) => {
            // Update Main Listing
            tx.update(listings)
                .set({
                    price: validated.price,
                    currency: validated.currency,
                    location: validated.location,
                    features: validated.features,
                    isShowcase: validated.isShowcase,
                    updatedAt: new Date()
                })
                .where(sql`${listings.id} = ${id}`)
                .run();

            // Update Translations:
            // For simplicity, we'll update the 'en' (or base) translation.
            // A more robust app would track which language is being edited or update all if content changes significantly.
            // Here we assume the input is the "main" content.
            // We'll update the existing 'en' record or insert if missing (though it shouldn't be).
            const existingEn = await tx.select().from(listingTranslations)
                .where(and(eq(listingTranslations.listingId, id), eq(listingTranslations.language, 'en')))
                .get();

            if (existingEn) {
                tx.update(listingTranslations)
                    .set({
                        title: cleanTitle,
                        description: cleanDescription,
                        slug: this.generateSlug(cleanTitle)
                    })
                    .where(eq(listingTranslations.id, existingEn.id))
                    .run();
            }

            // Update Images:
            // Strategy: Delete all existing images and re-insert.
            tx.delete(media)
                .where(and(eq(media.listingId, id), eq(media.type, 'image')))
                .run();

            for (const [index, img] of optimizedImages.entries()) {
                tx.insert(media).values({
                    listingId: id,
                    url: img.optimizedUrl,
                    type: "image",
                    order: index
                }).run();
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
