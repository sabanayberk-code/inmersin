import { z } from "zod";

export const propertyLocationSchema = z.object({
    address: z.string().min(5, "Address is too short"),
    city: z.string().min(2, "City name is too short"),
    country: z.string().min(2, "Country name is too short"),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
});

export const propertyFeaturesSchema = z.object({
    bedrooms: z.number().int().min(0),
    bathrooms: z.number().int().min(0),
    area: z.number().positive("Area must be positive"),
    hasPool: z.boolean().default(false),
    hasGarden: z.boolean().default(false),
    hasGarage: z.boolean().default(false),
    details: z.record(z.string(), z.any()).optional(), // Flexible for extra JSON data
});

export const propertyInputSchema = z.object({
    agentId: z.number().int(),
    price: z.number().positive("Price must be positive"),
    currency: z.enum(["USD", "EUR", "TRY"]).default("USD"),
    location: propertyLocationSchema,
    features: propertyFeaturesSchema,
    // Initial content in default language (English usually)
    title: z.string().min(10, "Title must be at least 10 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    images: z.array(z.string().url()).min(1, "At least one image is required"),
});

export type PropertyInput = z.infer<typeof propertyInputSchema>;
