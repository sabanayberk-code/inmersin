'use client';

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingInputSchema, ListingInput } from "@/lib/validations/listing";
import { submitListingJson } from "@/actions/createListing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_DATA } from '@/data/categories';
import { CITIES } from '@/data/locations';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { useLocale } from "next-intl";
import RealEstateFields from "./listing/RealEstateFields";
import VehicleFields from "./listing/VehicleFields";
import PartFields from "./listing/PartFields";
import ImageUpload from "./ImageUpload";

// Base Mock Exchange Rates
const RATES: Record<string, number> = {
    USD: 1,
    TRY: 35.5,
    EUR: 0.92
};

const localeCurrency: Record<string, "USD" | "EUR" | "TRY"> = {
    en: "USD",
    tr: "TRY",
    zh: "USD", // fallback
    ru: "USD",
    ar: "USD"
};

const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, c => c.toUpperCase());
};

const formatPrice = (value: number | string) => {
    if (!value) return "";
    return new Intl.NumberFormat('en-US').format(Number(value)); // Always use commas
};

const generateSerial = () => `L-${Math.floor(100000 + Math.random() * 900000)}`;

interface ListingFormProps {
    initialData?: any;
    isEditMode?: boolean;
}

export default function ListingForm({ initialData, isEditMode = false }: ListingFormProps) {
    const t = useTranslations('Form');
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [serialNo, setSerialNo] = useState("");

    useEffect(() => {
        setSerialNo(generateSerial());
    }, []);

    // Helper to remove [TR] prefix
    const cleanText = (text: string) => {
        if (!text) return "";
        return text.replace(/^\[(TR|EN|zh|ru|ar)\]\s*/i, "").trim();
    };

    // Helper to translate errors safely
    const tError = (msg?: string) => {
        if (!msg) return null;
        if (msg.includes("Invalid input") || msg.includes("expected number")) return t('err_number');
        if (msg.includes("Too small") || msg.includes("expected number to be >=")) return t('err_min_value');
        if (msg.startsWith("err_")) return t(msg);
        return t(msg); // Fallback
    };

    // Price formatting state
    const [displayPrice, setDisplayPrice] = useState("");
    const [currency, setCurrency] = useState<"USD" | "EUR" | "TRY">("USD");

    // Determine Listing Type based on initialData
    // Check new mainCategory first, fallback to old logic
    const isVehicle = initialData?.mainCategory === 'Vasıta' || initialData?.category === 'Vasıta';
    const isPart = initialData?.mainCategory === 'Yedek Parça' || initialData?.category === 'Yedek Parça';

    let discriminatorType = 'real_estate';
    if (isVehicle) discriminatorType = 'vehicle';
    if (isPart) discriminatorType = 'part';

    // Map "Satılık" -> "Sale"
    const mapListingType = (val?: string) => {
        if (!val) return "Sale";
        if (val.includes("Satılık")) return "Sale";
        if (val.includes("Kiralık")) return "Rent";
        return "Sale";
    };

    const getInitialTitle = () => {
        if (!initialData) return "";
        if (initialData.title && initialData.title !== "Untitled") return cleanText(initialData.title);

        const type = initialData.features?.type || initialData.type || "";
        const pType = initialData.features?.propertyType || initialData.propertyType || "";
        return `${type} ${pType}`.trim();
    };


    const formMethods = useForm<any>({
        resolver: zodResolver(listingInputSchema),
        defaultValues: {
            agentId: 1,
            type: discriminatorType,
            currency: "USD",
            title: getInitialTitle(),
            description: cleanText(initialData?.description || ""),
            features: {
                // Common defaults
                type: initialData?.features?.type || mapListingType(initialData?.type),
                category: initialData?.features?.category || initialData?.subCategory || initialData?.category,
                propertyType: initialData?.features?.propertyType || initialData?.propertyType,
                listingType: initialData?.features?.listingType || mapListingType(initialData?.type),

                // Merge existing features
                ...(initialData?.features || {}),

                // Conditional Defaults if not present
                ...(!initialData?.features ? (isVehicle ? {
                    year: 2023,
                    km: 10000,
                } : isPart ? {
                    condition: "New",
                    listingType: "Sale"
                } : {
                    // Real Estate Defaults
                    bedrooms: "2+1",
                    bathrooms: 1,
                    floorNumber: 1,
                    totalFloors: 5,
                    heating: "Gas",
                    kitchen: "Open",
                }) : {})
            },
            images: initialData?.images || [],
            price: initialData?.price || 0,
            isShowcase: initialData?.isShowcase || false,
            // Pre-fill location
            location: initialData?.location || {
                lat: 0,
                lng: 0,
                country: "Turkey"
            }
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        getValues,
        watch,
        control
    } = formMethods;

    // Watch for city changes to filter districts
    const watchedCity = watch("location.city");



    // Handle initial locale currency
    useEffect(() => {
        const targetCurrency = localeCurrency[locale] || "USD";
        // If editing, preserve existing currency if possible, or allow user formatting
        // But for now, just set what we have or default
        setCurrency(initialData?.currency as any || targetCurrency);
        setValue("currency", initialData?.currency || targetCurrency);

        if (initialData?.price) {
            setDisplayPrice(new Intl.NumberFormat('en-US').format(Number(initialData.price)));
        }
    }, [initialData]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (!isNaN(Number(rawValue))) {
            setValue("price", Number(rawValue));
            setDisplayPrice(new Intl.NumberFormat('en-US').format(Number(rawValue)));
        } else if (rawValue === "") {
            setValue("price", 0);
            setDisplayPrice("");
        }
    };

    const handleCapitalize = (field: any, value: string) => {
        const capped = capitalizeWords(value);
        setValue(field, capped);
    };

    const onSubmit = (data: any) => {
        setError(null);
        startTransition(async () => {
            // data.images is already populated and validated by the sync effect and Zod
            const images = data.images && data.images.length > 0
                ? data.images
                : ["https://example.com/placeholder.jpg"];

            const payload = {
                ...data,
                location: {
                    ...data.location,
                    country: "Turkey"
                },
                images,
                id: isEditMode ? initialData.id : undefined // Pass ID if editing
            };

            const res = await submitListingJson(payload);
            if (res.success) {
                if (isEditMode) {
                    alert("Listing Updated!");
                    router.push('/dashboard');
                } else {
                    alert(t('success', { id: `S-${serialNo}` }));
                    reset();
                    setDisplayPrice("");
                    setSerialNo(generateSerial());
                }
            } else {
                setError(res.error || "Unknown error");
                console.log(errors); // Debug
            }
        });
    };

    return (
        <FormProvider {...formMethods}>
            <Card className="w-full max-w-5xl mx-auto shadow-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">{t('header')} ({initialData?.category || "Listing"})</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Serial Number & Showcase */}
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
                            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">{t('sec_basic')}</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200">
                                    <input type="checkbox" id="isShowcase" {...register("isShowcase")} className="w-4 h-4 text-yellow-600" />
                                    <Label htmlFor="isShowcase" className="cursor-pointer font-bold text-yellow-700 dark:text-yellow-400">{t('add_showcase')}</Label>
                                </div>
                                <span className="text-sm text-gray-500 font-mono bg-white dark:bg-black px-2 py-1 rounded border">
                                    NO: {serialNo}
                                </span>
                            </div>
                        </div>

                        {/* Section 1: Overview (Shared) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label>{t('title')}</Label>
                                <Input
                                    {...register("title")}
                                    placeholder={t('ph_title')}
                                    onBlur={(e) => handleCapitalize("title", e.target.value)}
                                />
                                {errors.title && <p className="text-red-500 text-sm">{errors.title.message as string}</p>}
                            </div>

                            {/* Hidden Type Input */}
                            <input type="hidden" {...register("type")} value={discriminatorType} />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('description')}</Label>
                            <Textarea
                                {...register("description")}
                                placeholder={t('ph_desc')}
                                className="h-32 resize-none"
                                onBlur={(e) => handleCapitalize("description", e.target.value)}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description.message as string}</p>}
                        </div>

                        {/* Section 2: Financial Information (Shared) */}
                        <div className="border-t pt-6">
                            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-4">{t('sec_financial')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>{t('price')}</Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            value={displayPrice}
                                            onChange={handlePriceChange}
                                            placeholder="0"
                                            className="pr-12 font-semibold text-lg"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                                            {currency === "TRY" ? "₺" : currency === "EUR" ? "€" : "$"}
                                        </span>
                                    </div>
                                    <input type="hidden" {...register("price", { valueAsNumber: true })} />
                                    {errors.price && <p className="text-red-500 text-sm">{tError(errors.price.message as string)}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Location (Shared & Enhanced) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 md:col-span-2">{t('sec_location')}</h3>

                            <div className="space-y-2">
                                <Label>{t('province')}</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register("location.city")}
                                    onChange={(e) => {
                                        register("location.city").onChange(e); // Propagate to react-hook-form
                                        setValue("location.district", ""); // Reset district
                                    }}
                                >
                                    <option value="">{t('lbl_city')}</option>
                                    <option value="Mersin" className="font-bold">Mersin</option>
                                    <option disabled>──────────</option>
                                    {Object.keys(CITIES).filter(c => c !== 'Mersin').sort().map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {(errors.location as any)?.city && <p className="text-red-500 text-sm">{(errors.location as any).city.message as string}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>{t('district')}</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register("location.district")}
                                    disabled={!watchedCity}
                                >
                                    <option value="">{t('lbl_district')}</option>
                                    {watchedCity && CITIES[watchedCity] && CITIES[watchedCity].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                {(errors.location as any)?.district && <p className="text-red-500 text-sm">{(errors.location as any).district.message as string}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>{t('neighborhood')}</Label>
                                <Input {...register("location.neighborhood")} placeholder="Mahalle..." />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('address')}</Label>
                                <Input {...register("location.address")} placeholder={t('address')} />
                            </div>
                        </div>

                        {/* Dynamic Sections */}
                        {isVehicle ? <VehicleFields /> : isPart ? <PartFields /> : <RealEstateFields />}



                        <div className="space-y-2 border-t pt-6">
                            <Label>{t('sec_images')}</Label>
                            <ImageUpload
                                value={watch("images") || []}
                                onChange={(urls) => setValue("images", urls, { shouldValidate: true })}
                                placeholder="Click or drag images here. Supported: JPG, PNG, WebP"
                            />
                            {/* Explicit Image Error */}
                            {errors.images && (
                                <p className="text-red-500 text-sm mt-1 font-medium">
                                    {(errors.images as any)?.message || "At least one image is required."}
                                </p>
                            )}
                            {/* Display generic form errors if needed */}
                            {Object.keys(errors).length > 0 && <p className="text-red-500 text-sm font-bold mt-2">Please fix the errors above.</p>}
                        </div>

                        {error && <div className="p-3 bg-red-100 text-red-600 rounded">{error}</div>}

                        <Button type="submit" disabled={isPending} className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white">
                            {isPending ? t('publishing') : t('submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </FormProvider >
    );
}
