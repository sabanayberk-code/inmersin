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

    // Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    console.log("ListingForm initialData:", initialData);

    // Ensure serialNo is cleared on mount if not provided (though we use it for success message)
    useEffect(() => {
        setSerialNo("");
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
    // Check 'type' first, then fallback to categories to handle both new and old DB structures
    const checkCat = initialData?.features?.category || initialData?.subCategory || initialData?.category;

    // Robust fallback for older listings that didn't save category properly
    const isVehicleFallback = initialData?.features?.year !== undefined || initialData?.features?.km !== undefined || initialData?.features?.gear !== undefined || initialData?.features?.fuel !== undefined;
    const isPartFallback = initialData?.features?.condition !== undefined || initialData?.features?.oemNo !== undefined || initialData?.features?.compatibility !== undefined;

    const isVehicle = initialData?.type === 'vehicle' ||
        initialData?.mainCategory === 'Vasıta' ||
        initialData?.category === 'Vasıta' ||
        (checkCat && CATEGORY_DATA['Vasıta']?.subcategories?.[checkCat]) ||
        isVehicleFallback;

    const isPart = initialData?.type === 'part' ||
        initialData?.mainCategory === 'Yedek Parça' ||
        initialData?.category === 'Yedek Parça' ||
        (checkCat && CATEGORY_DATA['Yedek Parça']?.subcategories?.[checkCat]) ||
        isPartFallback;

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
            currency: localeCurrency[locale] || "USD",
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
                    gear: "Manual",
                    fuel: "Gasoline",
                    caseType: "Sedan",
                    model: "X5" // Default model to pass validation
                } : isPart ? {
                    condition: "New",
                    listingType: "Sale",
                    brand: initialData?.brand, // Map brand if present
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
            location: {
                lat: 0,
                lng: 0,
                ...(initialData?.location || {}),
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

    // Debugging
    console.log("Discriminator Type:", discriminatorType);
    console.log("Current Form Valid:", Object.keys(errors).length === 0);
    if (Object.keys(errors).length > 0) console.log("Form Errors:", errors);
    const watchedType = watch("type");
    console.log("Watched Type:", watchedType);

    // Force type set
    useEffect(() => {
        if (discriminatorType) {
            setValue("type", discriminatorType as any);
        }
    }, [discriminatorType, setValue]);

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

    // Reset form when initialData changes (important for Edit Mode async fetch)
    useEffect(() => {
        if (initialData) {
            // We need to carefully construct the reset object to match schema
            const resetCurrency = initialData.currency || localeCurrency[locale] || "USD";
            const formattedData = {
                agentId: initialData.agentId || 1,
                currency: resetCurrency,
                title: initialData.title || getInitialTitle(),
                description: cleanText(initialData.description || ""),
                price: initialData.price || 0,
                isShowcase: initialData.isShowcase || false,
                location: {
                    lat: 0,
                    lng: 0,
                    ...(initialData.location || {}),
                    country: "Turkey"
                },
                images: initialData.images || [],
                type: discriminatorType, // FORCE discriminator type, ignore initialData.type collision
                features: {
                    ...(initialData.features || {}),
                    // Ensure mapping happens if missing
                    type: initialData.features?.type || mapListingType(initialData.type || initialData.features?.listingType),
                    category: initialData.features?.category || initialData.subCategory || initialData.category,
                    propertyType: initialData.features?.propertyType || initialData.propertyType,
                    listingType: initialData.features?.listingType || mapListingType(initialData.type || initialData.features?.type),

                    // Vehicle defaults if missing
                    ...(isVehicle ? {
                        year: initialData.features?.year || 2023,
                        km: initialData.features?.km || 10000,
                        gear: initialData.features?.gear || "Manual",
                        fuel: initialData.features?.fuel || "Gasoline",
                        caseType: initialData.features?.caseType || "Sedan",
                        model: initialData.features?.model || "X5"
                    } : isPart ? {
                        brand: initialData.brand || initialData.features?.brand // Ensure brand is reset
                    } : {})
                }
            };
            // Only reset if we actually have data to avoid wiping form on mount if undefined
            if (Object.keys(initialData).length > 0) {
                reset(formattedData);
                // Also set internal states
                setDisplayPrice(formatPrice(formattedData.price));
                setCurrency(resetCurrency as any);
            }
        }
    }, [initialData, reset]);

    // Validation per step
    const nextStep = async () => {
        let fieldsToValidate: string[] = [];

        if (currentStep === 1) {
            fieldsToValidate = ['title', 'description', 'price', 'currency'];
        } else if (currentStep === 2) {
            fieldsToValidate = ['location.city', 'location.district', 'location.neighborhood', 'location.address'];
        } else if (currentStep === 3) {
            // Features step
            fieldsToValidate = ['features', 'type'];
        }

        const isStepValid = await formMethods.trigger(fieldsToValidate as any);
        if (isStepValid) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of form on step change
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of form on step change
    };

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
        if (currentStep !== totalSteps) {
            // Prevent Enter key from submitting the form early; instead move to next step
            nextStep();
            return;
        }

        setError(null);
        startTransition(async () => {
            // data.images is already populated and validated by the sync effect and Zod
            const images = data.images && data.images.length > 0
                ? data.images
                : ["/placeholder.svg"];

            console.log("Submitting images:", images);

            const payload = {
                ...data,
                location: {
                    ...data.location,
                    country: "Turkey"
                },
                features: {
                    ...data.features,
                    category: data.features?.category || initialData?.category,
                    propertyType: data.features?.propertyType || initialData?.propertyType,
                    type: data.features?.type || initialData?.features?.type,
                    listingType: data.features?.listingType || initialData?.features?.listingType
                },
                images,
                id: isEditMode ? initialData.id : undefined, // Pass ID if editing
                locale // Pass current locale for correct translation update
            };

            const res = await submitListingJson(payload);
            if (res.success) {
                if (isEditMode) {
                    alert("Listing Updated!");
                    router.push('/dashboard');
                } else {
                    const code = (res as any).serialCode || `ID-${res.listingId}`;
                    setSerialNo(code);
                    alert(t('success', { id: code }));
                    reset();
                    setDisplayPrice("");
                }
            } else {
                setError(res.error || "Unknown error");
                console.log(errors); // Debug
            }
        });
    };

    return (
        <FormProvider {...formMethods}>
            <Card className="w-full max-w-4xl mx-auto shadow-md border-0 bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
                <CardHeader className="bg-white dark:bg-gray-900 border-b rounded-t-xl pb-6">
                    <CardTitle className="text-2xl text-center font-bold text-gray-800 dark:text-gray-100">
                        {t('header')} <span className="text-blue-600 font-normal">({initialData?.category || "Listing"})</span>
                    </CardTitle>

                    {/* Stepper Wizard Indicator */}
                    <div className="flex items-center justify-center mt-6 w-full max-w-2xl mx-auto">
                        <div className="flex w-full items-center">
                            {[
                                { num: 1, label: "Bilgiler" },
                                { num: 2, label: "Konum" },
                                { num: 3, label: "Özellikler" },
                                { num: 4, label: "Medya & Onay" },
                            ].map((stepObj, index) => (
                                <div key={stepObj.num} className="flex flex-col items-center relative z-10 flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= stepObj.num
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/50'
                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700'
                                        }`}>
                                        {currentStep > stepObj.num ? '✓' : stepObj.num}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium hidden sm:block ${currentStep >= stepObj.num ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500'}`}>
                                        {stepObj.label}
                                    </span>

                                    {/* Connector Line */}
                                    {index < 3 && (
                                        <div className="absolute top-4 left-[60%] w-[80%] h-[2px] -z-10 bg-gray-200 dark:bg-gray-800">
                                            <div
                                                className="h-full bg-blue-600 transition-all duration-500"
                                                style={{ width: currentStep > stepObj.num ? '100%' : '0%' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 md:p-8 bg-white dark:bg-gray-900 rounded-b-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">

                        {error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md font-medium text-sm">{error}</div>}

                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                                {/* Header Row: Title & Showcase Toggle */}
                                <div className="flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800/80 p-2 md:p-3 rounded-lg border dark:border-gray-700">
                                    <div className="flex-1 flex items-center gap-2">
                                        <h3 className="font-semibold text-base md:text-lg text-gray-700 dark:text-gray-300 shrink-0">Temel Bilgiler</h3>
                                        {isEditMode && (
                                            <span className="text-[10px] md:text-xs text-gray-500 font-mono bg-white dark:bg-black px-1.5 py-0.5 rounded border shadow-sm">
                                                NO: {initialData?.serialCode || serialNo}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 md:px-3 md:py-1.5 rounded-md border border-yellow-200 dark:border-yellow-800/50 transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/40 cursor-pointer shrink-0">
                                        <input type="checkbox" id="isShowcase" {...register("isShowcase")} className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-600 rounded border-yellow-300 focus:ring-yellow-500" />
                                        <Label htmlFor="isShowcase" className="cursor-pointer font-bold text-xs md:text-sm text-yellow-700 dark:text-yellow-500 select-none m-0">Vitrin</Label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                                    {/* Title Column */}
                                    <div className="space-y-1">
                                        <Label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">{t('title')} <span className="text-red-500">*</span></Label>
                                        <Input
                                            {...register("title")}
                                            placeholder={t('ph_title')}
                                            className="h-9 md:h-10 text-sm md:text-base"
                                            onBlur={(e) => handleCapitalize("title", e.target.value)}
                                        />
                                        {errors.title && <p className="text-red-500 text-[11px] md:text-xs font-medium m-0">{errors.title.message as string}</p>}
                                    </div>

                                    {/* Price Column */}
                                    <div className="space-y-1">
                                        <Label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">{t('price')} <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                value={displayPrice}
                                                onChange={handlePriceChange}
                                                placeholder="0"
                                                className="pr-10 font-bold text-base md:text-lg h-9 md:h-10 text-blue-700 dark:text-blue-400"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm md:text-base">
                                                {currency === "TRY" ? "₺" : currency === "EUR" ? "€" : "$"}
                                            </span>
                                        </div>
                                        <input type="hidden" {...register("price", { valueAsNumber: true })} />
                                        {errors.price && <p className="text-red-500 text-[11px] md:text-xs font-medium m-0">{tError(errors.price.message as string)}</p>}
                                    </div>
                                </div>

                                {/* Description Box (Full Width) */}
                                <div className="space-y-1 mt-3 md:mt-4">
                                    <Label className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Açıklama <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        {...register("description")}
                                        placeholder={t('ph_desc')}
                                        className="h-32 md:h-40 resize-none text-xs md:text-sm"
                                        onBlur={(e) => handleCapitalize("description", e.target.value)}
                                    />
                                    {errors.description && <p className="text-red-500 text-[11px] md:text-xs font-medium m-0">{errors.description.message as string}</p>}
                                </div>

                                <input type="hidden" {...register("type")} value={discriminatorType} />
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {currentStep === 2 && (
                            <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="font-semibold text-base md:text-lg text-gray-800 dark:text-gray-100 border-b pb-2">{t('sec_location')}</h3>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label className="font-semibold text-sm">{t('province')} <span className="text-red-500">*</span></Label>
                                        <select
                                            className="flex h-9 md:h-10 w-full rounded-md border border-input bg-background px-2 md:px-3 py-1.5 text-xs md:text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                            {...register("location.city")}
                                            onChange={(e) => {
                                                register("location.city").onChange(e);
                                                setValue("location.district", "");
                                            }}
                                        >
                                            <option value="">İl Seç</option>
                                            <option value="Mersin" className="font-bold">Mersin</option>
                                            <option disabled>──────────</option>
                                            {Object.keys(CITIES).filter(c => c !== 'Mersin').sort().map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        {(errors.location as any)?.city && <p className="text-red-500 text-[11px] md:text-xs font-medium m-0">İl zorunlu.</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="font-semibold text-sm">{t('district')} <span className="text-red-500">*</span></Label>
                                        <select
                                            className="flex h-9 md:h-10 w-full rounded-md border border-input bg-background px-2 md:px-3 py-1.5 text-xs md:text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                            {...register("location.district")}
                                            disabled={!watchedCity}
                                        >
                                            <option value="">İlçe Seç</option>
                                            {watchedCity && CITIES[watchedCity] && CITIES[watchedCity].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        {(errors.location as any)?.district && <p className="text-red-500 text-[11px] md:text-xs font-medium m-0">İlçe zorunlu.</p>}
                                    </div>

                                    <div className="space-y-1 col-span-2 md:col-span-1">
                                        <Label className="font-semibold text-sm">{t('neighborhood')}</Label>
                                        <Input {...register("location.neighborhood")} className="h-9 md:h-10 text-xs md:text-sm" placeholder="Mahalle adı..." />
                                    </div>

                                    <div className="space-y-1 col-span-2 md:col-span-1">
                                        <Label className="font-semibold text-sm">{t('address')}</Label>
                                        <Input {...register("location.address")} className="h-9 md:h-10 text-xs md:text-sm" placeholder="Açık adres..." />
                                    </div>

                                    <input type="hidden" {...register("location.lat", { valueAsNumber: true })} />
                                    <input type="hidden" {...register("location.lng", { valueAsNumber: true })} />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Features */}
                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                {isVehicle ? <VehicleFields isEditMode={isEditMode} /> : isPart ? <PartFields isEditMode={isEditMode} /> : <RealEstateFields isEditMode={isEditMode} />}
                            </div>
                        )}

                        {/* Step 4: Media & Submit */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="font-semibold text-xl text-gray-800 dark:text-gray-100 border-b pb-3">{t('sec_images')}</h3>

                                <div className="space-y-2 max-w-2xl mx-auto">
                                    <ImageUpload
                                        value={watch("images") || []}
                                        onChange={(urls) => setValue("images", urls, { shouldValidate: true })}
                                        placeholder="Fotoğrafları buraya sürükleyin veya tıklayın. (JPG, PNG, WebP)"
                                    />
                                    {errors.images && (
                                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm font-medium text-center mt-2 border border-red-200 dark:border-red-800">
                                            {(errors.images as any)?.message || "En az 1 adet fotoğraf yüklemeniz gereklidir."}
                                        </div>
                                    )}
                                </div>

                                {Object.keys(errors).length > 0 && errors.images === undefined && (
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-md mt-4 max-w-2xl mx-auto">
                                        <h4 className="font-bold text-orange-700 mb-2">Lütfen Önceki Adımlardaki Hataları Düzeltin</h4>
                                        <p className="text-sm text-orange-600">Bazı zorunlu alanlar eksik bırakılmış olabilir, geri dönüp kontrol edebilirsiniz.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Form Navigation Actions */}
                        <div className="flex justify-between items-center pt-4 md:pt-6 border-t mt-4 md:mt-6 dark:border-gray-800">
                            {currentStep > 1 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className="px-4 py-4 md:px-6 md:py-6 text-sm md:text-base font-semibold"
                                >
                                    Geri Dön
                                </Button>
                            ) : <div></div>} {/* Empty div to keep Next button aligned right */}

                            {currentStep < totalSteps ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-4 md:px-8 md:py-6 text-sm md:text-base font-semibold bg-blue-600 hover:bg-blue-700 w-[140px] md:w-auto"
                                >
                                    Sonraki Adım
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isPending || (watch("images")?.length || 0) === 0}
                                    className="px-6 py-4 md:px-10 md:py-6 text-sm md:text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 dark:shadow-none w-[160px] md:w-auto"
                                >
                                    {isPending ? t('publishing') : (isEditMode ? 'Değişiklikleri Kaydet' : 'İlanı Yayınla')}
                                </Button>
                            )}
                        </div>

                    </form>
                </CardContent>
            </Card>
        </FormProvider >
    );
}
