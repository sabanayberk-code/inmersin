'use client';

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export default function RealEstateFields() {
    const { register, formState: { errors } } = useFormContext();
    const t = useTranslations('Form');
    const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    // Helper to translate errors safely
    const tError = (msg?: string) => {
        if (!msg) return null;
        if (msg.includes("Invalid input") || msg.includes("expected number") || msg.includes("NaN")) return t('err_number');
        if (msg.includes("Too small") || msg.includes("expected number to be >=")) return t('err_min_value');
        if (msg.startsWith("err_")) return t(msg);
        return t(msg);
    };

    return (
        <div className="space-y-6">
            {/* Property Details */}
            <div className="border-t pt-6">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-4">{t('sec_details')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="space-y-2">
                        <Label>{t('grossArea')} <span className="text-red-500">*</span></Label>
                        <Input type="number" {...register("features.area", { valueAsNumber: true })} min={0} />
                        {(errors as any).features?.area && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.area.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('netArea')} <span className="text-red-500">*</span></Label>
                        <Input type="number" {...register("features.netArea", { valueAsNumber: true })} min={0} />
                        {(errors as any).features?.netArea && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.netArea.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('rooms')} <span className="text-red-500">*</span></Label>
                        <Input type="text" {...register("features.bedrooms")} placeholder={t('ph_rooms')} />
                        {(errors as any).features?.bedrooms && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.bedrooms.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('bathrooms')} <span className="text-red-500">*</span></Label>
                        <Input type="number" {...register("features.bathrooms", { valueAsNumber: true })} min={0} />
                        {(errors as any).features?.bathrooms && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.bathrooms.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('wc')}</Label>
                        <Input type="number" {...register("features.wc", { valueAsNumber: true })} min={0} />
                        {(errors as any).features?.wc && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.wc.message)}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('buildingAge')} <span className="text-red-500">*</span></Label>
                        <select {...register("features.buildingAge")} className={inputClass}>
                            <option value="">{t('opt_select')}</option>
                            <option value="0">0 ({t('opt_new') || "New"})</option>
                            <option value="1-5">1-5</option>
                            <option value="5-10">5-10</option>
                            <option value="11-20">11-20</option>
                            <option value="21+">21+</option>
                        </select>
                        {(errors as any).features?.buildingAge && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.buildingAge.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('floorLocation')} <span className="text-red-500">*</span></Label>
                        <Input type="number" {...register("features.floorNumber", { valueAsNumber: true })} />
                        {(errors as any).features?.floorNumber && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.floorNumber.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('totalFloors')} <span className="text-red-500">*</span></Label>
                        <Input type="number" {...register("features.totalFloors", { valueAsNumber: true })} />
                        {(errors as any).features?.totalFloors && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.totalFloors.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('heating')} <span className="text-red-500">*</span></Label>
                        <select {...register("features.heating")} className={inputClass}>
                            <option value="">{t('opt_select')}</option>
                            <option value="None">{t('opt_none')}</option>
                            <option value="AC">{t('opt_ac')}</option>
                            <option value="Gas">{t('opt_gas')}</option>
                            <option value="Solar">{t('opt_solar')}</option>
                            <option value="Underfloor">{t('opt_underfloor')}</option>
                            <option value="VRV">{t('opt_vrv')}</option>
                        </select>
                        {(errors as any).features?.heating && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.heating.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('kitchen')} <span className="text-red-500">*</span></Label>
                        <select {...register("features.kitchen")} className={inputClass}>
                            <option value="">{t('opt_select')}</option>
                            <option value="Open">{t('opt_open_kitchen')}</option>
                            <option value="Closed">{t('opt_closed_kitchen')}</option>
                        </select>
                        {(errors as any).features?.kitchen && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.kitchen.message)}</p>}
                    </div>
                </div>
            </div>

            {/* Complex & Usage */}
            <div className="border-t pt-6">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-4">{t('sec_complex')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <Label>{t('usageStatus')} <span className="text-red-500">*</span></Label>
                        <select {...register("features.usageStatus")} className={inputClass}>
                            <option value="">{t('opt_select')}</option>
                            <option value="Empty">{t('opt_empty')}</option>
                            <option value="Occupied">{t('opt_occupied')}</option>
                            <option value="Owner">{t('opt_owner')}</option>
                        </select>
                        {(errors as any).features?.usageStatus && <p className="text-red-500 text-xs mt-1">{tError((errors as any).features.usageStatus.message)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('furnished')}</Label>
                        <select {...register("features.furnished", { setValueAs: (v: string) => v === "true" })} className={inputClass}>
                            <option value="false">{t('no')}</option>
                            <option value="true">{t('yes')}</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('inComplex')}</Label>
                        <select {...register("features.inComplex", { setValueAs: (v: string) => v === "true" })} className={inputClass}>
                            <option value="false">{t('no')}</option>
                            <option value="true">{t('yes')}</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('complexName')}</Label>
                        <Input {...register("features.complexName")} placeholder={t('ph_complex_name')} />
                    </div>
                </div>
            </div>

            {/* Amenities Checkboxes */}
            <div className="border-t pt-6">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-4">{t('sec_amenities')}</h3>
                <div className="flex gap-6 flex-wrap">
                    {[
                        { key: "hasPool", label: t('pool') },
                        { key: "hasGarden", label: t('garden') },
                        { key: "hasGarage", label: t('garage') },
                        { key: "balcony", label: t('balcony') },
                        { key: "elevator", label: t('elevator') },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center space-x-2 border p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <input
                                type="checkbox"
                                id={item.key}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                {...register(`features.${item.key}` as any)}
                            />
                            <Label htmlFor={item.key} className="cursor-pointer font-normal">{item.label}</Label>
                        </div>
                    ))}

                    <div className="flex items-center space-x-2 ml-4">
                        <Label className="mr-2">{t('parking')}:</Label>
                        <select {...register("features.parking")} className={`${inputClass} w-32`}>
                            <option value="Open">{t('opt_parking_open')}</option>
                            <option value="Closed">{t('opt_parking_closed')}</option>
                            <option value="None">{t('opt_parking_none')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Financials (Dues/Deposit) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div className="space-y-2">
                    <Label>{t('dues')}</Label>
                    <Input type="number" {...register("features.dues", { valueAsNumber: true })} />
                    {(errors as any).features?.dues && <p className="text-red-500 text-xs mt-1">{t((errors as any).features.dues.message)}</p>}
                </div>
                <div className="space-y-2">
                    <Label>{t('deposit')}</Label>
                    <Input type="number" {...register("features.deposit", { valueAsNumber: true })} />
                    {(errors as any).features?.deposit && <p className="text-red-500 text-xs mt-1">{t((errors as any).features.deposit.message)}</p>}
                </div>
            </div>
        </div>
    );
}
