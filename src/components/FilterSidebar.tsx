'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CategoryCounts } from '@/actions/getListings';
import { useTranslations } from 'next-intl';
import { CATEGORY_DATA } from '@/data/categories';
import { CITIES } from '@/data/locations';

interface FilterSidebarProps {
    counts?: CategoryCounts;
}

export default function FilterSidebar({ counts }: FilterSidebarProps) {
    const t = useTranslations('Filters');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Configuration for different types
    const REAL_ESTATE_FILTERS = [
        { id: 'bedrooms', title: t('sec_bedrooms'), options: ['Stüdyo (1+0)', '1+1', '1.5+1', '2+0', '2+1', '2.5+1', '3+1', '3.5+1', '4+1', '4.5+1', '5+1'] },
        { id: 'buildingAge', title: t('sec_buildingAge'), options: ['0 (Yeni)', '1', '2', '3', '4', '5-10 arası', '11-15 arası', '16-20 arası', '21 ve üzeri'] },
        { id: 'floor', title: t('sec_floor'), options: ['Kot 1', 'Kot 2', 'Kot 3', 'Zemin Kat', 'Bahçe Katı', 'Giriş Katı', 'Yüksek Giriş', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21 ve üzeri'] },
        { id: 'heating', title: t('sec_heating'), options: ['Yok', 'Soba', 'Doğalgaz Soba', 'Kat Kaloriferi', 'Merkezi', 'Kombi (Doğalgaz)', 'Klima', 'Yerden Isıtma'] },
        { id: 'furnished', title: t('sec_furnished'), options: ['Evet', 'Hayır', 'Kısmen'] },
        { id: 'site', title: t('sec_site'), options: ['Evet', 'Hayır'] },
    ];

    const VEHICLE_FILTERS = [
        { id: 'fuel', title: t('sec_fuel'), options: ['Gasoline', 'Diesel', 'LPG', 'Electric', 'Hybrid'] },
        { id: 'gear', title: t('sec_gear'), options: ['Manual', 'Automatic', 'Semi-Automatic'] },
        { id: 'color', title: t('sec_color'), options: ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue'] },
        { id: 'caseType', title: t('sec_caseType'), options: ['Sedan', 'Hatchback', 'SUV', 'Coupe', 'Cabrio', 'Station Wagon'] },
        { id: 'warranty', title: t('sec_warranty'), options: ['Evet', 'Hayır'] },
    ];

    const PART_FILTERS: { id: string, title: string, options: string[] }[] = [
        // { id: 'condition', title: t('sec_condition'), options: ['New', 'Used'] },
    ];

    // Dynamic Part Subcategories
    const partSubcategories = Object.keys(CATEGORY_DATA['Yedek Parça']?.subcategories || {}).map(sub => ({
        name: sub,
        value: sub, // Value is the category name itself for parts
        count: counts?.part.subcategories[sub] || 0
    }));

    const categoriesData = [
        {
            name: t('cat_residential'),
            count: counts?.konut.total || 0,
            type: 'real_estate',
            queryCategory: 'Konut',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.konut.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.konut.rent || 0 },
            ]
        },
        {
            name: t('cat_commercial'),
            count: counts?.workplace.total || 0,
            type: 'real_estate',
            queryCategory: 'İş Yeri',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.workplace.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.workplace.rent || 0 },
            ]
        },
        {
            name: t('cat_land'),
            count: counts?.land.total || 0,
            type: 'real_estate',
            queryCategory: 'Arsa',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.land.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.land.rent || 0 },
            ]
        },
        {
            name: t('cat_automobile'),
            count: counts?.vasita?.automobile.total || 0,
            type: 'vehicle',
            queryCategory: 'Otomobil',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.vasita?.automobile.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.vasita?.automobile.rent || 0 }
            ]
        },
        {
            name: t('cat_suv'),
            count: counts?.vasita?.suv.total || 0,
            type: 'vehicle',
            queryCategory: 'Arazi, SUV & Pickup',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.vasita?.suv.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.vasita?.suv.rent || 0 }
            ]
        },
        {
            name: t('cat_motorcycle'),
            count: counts?.vasita?.motorcycle.total || 0,
            type: 'vehicle',
            queryCategory: 'Motosiklet',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.vasita?.motorcycle.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.vasita?.motorcycle.rent || 0 }
            ]
        },
        {
            name: t('cat_electric'),
            count: counts?.vasita?.electric.total || 0,
            type: 'vehicle',
            queryCategory: 'Elektrikli Araçlar',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.vasita?.electric.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.vasita?.electric.rent || 0 }
            ]
        },
        {
            name: t('cat_minivan'),
            count: counts?.vasita?.minivan.total || 0,
            type: 'vehicle',
            queryCategory: 'Minivan & Panelvan',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.vasita?.minivan.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.vasita?.minivan.rent || 0 }
            ]
        },
        {
            name: t('cat_commercial_vehicle'),
            count: counts?.vasita?.commercial.total || 0,
            type: 'vehicle',
            queryCategory: 'Ticari Araçlar',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.vasita?.commercial.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.vasita?.commercial.rent || 0 }
            ]
        },
        {
            name: t('cat_damaged'),
            count: counts?.vasita?.damaged.total || 0,
            type: 'vehicle',
            queryCategory: 'Hasarlı Araçlar',
            subcategories: [
                { name: t('cat_sale'), value: 'Sale', count: counts?.vasita?.damaged.sale || 0 },
                { name: t('cat_rent'), value: 'Rent', count: counts?.vasita?.damaged.rent || 0 }
            ]
        },
        {
            name: t('cat_part'),
            count: counts?.part?.total || 0,
            type: 'part',
            queryCategory: 'Yedek Parça',
            subcategories: partSubcategories.map(s => ({
                name: s.name,
                value: s.value,
                count: s.count
            }))
        }
    ];

    // Determine current state from URL
    const currentCity = searchParams.get('city') || t('lbl_city');
    const currentMinPrice = searchParams.get('minPrice') || '';
    const currentMaxPrice = searchParams.get('maxPrice') || '';
    const currentCurrency = searchParams.get('currency') || 'TRY';
    const currentListingType = searchParams.get('listingType');
    const currentType = searchParams.get('type');
    const currentCategory = searchParams.get('category');

    // Filters to display based on type
    const activeFilters = currentType === 'vehicle' ? VEHICLE_FILTERS
        : currentType === 'part' ? PART_FILTERS
            : currentType === 'real_estate' ? REAL_ESTATE_FILTERS
                : []; // No filters if no type selected

    // Vehicle Specific Inputs
    const currentMinYear = searchParams.get('minYear') || '';
    const currentMaxYear = searchParams.get('maxYear') || '';
    const currentMinKm = searchParams.get('minKm') || '';
    const currentMaxKm = searchParams.get('maxKm') || '';

    // Part Specific Inputs (Brand)
    const currentBrand = searchParams.get('brand') || '';

    const [expandedCategory, setExpandedCategory] = useState<string | null>(t('cat_residential'));
    const [currency, setCurrency] = useState(currentCurrency);

    // Dynamic open state for sections
    const initialOpenSections = activeFilters.reduce((acc, curr) => ({ ...acc, [curr.id]: false }), {} as Record<string, boolean>);
    // initialOpenSections['bedrooms'] = true; // No longer safe to assume 'bedrooms' exists
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialOpenSections);

    const currentDistrict = searchParams.get('district') || '';
    const currentNeighborhood = searchParams.get('neighborhood') || '';

    // Inputs
    const [minPrice, setMinPrice] = useState(currentMinPrice);
    const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
    const [city, setCity] = useState(currentCity);
    const [district, setDistrict] = useState(currentDistrict);
    const [neighborhood, setNeighborhood] = useState(currentNeighborhood);

    // Vehicle Inputs
    const [minYear, setMinYear] = useState(currentMinYear);
    const [maxYear, setMaxYear] = useState(currentMaxYear);
    const [minKm, setMinKm] = useState(currentMinKm);
    const [maxKm, setMaxKm] = useState(currentMaxKm);

    // Part Inputs
    const [brand, setBrand] = useState(currentBrand);

    // Dynamic Filter State
    const [filters, setFilters] = useState<Record<string, string[]>>({});

    useEffect(() => {
        setCurrency(searchParams.get('currency') || 'TRY');
        setCity(searchParams.get('city') || t('lbl_city'));
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');

        // Vehicle
        setMinYear(searchParams.get('minYear') || '');
        setMaxYear(searchParams.get('maxYear') || '');
        setMinKm(searchParams.get('minKm') || '');
        setMaxKm(searchParams.get('maxKm') || '');

        // Part
        setBrand(searchParams.get('brand') || '');

        // Load all array filters from URL
        const newFilters: Record<string, string[]> = {};
        activeFilters.forEach(section => {
            const values = searchParams.getAll(section.id);
            if (values.length > 0) {
                newFilters[section.id] = values;
            }
        });
        setFilters(newFilters);
    }, [searchParams, currentType]); // Re-run when type changes

    const updateURL = (newParams: Record<string, string | string[] | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === '' || (Array.isArray(value) && value.length === 0) || value === t('lbl_city')) {
                params.delete(key);
            } else if (Array.isArray(value)) {
                params.delete(key);
                value.forEach(v => params.append(key, v));
            } else {
                params.set(key, value);
            }
        });

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const currentPropertyType = searchParams.get('propertyType');

    const handleCategoryClick = (type: string, listingType: string, category?: string, propertyType?: string) => {
        const params = new URLSearchParams(searchParams.toString());

        // Always ensure type is set properly
        params.set('type', type);

        // Toggle Logic for Category (Level 1)
        if (category && category === currentCategory && !listingType && !propertyType) {
            params.delete('category');
            params.delete('listingType');
            params.delete('propertyType');
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
            return;
        }

        // Toggle Logic for Listing Type (Level 2 - Sale/Rent)
        if (listingType && listingType === currentListingType && !propertyType) {
            params.delete('listingType');
            params.delete('propertyType');
            if (category) params.set('category', category);
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
            return;
        }

        if (category) params.set('category', category); else params.delete('category');
        if (listingType) params.set('listingType', listingType); else params.delete('listingType');
        if (propertyType) params.set('propertyType', propertyType); else params.delete('propertyType');

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Scroll to active category on mount/update
    useEffect(() => {
        if (currentCategory) {
            // Small timeout to ensure DOM is rendered with expansion
            setTimeout(() => {
                const el = document.getElementById(`cat-${currentCategory}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [currentCategory]);

    // Location State Helpers
    const handleLocationChange = (field: 'city' | 'district' | 'neighborhood', value: string) => {
        if (field === 'city') {
            setCity(value);
            setDistrict(''); // Reset district when city changes
            updateURL({ city: value, district: '' });
        } else if (field === 'district') {
            setDistrict(value);
            updateURL({ district: value });
        } else {
            setNeighborhood(value);
            updateURL({ neighborhood: value });
        }
    };

    // Derived state for districts
    const districts = city && CITIES[city] ? CITIES[city] : [];

    // Generic Handler for all Checkbox Lists
    const handleFilterToggle = (sectionId: string, option: string) => {
        const currentSelected = filters[sectionId] || [];
        const newSelected = currentSelected.includes(option)
            ? currentSelected.filter(item => item !== option)
            : [...currentSelected, option];

        const updatedFilters = { ...filters, [sectionId]: newSelected };
        setFilters(updatedFilters);
        updateURL({ [sectionId]: newSelected });
    };

    const handleSearch = () => {
        const payload: any = {
            minPrice: minPrice,
            maxPrice: maxPrice,
            currency: currency,
            city: city !== t('lbl_city') ? city : null,
            district: district,
            neighborhood: neighborhood,
        };

        if (currentType === 'vehicle') {
            payload.minYear = minYear;
            payload.maxYear = maxYear;
            payload.minKm = minKm;
            payload.maxKm = maxKm;
        }

        if (currentType === 'part') {
            payload.brand = brand;
        }

        // Preserve Property Type if exists (for Real Estate or Vehicle)
        if (currentPropertyType) {
            payload.propertyType = currentPropertyType;
        }

        // Preserve Category if exists
        if (currentCategory) {
            payload.category = currentCategory;
        }

        // Preserve Listing Type if exists
        if (currentListingType) {
            payload.listingType = currentListingType;
        }

        // Preserve Type
        if (currentType) {
            payload.type = currentType;
        }

        updateURL(payload);
    };

    const toggleSection = (sectionId: string) => {
        setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const isVehicleCurrent = currentType === 'vehicle';
    const isPartCurrent = currentType === 'part';

    const MAIN_CAT_MAP: Record<string, string> = {
        'real_estate': 'Emlak',
        'vehicle': 'Vasıta',
        'part': 'Yedek Parça'
    };

    const getTypeKey = (val: string) => val === 'Sale' ? 'Satılık' : val === 'Rent' ? 'Kiralık' : val;

    const getSubTypes = (type: string, queryCategory: string, subValue: string) => {
        const mainCat = MAIN_CAT_MAP[type];
        const typeKey = getTypeKey(subValue);
        return CATEGORY_DATA[mainCat]?.subcategories[queryCategory]?.types[typeKey] || [];
    };

    const getCount = (type: string, queryCategory: string, pType: string, listingType?: string) => {
        if (!counts) return 0;

        const getBrandCount = (brands: any, brand: string) => {
            const bData = brands[brand];
            if (!bData) return 0;
            if (listingType === 'Sale') return bData.sale;
            if (listingType === 'Rent') return bData.rent;
            return bData.total;
        };

        if (type === 'real_estate') {
            if (queryCategory === 'Konut') return getBrandCount(counts.konut.types, pType);
            if (queryCategory === 'İş Yeri') return getBrandCount(counts.workplace.types, pType);
            if (queryCategory === 'Arsa') return getBrandCount(counts.land.types, pType);
        } else if (type === 'vehicle') {
            if (queryCategory === 'Otomobil') return getBrandCount(counts.vasita.automobile.brands, pType);
            if (queryCategory === 'Arazi, SUV & Pickup') return getBrandCount(counts.vasita.suv.brands, pType);
            if (queryCategory === 'Motosiklet') return getBrandCount(counts.vasita.motorcycle.brands, pType);
        }
        return 0;
    };

    return (
        <aside className="h-full relative bg-white dark:bg-gray-800 border rounded shadow-sm text-xs overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="h-full overflow-y-auto custom-scrollbar p-2 pb-14 space-y-2">

                {/* Categories */}
                {/* Header: LISTINGS (Reset) */}
                <div className="p-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                    <button
                        onClick={() => {
                            const params = new URLSearchParams();
                            const view = searchParams.get('view');
                            if (view) params.set('view', view);
                            router.push(`${pathname}?${params.toString()}`);
                        }}
                        className="w-full text-center py-2 px-4 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                        {t('title_listings')}
                    </button>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    {/* REAL ESTATE GROUP */}
                    <div className="border-b-4 border-gray-300 dark:border-gray-700 pb-4">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 pl-1 mb-2 text-sm uppercase">{t('title_property')}</h3>

                        {/* Level 1: Sub-Categories (Konut, İşyeri, Arsa) */}
                        {categoriesData.filter(c => c.type === 'real_estate').map((cat) => (
                            <div key={cat.name} className="mb-1">
                                <button
                                    onClick={() => handleCategoryClick(cat.type, '', (cat as any).queryCategory)}
                                    className={`w-full text-left px-2 py-1.5 rounded flex justify-between items-center transition-all ${currentType === cat.type && currentCategory === (cat as any).queryCategory
                                        ? 'font-bold text-blue-700 bg-blue-50'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>{cat.name}</span>
                                    <span className="text-[10px] text-gray-400">({cat.count?.toLocaleString()})</span>
                                </button>

                                {/* Level 2: Sale/Rent (Only if Level 1 is selected) */}
                                {currentCategory === (cat as any).queryCategory && (
                                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                                        {cat.subcategories.map((sub) => {
                                            if (sub.count === 0) return null;
                                            return (
                                                <div key={sub.name}>
                                                    <button
                                                        onClick={() => handleCategoryClick(cat.type, sub.value, (cat as any).queryCategory)}
                                                        className={`w-full text-left px-2 py-1 rounded flex justify-between items-center text-xs ${currentListingType === sub.value && !currentPropertyType
                                                            ? 'text-blue-600 font-bold bg-blue-50/50'
                                                            : 'text-gray-600 hover:text-blue-600'
                                                            }`}
                                                    >
                                                        <span>{sub.name}</span>
                                                        <span className="text-gray-400 text-[10px]">({sub.count})</span>
                                                    </button>

                                                    {/* Level 3: Property Types (Only if Level 2 is selected) */}
                                                    {currentListingType === sub.value && (
                                                        <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
                                                            {getSubTypes(cat.type, (cat as any).queryCategory, sub.value).map((pType: string) => {
                                                                const count = getCount(cat.type, (cat as any).queryCategory, pType, sub.value);
                                                                if (count === 0) return null;
                                                                return (
                                                                    <button
                                                                        key={pType}
                                                                        onClick={() => handleCategoryClick(cat.type, sub.value, (cat as any).queryCategory, pType)}
                                                                        className={`w-full text-left px-2 py-0.5 rounded text-[11px] flex justify-between ${currentPropertyType === pType
                                                                            ? 'text-blue-600 font-bold'
                                                                            : 'text-gray-500 hover:text-blue-500'
                                                                            }`}
                                                                    >
                                                                        <span>{pType}</span>
                                                                        <span className="text-gray-400 text-[9px]">({count})</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* VEHICLE GROUP */}
                    <div className="border-b-4 border-gray-300 dark:border-gray-700 pb-4">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 pl-1 mb-2 text-sm uppercase">{t('cat_vehicle')}</h3>

                        {/* Level 1 for Vehicle */}
                        {categoriesData.filter(c => c.type === 'vehicle').map((cat) => (
                            <div key={cat.name} className="mb-1">
                                <button
                                    onClick={() => handleCategoryClick(cat.type, '', (cat as any).queryCategory)}
                                    className={`w-full text-left px-2 py-1.5 rounded flex justify-between items-center transition-all ${currentType === cat.type && currentCategory === (cat as any).queryCategory
                                        ? 'font-bold text-blue-700 bg-blue-50'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>{cat.name}</span>
                                    <span className="text-[10px] text-gray-400">({cat.count?.toLocaleString()})</span>
                                </button>

                                {/* Level 2: Sale/Rent */}
                                {currentCategory === (cat as any).queryCategory && (
                                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                                        {cat.subcategories.map((sub) => {
                                            if (sub.count === 0) return null;
                                            return (
                                                <div key={sub.name}>
                                                    <button
                                                        onClick={() => handleCategoryClick(cat.type, sub.value, (cat as any).queryCategory)}
                                                        className={`w-full text-left px-2 py-1 rounded flex justify-between items-center text-xs ${currentListingType === sub.value
                                                            ? 'text-blue-600 font-bold bg-blue-50/50'
                                                            : 'text-gray-600 hover:text-blue-600'
                                                            }`}
                                                    >
                                                        <span>{sub.name}</span>
                                                        <span className="text-gray-400 text-[10px]">({sub.count})</span>
                                                    </button>

                                                    {/* Level 3: Vehicle Brands */}
                                                    {currentListingType === sub.value && (
                                                        <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
                                                            {getSubTypes(cat.type, (cat as any).queryCategory, sub.value).map((pType: string) => {
                                                                const count = getCount(cat.type, (cat as any).queryCategory, pType, sub.value);
                                                                if (count === 0) return null;
                                                                return (
                                                                    <button
                                                                        key={pType}
                                                                        onClick={() => handleCategoryClick(cat.type, sub.value, (cat as any).queryCategory, pType)}
                                                                        className={`w-full text-left px-2 py-0.5 rounded text-[11px] flex justify-between ${currentPropertyType === pType
                                                                            ? 'text-blue-600 font-bold'
                                                                            : 'text-gray-500 hover:text-blue-500'
                                                                            }`}
                                                                    >
                                                                        <span>{pType}</span>
                                                                        <span className="text-gray-400 text-[9px]">({count})</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* PARTS GROUP */}
                    <div className="pb-2 border-b-4 border-gray-300 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 pl-1 mb-2 text-sm uppercase">{t('cat_part')}</h3>
                        {categoriesData.filter(c => c.type === 'part').map((cat) => (
                            <div key={cat.name} className="mb-1">
                                <button
                                    onClick={() => handleCategoryClick(cat.type, '', (cat as any).queryCategory)} // Ensure queryCategory 'Yedek Parça' is set
                                    className={`w-full text-left px-2 py-1.5 rounded flex justify-between items-center transition-all ${currentType === cat.type && currentCategory === (cat as any).queryCategory
                                        ? 'font-bold text-blue-700 bg-blue-50'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>{cat.name}</span>
                                    <span className="text-[10px] text-gray-400">({cat.count?.toLocaleString()})</span>
                                </button>

                                {/* Level 2: Part Subcategories (Otomotiv, Motosiklet) */}
                                {(currentCategory === (cat as any).queryCategory || cat.subcategories.some(s => s.value === currentCategory)) && (
                                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                                        {cat.subcategories.map((sub) => {
                                            if (sub.count === 0) return null;
                                            return (
                                                <div key={sub.name}>
                                                    <button
                                                        onClick={() => handleCategoryClick(cat.type, '', sub.value)}
                                                        className={`w-full text-left px-2 py-1 rounded flex justify-between items-center text-xs ${currentCategory === sub.value
                                                            ? 'text-blue-600 font-bold bg-blue-50/50'
                                                            : 'text-gray-600 hover:text-blue-600'
                                                            }`}
                                                    >
                                                        <span>{sub.name}</span>
                                                        <span className="text-gray-400 text-[10px]">({sub.count})</span>
                                                    </button>

                                                    {/* Level 3: Sale (Satılık) - Hardcoded for now as it's the only option usually */}
                                                    {currentCategory === sub.value && (
                                                        <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
                                                            {['Satılık'].map((lType) => {
                                                                if (sub.count === 0) return null;
                                                                return (
                                                                    <div key={lType}>
                                                                        <button
                                                                            onClick={() => handleCategoryClick(cat.type, 'Sale', sub.value)}
                                                                            className={`w-full text-left px-2 py-0.5 rounded text-[11px] flex justify-between ${currentListingType === 'Sale'
                                                                                ? 'text-blue-600 font-bold'
                                                                                : 'text-gray-500 hover:text-blue-500'
                                                                                }`}
                                                                        >
                                                                            <span>{lType}</span>
                                                                            <span className="text-gray-400 text-[9px]">({sub.count})</span>
                                                                        </button>
                                                                        {/* Level 4: Types (Aksesuar, Yedek Parça etc) */}
                                                                        {currentListingType === 'Sale' && (
                                                                            <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
                                                                                {getSubTypes(cat.type, sub.value, 'Sale').map((pType: string) => {
                                                                                    // Assuming parts sub-types shouldn't necessarily be hidden without true counts, but let's hide if sub.count === 0 overall
                                                                                    return (
                                                                                        <div key={pType}>
                                                                                            <button
                                                                                                onClick={() => handleCategoryClick(cat.type, 'Sale', sub.value, pType)}
                                                                                                className={`w-full text-left px-2 py-0.5 rounded text-[11px] flex justify-between ${currentPropertyType === pType
                                                                                                    ? 'text-blue-600 font-bold'
                                                                                                    : 'text-gray-500 hover:text-blue-500'
                                                                                                    }`}
                                                                                            >
                                                                                                <span>{pType}</span>
                                                                                            </button>

                                                                                            {/* Brand List Injection */}
                                                                                            {pType === 'Yedek Parça' && currentPropertyType === 'Yedek Parça' && (
                                                                                                <div className="ml-2 mt-1 border-l border-gray-200 pl-2 space-y-0.5">
                                                                                                    {(() => {
                                                                                                        // Fetch Brands based on parent category
                                                                                                        let brands: string[] = [];
                                                                                                        if (sub.value === 'Otomotiv Ekipmanları') {
                                                                                                            brands = CATEGORY_DATA['Vasıta']?.subcategories['Otomobil']?.types['Satılık'] || [];
                                                                                                        } else if (sub.value === 'Motosiklet Ekipmanları') {
                                                                                                            brands = CATEGORY_DATA['Vasıta']?.subcategories['Motosiklet']?.types['Satılık'] || [];
                                                                                                        }

                                                                                                        return brands.map(brandName => (
                                                                                                            <button
                                                                                                                key={brandName}
                                                                                                                onClick={() => updateURL({ brand: brand === brandName ? null : brandName })} // Toggle
                                                                                                                className={`w-full text-left px-2 py-0.5 rounded text-[10px] truncate ${brand === brandName
                                                                                                                    ? 'text-blue-600 font-bold bg-blue-50'
                                                                                                                    : 'text-gray-500 hover:text-gray-900'
                                                                                                                    }`}
                                                                                                            >
                                                                                                                {brandName}
                                                                                                            </button>
                                                                                                        ));
                                                                                                    })()}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories End */}

                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Location */}
                <div className="space-y-1.5">
                    <h4 className="font-bold text-gray-700 dark:text-gray-300 px-1">{t('title_address')}</h4>

                    {/* City Select */}
                    <select
                        className="w-full p-1.5 border rounded hover:border-blue-400 focus:border-blue-600 outline-none bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs"
                        value={city}
                        onChange={(e) => handleLocationChange('city', e.target.value)}
                    >
                        <option value={t('lbl_city')}>{t('lbl_city')}</option>
                        <option value="Mersin" className="font-bold">Mersin</option>
                        <option disabled>──────────</option>
                        {Object.keys(CITIES).filter(c => c !== 'Mersin').sort().map(cityName => (
                            <option key={cityName} value={cityName}>{cityName}</option>
                        ))}
                    </select>

                    {/* District Select (Dependent) */}
                    <select
                        className={`w-full p-1.5 border rounded hover:border-blue-400 focus:border-blue-600 outline-none bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs ${!city || city === t('lbl_city') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={district}
                        onChange={(e) => handleLocationChange('district', e.target.value)}
                        disabled={!city || city === t('lbl_city')}
                    >
                        <option value="">{t('lbl_district')}</option>
                        {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <Input
                        placeholder={t('lbl_neighborhood')}
                        value={neighborhood}
                        onChange={(e) => handleLocationChange('neighborhood', e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-gray-900"
                    />
                </div>

                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Price */}

                <div className="space-y-2">
                    <h4 className="font-bold text-gray-700 dark:text-gray-300 px-1">{t('title_price')}</h4>
                    <div className="flex border rounded overflow-hidden">
                        {[
                            { label: 'TL', value: 'TRY' },
                            { label: 'USD', value: 'USD' },
                            { label: 'EUR', value: 'EUR' },
                            { label: 'GBP', value: 'GBP' }
                        ].map((c) => (
                            <button
                                key={c.value}
                                onClick={() => setCurrency(c.value)}
                                className={`flex-1 text-[10px] py-1 font-medium transition-colors ${currency === c.value ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1 items-center">
                        <input
                            type="number"
                            placeholder={t('ph_min')}
                            className="w-full h-7 px-2 border rounded text-xs outline-none focus:border-blue-500 bg-white dark:bg-gray-700"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder={t('ph_max')}
                            className="w-full h-7 px-2 border rounded text-xs outline-none focus:border-blue-500 bg-white dark:bg-gray-700"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>

                {/* Vehicle Specific Filters */}
                {isVehicleCurrent && (
                    <>
                        <hr className="border-gray-100 dark:border-gray-700" />
                        <div className="space-y-2">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 px-1">{t('sec_year', { defaultValue: 'Yıl' })}</h4>
                            <div className="flex gap-1 items-center">
                                <input
                                    type="number"
                                    placeholder={t('ph_min')}
                                    className="w-full h-7 px-2 border rounded text-xs outline-none focus:border-blue-500 bg-white dark:bg-gray-700"
                                    value={minYear}
                                    onChange={(e) => setMinYear(e.target.value)}
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder={t('ph_max')}
                                    className="w-full h-7 px-2 border rounded text-xs outline-none focus:border-blue-500 bg-white dark:bg-gray-700"
                                    value={maxYear}
                                    onChange={(e) => setMaxYear(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 px-1">KM</h4>
                            <div className="flex gap-1 items-center">
                                <input
                                    type="number"
                                    placeholder={t('ph_min')}
                                    className="w-full h-7 px-2 border rounded text-xs outline-none focus:border-blue-500 bg-white dark:bg-gray-700"
                                    value={minKm}
                                    onChange={(e) => setMinKm(e.target.value)}
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder={t('ph_max')}
                                    className="w-full h-7 px-2 border rounded text-xs outline-none focus:border-blue-500 bg-white dark:bg-gray-700"
                                    value={maxKm}
                                    onChange={(e) => setMaxKm(e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                )}


                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Dynamic Filters Section */}
                <div className="bg-gray-50/50 rounded-lg">
                    {activeFilters.map((section) => (
                        <CollapsibleSection
                            key={section.id}
                            title={section.title}
                            isOpen={openSections[section.id] || false}
                            onToggle={() => toggleSection(section.id)}
                        >
                            <CheckboxList
                                options={section.options}
                                selected={filters[section.id] || []}
                                onChange={(opt) => handleFilterToggle(section.id, opt)}
                            />
                        </CollapsibleSection>
                    ))}
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="absolute bottom-0 w-full p-2 border-t bg-white dark:bg-gray-800 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <Button onClick={handleSearch} className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">
                    {t('btn_search')}
                </Button>
            </div>
        </aside>
    );
}

// Subcomponents for cleaner code
function CollapsibleSection({ title, isOpen, onToggle, children }: { title: string, isOpen: boolean, onToggle: () => void, children: React.ReactNode }) {
    return (
        <div className="border-b bg-white dark:bg-transparent last:border-0">
            <button
                onClick={onToggle}
                className="w-full py-2.5 px-2 flex justify-between items-center text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={title}
            >
                <span>{title}</span>
                {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            </button>
            {isOpen && (
                <div className="px-2 pb-2 pt-0 animate-in slide-in-from-top-1 duration-200 max-h-40 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            )}
        </div>
    );
}

function CheckboxList({ options, selected, onChange }: { options: string[], selected: string[], onChange: (val: string) => void }) {
    return (
        <div className="space-y-1">
            {options.map(opt => (
                <label key={opt} className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 select-none py-0.5">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        checked={selected.includes(opt)}
                        onChange={() => onChange(opt)}
                    />
                    {opt}
                </label>
            ))}
        </div>
    );
}

