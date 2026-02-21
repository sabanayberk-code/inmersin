'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Check, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { CATEGORY_DATA } from '@/data/categories';
import { createBrandRequest, getApprovedBrands } from '@/actions/brandRequests';

interface CategorySelectorProps {
    onComplete: (selection: {
        category: string;
        subCategory: string;
        type: string;
        propertyType: string;
        brand?: string;
    }) => void;
}

export default function CategorySelector({ onComplete }: CategorySelectorProps) {
    const t = useTranslations('Form');

    const [selectedMain, setSelectedMain] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

    // Custom Brand State
    const [approvedBrandsList, setApprovedBrandsList] = useState<string[]>([]);
    const [isAddingCustomBrand, setIsAddingCustomBrand] = useState(false);
    const [customBrandName, setCustomBrandName] = useState('');
    const [isSubmittingCustomBrand, setIsSubmittingCustomBrand] = useState(false);

    // Current Step Tracking (1 = Main, 2 = Sub, 3 = Type, 4 = PropertyType, 5 = Brand, 6 = Confirm)
    const [step, setStep] = useState(1);

    // Derived lists based on selections
    const mainCategories = Object.keys(CATEGORY_DATA);
    const categories = selectedMain ? Object.keys(CATEGORY_DATA[selectedMain]?.subcategories || {}) : [];
    const types = (selectedMain && selectedCategory) ? Object.keys(CATEGORY_DATA[selectedMain].subcategories[selectedCategory]?.types || {}) : [];
    const propertyTypes = (selectedMain && selectedCategory && selectedType)
        ? CATEGORY_DATA[selectedMain].subcategories[selectedCategory].types[selectedType] || []
        : [];

    // Determine if Brand Selection is needed
    const needsBrandSelection = selectedMain === 'Yedek Parça' &&
        (selectedCategory === 'Otomotiv Ekipmanları' || selectedCategory === 'Motosiklet Ekipmanları') &&
        selectedPropertyType === 'Yedek Parça';

    const isVehicleBrandSelection = selectedMain === 'Vasıta' &&
        ['Otomobil', 'Arazi, SUV & Pickup', 'Motosiklet', 'Minivan & Panelvan', 'Ticari Araçlar'].includes(selectedCategory || '');

    // Get Brands if needed for Step 5
    const hardcodedBrands = needsBrandSelection ? (() => {
        if (selectedCategory === 'Otomotiv Ekipmanları') {
            return CATEGORY_DATA['Vasıta']?.subcategories['Otomobil']?.types['Satılık'] || [];
        } else if (selectedCategory === 'Motosiklet Ekipmanları') {
            return CATEGORY_DATA['Vasıta']?.subcategories['Motosiklet']?.types['Satılık'] || [];
        }
        return [];
    })() : [];

    // Fetch approved custom brands when needed
    useEffect(() => {
        if ((needsBrandSelection || isVehicleBrandSelection) && selectedCategory) {
            getApprovedBrands(selectedCategory).then(setApprovedBrandsList);
        }
    }, [needsBrandSelection, isVehicleBrandSelection, selectedCategory]);

    const combinedPropertyTypes = isVehicleBrandSelection
        ? [...propertyTypes, ...approvedBrandsList].sort((a, b) => a.localeCompare(b, 'tr'))
        : propertyTypes;

    const brands = [...hardcodedBrands, ...approvedBrandsList].sort((a, b) => a.localeCompare(b, 'tr'));

    const goBack = () => {
        if (step === 6) {
            setStep(needsBrandSelection ? 5 : 4);
        } else if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleMainSelect = (main: string) => {
        setSelectedMain(main);
        setSelectedCategory(null);
        setSelectedType(null);
        setSelectedPropertyType(null);
        setSelectedBrand(null);
        setStep(2);
    };

    const handleCategorySelect = (cat: string) => {
        setSelectedCategory(cat);
        setSelectedType(null);
        setSelectedPropertyType(null);
        setSelectedBrand(null);
        setStep(3);
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type);
        setSelectedPropertyType(null);
        setSelectedBrand(null);
        setStep(4);
    };

    const handlePropertyTypeSelect = (pType: string) => {
        setSelectedPropertyType(pType);
        setSelectedBrand(null);
        // If 'Yedek Parça' -> 'Yedek Parça', we need brand selection
        if (selectedMain === 'Yedek Parça' && pType === 'Yedek Parça') {
            setStep(5);
        } else {
            setStep(6);
        }
    };

    const handleCustomVehicleBrandSubmit = async () => {
        if (!customBrandName.trim() || !selectedCategory) return;
        setIsSubmittingCustomBrand(true);
        await createBrandRequest(customBrandName.trim(), selectedCategory);
        setSelectedPropertyType(customBrandName.trim());
        setIsSubmittingCustomBrand(false);
        setIsAddingCustomBrand(false);
        setCustomBrandName('');
        setStep(6);
    };

    const handleBrandSelect = (brand: string) => {
        setSelectedBrand(brand);
        setIsAddingCustomBrand(false);
        setCustomBrandName('');
        setStep(6);
    };

    const handleCustomBrandSubmit = async () => {
        if (!customBrandName.trim() || !selectedCategory) return;
        setIsSubmittingCustomBrand(true);
        // Fire & Forget or wait for it to save request
        await createBrandRequest(customBrandName.trim(), selectedCategory);
        setSelectedBrand(customBrandName.trim());
        setIsSubmittingCustomBrand(false);
        setIsAddingCustomBrand(false);
        setStep(6);
    };

    const handleContinue = () => {
        onComplete({
            category: selectedMain!,
            subCategory: selectedCategory!,
            type: selectedType!,
            propertyType: selectedPropertyType!,
            brand: selectedBrand || undefined
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow border overflow-hidden transition-all">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-900 border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {step > 1 && (
                        <button
                            onClick={goBack}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                            title="Geri Dön"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Kategori Seçimi</h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Adım {step} / {needsBrandSelection ? 6 : 5}</p>
                    </div>
                </div>
            </div>

            {/* Breadcrumb Indicator */}
            <div className="px-5 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-b text-[13px] text-blue-700 dark:text-blue-300 flex items-center gap-1.5 flex-wrap min-h-[44px]">
                {selectedMain && <span className="font-semibold">{selectedMain}</span>}
                {selectedCategory && <><ChevronRight className="w-3.5 h-3.5 opacity-50" /> <span className="font-semibold">{selectedCategory}</span></>}
                {selectedType && <><ChevronRight className="w-3.5 h-3.5 opacity-50" /> <span className="font-semibold">{selectedType}</span></>}
                {selectedPropertyType && <><ChevronRight className="w-3.5 h-3.5 opacity-50" /> <span className="font-semibold">{selectedPropertyType}</span></>}
                {selectedBrand && <><ChevronRight className="w-3.5 h-3.5 opacity-50" /> <span className="font-semibold">{selectedBrand}</span></>}
                {step === 1 && <span className="text-gray-500 italic">Ana kategori seçiniz...</span>}
            </div>

            {/* Display Area */}
            <div className="p-2 h-[400px] overflow-y-auto custom-scrollbar relative bg-white dark:bg-gray-800">

                {/* Step 1: Main Category */}
                {step === 1 && (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-1 p-2">
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 ml-2">Ana Kategori</div>
                        {mainCategories.map(main => (
                            <button
                                key={main}
                                onClick={() => handleMainSelect(main)}
                                className="w-full text-left px-4 py-3.5 rounded-lg flex justify-between items-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium group"
                            >
                                <span>{main}</span>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 2: Sub Category */}
                {step === 2 && (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-1 p-2">
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 ml-2">Alt Kategori</div>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategorySelect(cat)}
                                className="w-full text-left px-4 py-3.5 rounded-lg flex justify-between items-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium group"
                            >
                                <span>{cat}</span>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 3: Type */}
                {step === 3 && (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-1 p-2">
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 ml-2">İlan Tipi</div>
                        {types.map(type => (
                            <button
                                key={type}
                                onClick={() => handleTypeSelect(type)}
                                className="w-full text-left px-4 py-3.5 rounded-lg flex justify-between items-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium group"
                            >
                                <span>{type}</span>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 4: Property Type */}
                {step === 4 && (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-1 p-2">
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 ml-2">{isVehicleBrandSelection ? "Marka Seçimi" : "Detay Tipi"}</div>

                        {!isAddingCustomBrand ? (
                            <>
                                {combinedPropertyTypes.map((pType: string) => (
                                    <button
                                        key={pType}
                                        onClick={() => handlePropertyTypeSelect(pType)}
                                        className="w-full text-left px-4 py-3.5 rounded-lg flex justify-between items-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium group"
                                    >
                                        <span>{pType}</span>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                ))}

                                {isVehicleBrandSelection && (
                                    <button
                                        onClick={() => setIsAddingCustomBrand(true)}
                                        className="w-full text-left px-4 py-3.5 mt-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex justify-center items-center gap-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Marka Bulamadım / Ekle</span>
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Marka Adını Giriniz
                                </label>
                                <input
                                    type="text"
                                    value={customBrandName}
                                    onChange={(e) => setCustomBrandName(e.target.value)}
                                    placeholder="Örn: Tesla"
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsAddingCustomBrand(false)}
                                        disabled={isSubmittingCustomBrand}
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleCustomVehicleBrandSubmit}
                                        disabled={!customBrandName.trim() || isSubmittingCustomBrand}
                                    >
                                        {isSubmittingCustomBrand ? 'Ekleniyor...' : 'Onayla'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 5: Brand Selection (If applicable) */}
                {step === 5 && needsBrandSelection && (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-1 p-2">
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 ml-2">Marka Seçimi</div>

                        {!isAddingCustomBrand ? (
                            <>
                                {brands.map((brand: string) => (
                                    <button
                                        key={brand}
                                        onClick={() => handleBrandSelect(brand)}
                                        className="w-full text-left px-4 py-3.5 rounded-lg flex justify-between items-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium group"
                                    >
                                        <span>{brand}</span>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                ))}
                                <button
                                    onClick={() => setIsAddingCustomBrand(true)}
                                    className="w-full text-left px-4 py-3.5 mt-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex justify-center items-center gap-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Marka Bulamadım / Ekle</span>
                                </button>
                            </>
                        ) : (
                            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Marka Adını Giriniz
                                </label>
                                <input
                                    type="text"
                                    value={customBrandName}
                                    onChange={(e) => setCustomBrandName(e.target.value)}
                                    placeholder="Örn: Tesla"
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsAddingCustomBrand(false)}
                                        disabled={isSubmittingCustomBrand}
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleCustomBrandSubmit}
                                        disabled={!customBrandName.trim() || isSubmittingCustomBrand}
                                    >
                                        {isSubmittingCustomBrand ? 'Ekleniyor...' : 'Onayla'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 6: Confirmation */}
                {step === 6 && (
                    <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-50 fade-in duration-500">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Seçim Tamamlandı</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-[250px] mb-8">
                            İlan detaylarını girmek için devam edebilirsiniz.
                        </p>
                        <Button
                            onClick={handleContinue}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all w-[200px]"
                        >
                            Devam Et
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
