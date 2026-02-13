import { z } from "zod";

// Shared Location Schema
export const locationSchema = z.object({
    address: z.string().optional(),
    city: z.string().min(2, "err_min_2"),
    district: z.string().optional(),
    neighborhood: z.string().optional(),
    country: z.string().min(2, "err_min_2"),
    lat: z.number({ message: "err_number" }).min(-90).max(90),
    lng: z.number({ message: "err_number" }).min(-180).max(180),
});

// REAL ESTATE Features
export const realEstateFeaturesSchema = z.object({
    bedrooms: z.string().min(1, "err_required"),
    bathrooms: z.number().int().min(0),
    wc: z.number().int().min(0).default(0),
    area: z.number().positive("err_positive"),
    netArea: z.number().positive("err_positive"),

    // Category
    category: z.string().optional(),

    // Property Type
    propertyType: z.string().optional(),

    // Listing Type
    listingType: z.enum(["Sale", "Rent"]).default("Sale"),

    buildingAge: z.string().min(1, "err_required"),
    floorNumber: z.number().int(),
    totalFloors: z.number().int().min(1, "err_required"),
    heating: z.string().min(1, "err_required"),
    kitchen: z.enum(["Open", "Closed"]),
    balcony: z.boolean().default(false),
    elevator: z.boolean().default(false),
    parking: z.string().optional(),
    furnished: z.boolean().default(false),
    usageStatus: z.string().min(1, "err_required"),
    inComplex: z.boolean().default(false),
    complexName: z.string().optional(),
    dues: z.preprocess((val) => (typeof val === 'number' && isNaN(val)) ? undefined : val, z.number().min(0).optional()),
    deposit: z.preprocess((val) => (typeof val === 'number' && isNaN(val)) ? undefined : val, z.number().min(0).optional()),
    titleStatus: z.string().optional(),
    fromWhom: z.string().optional(),
    hasPool: z.boolean().default(false),
    hasGarden: z.boolean().default(false),
    hasGarage: z.boolean().default(false),
    details: z.record(z.string(), z.any()).optional(),
});

// VEHICLE Features
export const vehicleFeaturesSchema = z.object({
    propertyType: z.string().min(1, "err_required"), // Brand
    model: z.string().min(1, "err_required"),
    year: z.number({ message: "err_number" }).int().min(1900).max(new Date().getFullYear() + 1),
    km: z.number({ message: "err_number" }).int().min(0),
    category: z.string().optional(),
    caseType: z.string().min(1, "err_required"),
    fuel: z.enum(["Gasoline", "Diesel", "LPG", "Electric", "Hybrid"]),
    gear: z.enum(["Manual", "Automatic", "Semi-Automatic"]),
    color: z.string().min(1, "err_required"),
    damageStatus: z.string().optional(),
    enginePower: z.number().optional(),
    engineDisplacement: z.number().optional(),
    drivetrain: z.string().optional(),
    warranty: z.boolean().default(false),
    swap: z.boolean().default(false),
    fromWhom: z.string().optional(),
    listingType: z.enum(["Sale", "Rent"]).default("Sale"),
});

// PART Features
export const partFeaturesSchema = z.object({
    condition: z.enum(["New", "Used"]).default("New"),
    category: z.string().optional(),
    brand: z.string().optional(),
    compatibility: z.string().optional(),
    oemNo: z.string().optional(),
    listingType: z.enum(["Sale"]).default("Sale"),
});

// Base Input
const baseListingInput = z.object({
    agentId: z.number().int(),
    price: z.number({ message: "err_number" }).positive("err_positive"),
    currency: z.enum(["USD", "EUR", "TRY"]).default("USD"),
    location: locationSchema,
    title: z.string().min(10, "err_min_10"),
    description: z.string().min(20, "err_min_20"),
    images: z.array(z.string()).optional().default([]),
    isShowcase: z.boolean().default(false),
});

// Discriminated Union
export const listingInputSchema = z.discriminatedUnion("type", [
    baseListingInput.extend({
        type: z.literal("real_estate"),
        features: realEstateFeaturesSchema
    }),
    baseListingInput.extend({
        type: z.literal("vehicle"),
        features: vehicleFeaturesSchema
    }),
    baseListingInput.extend({
        type: z.literal("part"),
        features: partFeaturesSchema
    })
]);

export type ListingInput = z.infer<typeof listingInputSchema>;
export type RealEstateFeatures = z.infer<typeof realEstateFeaturesSchema>;
export type VehicleFeatures = z.infer<typeof vehicleFeaturesSchema>;
export type PartFeatures = z.infer<typeof partFeaturesSchema>;

