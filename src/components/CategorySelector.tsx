'use client';

import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

// Define the hierarchy structure
// Using local object for now, can be moved to a config file/db later
import { CATEGORY_DATA } from '@/data/categories';


interface CategorySelectorProps {
    onComplete: (selection: {
        category: string; // "Vasıta" or "Emlak" (Main Category)
        subCategory: string; // "Otomobil" or "Konut"
        type: string; // "Satılık"
        propertyType: string // "BMW" or "Daire"
    }) => void;
}

export default function CategorySelector({ onComplete }: CategorySelectorProps) {
    const t = useTranslations('Form'); // Or a new 'Categories' namespace if preferred

    const [selectedMain, setSelectedMain] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);

    // Get lists based on selection
    const mainCategories = Object.keys(CATEGORY_DATA);
    const categories = selectedMain ? Object.keys(CATEGORY_DATA[selectedMain]?.subcategories || {}) : [];
    const types = (selectedMain && selectedCategory) ? Object.keys(CATEGORY_DATA[selectedMain].subcategories[selectedCategory]?.types || {}) : [];
    const propertyTypes = (selectedMain && selectedCategory && selectedType)
        ? CATEGORY_DATA[selectedMain].subcategories[selectedCategory].types[selectedType] || []
        : [];

    const handleMainSelect = (main: string) => {
        setSelectedMain(main);
        setSelectedCategory(null);
        setSelectedType(null);
        setSelectedPropertyType(null);
    }

    const handleCategorySelect = (cat: string) => {
        setSelectedCategory(cat);
        setSelectedType(null);
        setSelectedPropertyType(null);
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type);
        setSelectedPropertyType(null);
    };

    const handlePropertyTypeSelect = (pType: string) => {
        setSelectedPropertyType(pType);
    };

    const handleContinue = () => {
        if (selectedMain && selectedCategory && selectedType && selectedPropertyType) {
            onComplete({
                category: selectedMain,
                subCategory: selectedCategory,
                type: selectedType,
                propertyType: selectedPropertyType
            });
        }
    };

    // Modified onComplete to include main category for clarity
    // But we must stick to the interface or update it.
    // Let's update the interface to be safe.

    return (
        <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Adım Adım Kategori Seç</h2>

            {/* Breadcrumb */}
            <div className="text-sm text-blue-600 mb-4 flex items-center gap-1 min-h-[20px]">
                {selectedMain && <span>{selectedMain}</span>}
                {selectedCategory && <><ChevronRight className="w-4 h-4" /> <span>{selectedCategory}</span></>}
                {selectedType && <><ChevronRight className="w-4 h-4" /> <span>{selectedType}</span></>}
                {selectedPropertyType && <><ChevronRight className="w-4 h-4" /> <span>{selectedPropertyType}</span></>}
            </div>

            <div className="flex flex-col lg:flex-row gap-2 h-[500px] pb-2">

                {/* Step 0: Main Category */}
                <div className="flex-1 min-w-0 flex flex-col border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 font-semibold text-sm border-b">Ana Kategori</div>
                    <div className="overflow-y-auto p-1 space-y-0.5 custom-scrollbar flex-1">
                        {mainCategories.map(main => (
                            <button
                                key={main}
                                onClick={() => handleMainSelect(main)}
                                className={`w-full text-left px-3 py-2 text-sm rounded flex justify-between items-center transition-colors 
                                    ${selectedMain === main
                                        ? 'bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-200'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                            >
                                <span className="truncate">{main}</span>
                                {selectedMain === main && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 1: Category (Sub) */}
                <div className={`flex-1 min-w-0 flex flex-col border rounded-lg overflow-hidden bg-white dark:bg-gray-900 transition-opacity duration-300 ${!selectedMain ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 font-semibold text-sm border-b">Alt Kategori</div>
                    <div className="overflow-y-auto p-1 space-y-0.5 custom-scrollbar flex-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategorySelect(cat)}
                                className={`w-full text-left px-3 py-2 text-sm rounded flex justify-between items-center transition-colors 
                                    ${selectedCategory === cat
                                        ? 'bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-200'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                            >
                                <span className="truncate">{cat}</span>
                                {selectedCategory === cat && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Type (Sale/Rent) */}
                <div className={`flex-1 min-w-0 flex flex-col border rounded-lg overflow-hidden bg-white dark:bg-gray-900 transition-opacity duration-300 ${!selectedCategory ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 font-semibold text-sm border-b">İlan Tipi</div>
                    <div className="overflow-y-auto p-1 space-y-0.5 custom-scrollbar flex-1">
                        {types.map(type => (
                            <button
                                key={type}
                                onClick={() => handleTypeSelect(type)}
                                className={`w-full text-left px-3 py-2 text-sm rounded flex justify-between items-center transition-colors 
                                    ${selectedType === type
                                        ? 'bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-200'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                            >
                                <span className="truncate">{type}</span>
                                {selectedType === type && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 3: Property Type */}
                <div className={`flex-1 min-w-0 flex flex-col border rounded-lg overflow-hidden bg-white dark:bg-gray-900 transition-opacity duration-300 ${!selectedType ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 font-semibold text-sm border-b">Detay Tipi</div>
                    <div className="overflow-y-auto p-1 space-y-0.5 custom-scrollbar flex-1">
                        {propertyTypes.map((pType: string) => (
                            <button
                                key={pType}
                                onClick={() => handlePropertyTypeSelect(pType)}
                                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors 
                                    ${selectedPropertyType === pType
                                        ? 'bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-200'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                            >
                                <span className="truncate">{pType}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 4: Confirmation */}
                <div className={`flex-1 min-w-0 flex flex-col items-center justify-center border rounded-lg bg-white dark:bg-gray-900 transition-opacity duration-300 ${!selectedPropertyType ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    {selectedPropertyType ? (
                        <div className="text-center p-4 space-y-3 animate-in zoom-in-50 duration-300">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                <Check className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Seçim Tamamlandı</h3>
                            </div>
                            <Button
                                onClick={() => onComplete({
                                    category: selectedMain!,
                                    subCategory: selectedCategory!,
                                    type: selectedType!,
                                    propertyType: selectedPropertyType!
                                })}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
                            >
                                Devam Et
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 p-4">
                            <div className="w-10 h-10 border-2 border-dashed border-gray-200 rounded-full mx-auto mb-2"></div>
                            <p className="text-xs">Seçim yapınız</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
