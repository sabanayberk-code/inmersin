'use client';

import { useState } from 'react';
import PropertyGallery from '@/components/PropertyGallery';
import { MapPin, ShieldCheck } from 'lucide-react';

export default function ListingDetailView({ property, attributes, formattedPrice, images, texts }: any) {
    const [activeTab, setActiveTab] = useState<'details' | 'desc'>('details');
    // Using a simple height calculation for the sticky top to avoid overlapping navbar
    // Assuming navbar is ~72px, plus padding

    return (
        <>
            {/* Breadcrumb / Title Header */}
            <div className="mb-2 lg:mb-6 flex flex-col items-start lg:flex-row lg:justify-between lg:items-end gap-2 sticky top-[72px] lg:static z-40 bg-white dark:bg-gray-900 lg:bg-transparent backdrop-blur-sm py-3 px-2 lg:p-0 border-b border-gray-100 lg:border-none">
                <h2 className="text-[15px] lg:text-2xl font-normal lg:font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                    {property.title}
                </h2>
                <div className="hidden lg:flex items-center gap-1.5 text-gray-500 text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full w-max">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                    <span>{property.viewCount || 0} Görüntüleme</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 pb-24 lg:pb-0">
                {/* Left Column: Gallery & Description */}
                <div className="lg:col-span-5 space-y-0 lg:space-y-6">
                    <PropertyGallery images={images} title={property.title} />

                    {/* Mobile Tabs */}
                    <div className="lg:hidden sticky top-[125px] z-30 flex bg-white dark:bg-gray-900 border-b shadow-sm -mx-4 px-4 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-3 px-2 text-center text-sm font-bold border-b-4 transition-colors ${activeTab === 'details' ? 'border-[#ffce00] bg-[#ffce00] text-gray-900' : 'border-transparent text-gray-600 bg-white dark:bg-gray-900'}`}
                        >
                            İlan Bilgileri
                        </button>
                        <button
                            onClick={() => setActiveTab('desc')}
                            className={`flex-1 py-3 px-2 text-center text-sm font-bold border-b-4 transition-colors ${activeTab === 'desc' ? 'border-[#ffce00] bg-[#ffce00] text-gray-900' : 'border-transparent text-gray-600 bg-white dark:bg-gray-900'}`}
                        >
                            Açıklama
                        </button>
                    </div>

                    {/* Description - Hidden on mobile if not active tab */}
                    <div className={`prose dark:prose-invert max-w-none px-4 lg:px-0 pt-4 lg:pt-6 lg:border-t ${activeTab === 'desc' ? 'block' : 'hidden lg:block'}`}>
                        <h3 className="text-lg font-bold mb-3 hidden lg:block">{texts.description}</h3>
                        <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                            {property.description}
                        </p>

                        {/* Google Map Placeholder moved into description area for mobile flow */}
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-48 flex items-center justify-center text-gray-400 mt-6 lg:mt-4">
                            <MapPin className="w-6 h-6 mr-2" /> Harita Konumu
                        </div>
                    </div>
                </div>

                {/* Center Column: Details */}
                <div className={`lg:col-span-4 space-y-2 mt-4 lg:mt-0 px-4 lg:px-0 ${activeTab === 'details' ? 'block' : 'hidden lg:block'}`}>
                    {/* Price Header inside Attributes for mobile */}
                    <div className="lg:hidden flex items-center justify-between border-b pb-2 mb-2">
                        <span className="text-xs font-semibold text-gray-600">Fiyat</span>
                        <div className="text-right">
                            <h1 className="text-lg font-bold text-[#1b55a2]">{formattedPrice}</h1>
                        </div>
                    </div>
                    {/* Desktop Price Header */}
                    <div className="hidden lg:block border-b pb-2 mb-2">
                        <h1 className="text-2xl font-bold text-[#1b55a2] mb-1">
                            {formattedPrice}
                        </h1>
                        <div className="text-sm font-semibold text-gray-500">
                            {(property.location as any).city}{(property.location as any).district ? `, ${(property.location as any).district}` : ''}{(property.location as any).neighborhood ? `, ${(property.location as any).neighborhood}` : ''}
                        </div>
                    </div>

                    {/* Attribute Table */}
                    <div className="text-[13px] lg:text-sm">
                        {attributes.map((attr: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-2 lg:py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <span className="font-normal lg:font-bold text-gray-600 lg:text-gray-800 dark:text-gray-400 dark:lg:text-gray-200">{attr.label}</span>
                                <span className={`font-semibold lg:font-normal text-right ${attr.highlightRed ? 'text-[#c62828] font-bold' : attr.highlight ? 'text-[#c62828] font-bold' : 'text-gray-800 lg:text-gray-600 dark:text-gray-200 lg:dark:text-gray-400'}`}>
                                    {attr.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Agent */}
                <div className={`lg:col-span-3 space-y-4 mt-6 lg:mt-0 px-4 lg:px-0 ${activeTab === 'details' ? 'block' : 'hidden lg:block'}`}>
                    <div className="sticky top-[150px] space-y-4">
                        {/* Agent Card */}
                        <div className="border border-gray-200 lg:border-gray-300 rounded-lg p-4 bg-gray-50/50 lg:bg-white dark:bg-gray-800 shadow-sm lg:shadow-md">
                            <div className="text-center mb-3 border-b-2 border-blue-100 dark:border-blue-900 pb-2 hidden lg:block">
                                <h4 className="font-bold text-[#2a5d9f] dark:text-blue-400 text-sm uppercase">{property.agent?.companyName || 'inmersin ajans'}</h4>
                            </div>

                            <div className="flex flex-col items-center mb-4">
                                <h3 className="font-bold text-base text-[#2a5d9f] dark:text-blue-400 text-center lg:hidden mb-2">{property.agent?.companyName || 'inmersin ajans'}</h3>
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 mb-2 overflow-hidden border-2 border-white shadow-sm">
                                    <span>{property.agent?.name?.charAt(0) || 'A'}</span>
                                </div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 text-center">{property.agent?.name || 'Kullanıcı'}</h3>
                            </div>

                            <button className="hidden lg:flex w-full bg-[#1b55a2] text-white hover:bg-blue-800 text-sm font-semibold items-center justify-center gap-2 py-3 rounded transition shadow-sm mb-2">
                                Ara
                            </button>
                            <button className="hidden lg:flex w-full text-[#1b55a2] bg-white border border-[#1b55a2] hover:bg-blue-50 text-sm font-semibold items-center justify-center gap-2 py-3 rounded transition shadow-sm">
                                Mesaj Gönder
                            </button>
                        </div>
                        {/* Safety Tips */}
                        <div className="items-start gap-2 pt-2 text-gray-500 dark:text-gray-400 text-[10px] hidden lg:flex">
                            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>Kiralayacağınız gayrimenkulü görmeden kapora göndermeyin.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-white dark:bg-gray-900 border-t flex gap-3 lg:hidden z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <button className="flex-1 bg-[#1b55a2] text-white py-2.5 rounded text-center font-bold text-[15px] shadow-sm active:bg-blue-800 transition-colors">
                    Ara
                </button>
                <button className="flex-1 bg-[#1b55a2] text-white py-2.5 rounded text-center font-bold text-[15px] shadow-sm active:bg-blue-800 transition-colors">
                    Mesaj Gönder
                </button>
            </div>
        </>
    );
}
