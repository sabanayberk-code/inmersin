'use client';

import ListingForm from "@/components/ListingForm";
import CategorySelector from "@/components/CategorySelector";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function NewListingClient() {
    const t = useTranslations('Form');
    const [selection, setSelection] = useState<{
        category: string;
        subCategory?: string;
        mainCategory?: string;
        type: string;
        propertyType: string;
        brand?: string;
    } | null>(null);

    const handleCategoryComplete = (data: {
        category: string; // This is Main Category ("Vasıta") from CategorySelector logic updates
        subCategory: string; // "Otomobil"
        type: string;
        propertyType: string;
        brand?: string;
    }) => {
        setSelection({
            ...data,
            mainCategory: data.category, // Map 'category' (Main) to 'mainCategory' for ListingForm
            category: data.subCategory || data.category, // Pass specific category like 'Konut' instead of 'Emlak'
            brand: data.brand
        });
    };

    return (
        <div className="container mx-auto py-10 px-4">


            {!selection ? (
                <CategorySelector onComplete={handleCategoryComplete} />
            ) : (
                <ListingForm initialData={selection} />
            )}
        </div>
    );
}
