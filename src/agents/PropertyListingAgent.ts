import { db } from "../lib/db";
import { properties, propertyTranslations, media } from "../db/schema";
import { propertyInputSchema, PropertyInput } from "../lib/validations/property";
import { translateText } from "../skills/TranslationSkill";
import { optimizeImage } from "../skills/ImageOptimizationSkill";
import sanitizeHtml from "sanitize-html";

export class PropertyListingAgent {

    async createListing(input: PropertyInput) {
        // 1. Validate Input
        const validated = propertyInputSchema.parse(input);

        // 2. Sanitize Text inputs
        const cleanTitle = sanitizeHtml(validated.title, { allowedTags: [] });
        const cleanDescription = sanitizeHtml(validated.description); // Allow basic tags? No, strict for now.

        // 3. Process Images (Parallel)
        const optimizedImages = await Promise.all(
            validated.images.map(url => optimizeImage({ imageUrl: url }))
        );

        // 4. Generate Translations (Parallel)
        // We assume input is EN for now, but we should probably passed input language
        const languages = ["ru", "ar", "zh"] as const;
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
            // Insert Property
            const [newProp] = await tx.insert(properties).values({
                agentId: validated.agentId,
                price: validated.price.toString(),
                currency: validated.currency,
                location: validated.location,
                features: validated.features,
                status: "draft", // Default to draft
            }).returning({ id: properties.id });

            // Insert Translations (Input Language + Generated)
            // Input (EN default)
            await tx.insert(propertyTranslations).values({
                propertyId: newProp.id,
                language: "en",
                title: cleanTitle,
                description: cleanDescription,
                slug: this.generateSlug(cleanTitle)
            });

            // Generated
            for (const t of translations) {
                await tx.insert(propertyTranslations).values({
                    propertyId: newProp.id,
                    language: t.lang,
                    title: t.title,
                    description: t.description,
                    slug: this.generateSlug(t.title)
                });
            }

            // Insert Media
            for (const [index, img] of optimizedImages.entries()) {
                await tx.insert(media).values({
                    propertyId: newProp.id,
                    url: img.optimizedUrl,
                    type: "image",
                    order: index
                });
            }

            return newProp.id;
        });
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
