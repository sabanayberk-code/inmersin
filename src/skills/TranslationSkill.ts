import { z } from "zod";

export const translationInputSchema = z.object({
    text: z.string().min(1),
    targetLanguage: z.enum(["en", "ru", "ar", "zh"]),
});

export type TranslationInput = z.infer<typeof translationInputSchema>;

export const translationOutputSchema = z.object({
    translatedText: z.string(),
    originalText: z.string(),
    language: z.string(),
});

export type TranslationOutput = z.infer<typeof translationOutputSchema>;

export async function translateText(input: TranslationInput): Promise<TranslationOutput> {
    // SIMULATION: In a real app, call OpenAI or Google Translate API here.
    // For now, we just prepend the language code to the text.

    const validated = translationInputSchema.parse(input);

    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
        translatedText: `[${validated.targetLanguage.toUpperCase()}] ${validated.text}`,
        originalText: validated.text,
        language: validated.targetLanguage
    };
}
