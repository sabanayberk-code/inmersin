'use client';

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export default function VehicleFields() {
    const { register, formState: { errors } } = useFormContext();
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <Label>{t('lbl_brand')} <span className="text-red-500">*</span></Label>
                        <Input {...register("features.propertyType")} placeholder={t('ph_brand')} />
                        {(errors as any).features?.propertyType && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.propertyType.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_model')} <span className="text-red-500">*</span></Label>
                        <Input {...register("features.model")} placeholder={t('ph_model')} />
                        {(errors as any).features?.model && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.model.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_year')} <span className="text-red-500">*</span></Label>
                        <Input type="number" {...register("features.year", { valueAsNumber: true })} placeholder={t('ph_year')} />
                        {(errors as any).features?.year && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.year.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_km')} <span className="text-red-500">*</span></Label>
                        <Input type="number" {...register("features.km", { valueAsNumber: true })} placeholder={t('ph_km')} />
                        {(errors as any).features?.km && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.km.message)}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('lbl_gear')} <span className="text-red-500">*</span></Label>
                        <select {...register("features.gear")} className={inputClass}>
                            <option value="">{t('unspecified')}</option>
                            <option value="Automatic">{t('opt_automatic')}</option>
                            <option value="Manual">{t('opt_manual')}</option>
                            <option value="Semi-Automatic">{t('opt_semi_automatic')}</option>
                        </select>
                        {(errors as any).features?.gear && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.gear.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_fuel')} <span className="text-red-500">*</span></Label>
                        <select {...register("features.fuel")} className={inputClass}>
                            <option value="">{t('unspecified')}</option>
                            <option value="Gasoline">{t('opt_gasoline')}</option>
                            <option value="Diesel">{t('opt_diesel')}</option>
                            <option value="Electric">{t('opt_electric')}</option>
                            <option value="Hybrid">{t('opt_hybrid')}</option>
                            <option value="LPG">{t('opt_lpg')}</option>
                        </select>
                        {(errors as any).features?.fuel && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.fuel.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_caseType')} <span className="text-red-500">*</span></Label>
                        <select {...register("features.caseType")} className={inputClass}>
                            <option value="">{t('unspecified')}</option>
                            <option value="Sedan">{t('opt_sedan')}</option>
                            <option value="Hatchback">{t('opt_hatchback')}</option>
                            <option value="Station Wagon">{t('opt_station_wagon')}</option>
                            <option value="SUV">{t('opt_suv')}</option>
                            <option value="Coupe">{t('opt_coupe')}</option>
                            <option value="Convertible">{t('opt_convertible')}</option>
                            <option value="Minivan">{t('opt_minivan')}</option>
                            <option value="Pickup">{t('opt_pickup')}</option>
                        </select>
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
                        <Input type="number" {...register("features.enginePower", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_engineDisplacement')}</Label>
                        <Input type="number" {...register("features.engineDisplacement", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('lbl_traction')}</Label>
                        <select {...register("features.drivetrain")} className={inputClass}>
                            <option value="">{t('unspecified')}</option>
                            <option value="FWD">{t('opt_fwd')}</option>
                            <option value="RWD">{t('opt_rwd')}</option>
                            <option value="4WD">{t('opt_4wd')}</option>
                            <option value="AWD">{t('opt_awd')}</option>
                        </select>
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
