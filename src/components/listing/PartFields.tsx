import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export default function PartFields({ isEditMode }: { isEditMode?: boolean }) {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const t = useTranslations('Form');

    return (
        <div className="border-t pt-6">
            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-4">
                {t('sec_part_details')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Condition */}
                <div className="space-y-2">
                    <Label>{t('lbl_condition')}</Label>
                    <Select onValueChange={(val) => setValue("features.condition", val)} defaultValue={watch("features.condition")}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('unspecified')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="New">{t('opt_new')}</SelectItem>
                            <SelectItem value="Used">{t('opt_used')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <input type="hidden" {...register("features.condition")} />
                </div>

                {/* Brand */}
                <div className="space-y-2">
                    <Label>{t('lbl_brand')}</Label>
                    <Input
                        {...register("features.brand")}
                        placeholder="e.g. Bosch, Valeo, OEM"
                        readOnly={true}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none"
                    />
                </div>

                {/* OEM No */}
                <div className="space-y-2">
                    <Label>{t('lbl_oem')}</Label>
                    <Input {...register("features.oemNo")} placeholder="Part Number" />
                </div>

                {/* Category (Manual for now) */}
                <div className="space-y-2">
                    <Label>{t('lbl_part_category')}</Label>
                    <Input {...register("features.category")} placeholder="e.g. Engine, Transmission, Lighting" />
                </div>

                {/* Compatibility */}
                <div className="space-y-2 md:col-span-2">
                    <Label>{t('lbl_compatibility')}</Label>
                    <Input {...register("features.compatibility")} placeholder="e.g. BMW 3 Series F30, 2012-2018" />
                    <p className="text-xs text-gray-500">{t('ph_compatibility')}</p>
                </div>

            </div>
        </div>
    );
}
