'use client';

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { ResponsiveSelect } from "@/components/ResponsiveSelect";

export default function VehicleFields({ isEditMode }: { isEditMode?: boolean }) {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const t = useTranslations('Form');
    const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    // Helper to translate errors safely
    const tError = (msg?: string) => {
        if (!msg) return null;
        if (msg.includes("Invalid input") || msg.includes("expected number") || msg.includes("NaN")) return t('err_number');
        if (msg.startsWith("err_")) return t(msg);
        return t(msg);
    };

    return (
        <div className="space-y-6">
            {/* Vehicle Details */}
            <div className="border-t pt-6">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-4">{t('sec_vehicle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <Label>{t('lbl_brand')} <span className="text-red-500">*</span></Label>
                        <Input
                            {...register("features.propertyType")}
                            placeholder={t('ph_brand')}
                            readOnly={true}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none"
                        />
                        {(errors as any).features?.propertyType && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.propertyType.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_model')} <span className="text-red-500">*</span></Label>
                        <Input {...register("features.model")} placeholder={t('ph_model')} />
                        {(errors as any).features?.model && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.model.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_year')} <span className="text-red-500">*</span></Label>
                        <Input type="number" {...register("features.year", { valueAsNumber: true })} min={0} placeholder={t('ph_year')} />
                        {(errors as any).features?.year && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.year.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_km')} <span className="text-red-500">*</span></Label>
                        <Input type="number" {...register("features.km", { valueAsNumber: true })} min={0} placeholder={t('ph_km')} />
                        {(errors as any).features?.km && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.km.message)}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('lbl_gear')} <span className="text-red-500">*</span></Label>
                        <ResponsiveSelect
                            value={watch("features.gear") || ""}
                            onValueChange={(val) => setValue("features.gear", val, { shouldValidate: true })}
                            options={[
                                { label: t('opt_automatic'), value: "Automatic" },
                                { label: t('opt_manual'), value: "Manual" },
                                { label: t('opt_semi_automatic'), value: "Semi-Automatic" },
                            ]}
                            placeholder={t('unspecified')}
                            label={t('lbl_gear')}
                        />
                        {(errors as any).features?.gear && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.gear.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_fuel')} <span className="text-red-500">*</span></Label>
                        <ResponsiveSelect
                            value={watch("features.fuel") || ""}
                            onValueChange={(val) => setValue("features.fuel", val, { shouldValidate: true })}
                            options={[
                                { label: t('opt_gasoline'), value: "Gasoline" },
                                { label: t('opt_diesel'), value: "Diesel" },
                                { label: t('opt_electric'), value: "Electric" },
                                { label: t('opt_hybrid'), value: "Hybrid" },
                                { label: t('opt_lpg'), value: "LPG" },
                            ]}
                            placeholder={t('unspecified')}
                            label={t('lbl_fuel')}
                        />
                        {(errors as any).features?.fuel && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.fuel.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_caseType')} <span className="text-red-500">*</span></Label>
                        <ResponsiveSelect
                            value={watch("features.caseType") || ""}
                            onValueChange={(val) => setValue("features.caseType", val, { shouldValidate: true })}
                            options={[
                                { label: t('opt_sedan'), value: "Sedan" },
                                { label: t('opt_hatchback'), value: "Hatchback" },
                                { label: t('opt_station_wagon'), value: "Station Wagon" },
                                { label: t('opt_suv'), value: "SUV" },
                                { label: t('opt_coupe'), value: "Coupe" },
                                { label: t('opt_convertible'), value: "Convertible" },
                                { label: t('opt_minivan'), value: "Minivan" },
                                { label: t('opt_pickup'), value: "Pickup" },
                            ]}
                            placeholder={t('unspecified')}
                            label={t('lbl_caseType')}
                        />
                        {(errors as any).features?.caseType && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.caseType.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_color')} <span className="text-red-500">*</span></Label>
                        <Input {...register("features.color")} placeholder={t('lbl_color')} />
                        {(errors as any).features?.color && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.color.message)}</p>}
                    </div>
                </div>
            </div>

            {/* Technical & History */}
            <div className="border-t pt-6">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-4">{t('sec_tech')} <span className="text-xs font-normal text-muted-foreground ml-2">({t('unspecified')})</span></h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>{t('lbl_enginePower')}</Label>
                        <Input type="number" {...register("features.enginePower", { valueAsNumber: true })} min={0} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_engineDisplacement')}</Label>
                        <Input type="number" {...register("features.engineDisplacement", { valueAsNumber: true })} min={0} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_traction')}</Label>
                        <ResponsiveSelect
                            value={watch("features.drivetrain") || ""}
                            onValueChange={(val) => setValue("features.drivetrain", val, { shouldValidate: true })}
                            options={[
                                { label: t('opt_fwd'), value: "FWD" },
                                { label: t('opt_rwd'), value: "RWD" },
                                { label: t('opt_4wd'), value: "4WD" },
                                { label: t('opt_awd'), value: "AWD" },
                            ]}
                            placeholder={t('unspecified')}
                            label={t('lbl_traction')}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>{t('lbl_damage')}</Label>
                        <Input {...register("features.damageStatus")} placeholder={t('ph_damage')} />
                    </div>
                </div>
                <div className="mt-4 flex gap-6">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="warranty" {...register("features.warranty")} className="w-4 h-4" />
                        <Label htmlFor="warranty">{t('lbl_warranty')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="swap" {...register("features.swap")} className="w-4 h-4" />
                        <Label htmlFor="swap">{t('lbl_swap')}</Label>
                    </div>
                </div>
            </div>
        </div>
    );
}
