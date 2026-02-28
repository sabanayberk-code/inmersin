'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Expand, PlayCircle, X } from 'lucide-react';

interface PropertyGalleryProps {
    images: string[];
    title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
    const [mainImage, setMainImage] = useState(images[0]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const handleThumbnailClick = (img: string, index: number) => {
        setMainImage(img);
        setSelectedIndex(index);
    };

    const nextImage = () => {
        const next = (selectedIndex + 1) % images.length;
        setMainImage(images[next]);
        setSelectedIndex(next);
    };

    const prevImage = () => {
        const prev = (selectedIndex - 1 + images.length) % images.length;
        setMainImage(images[prev]);
        setSelectedIndex(prev);
    };

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isLightboxOpen]);

    return (
        <div className="space-y-4">
            {/* Main Image Stage (Swipeable Horizontal List) */}
            <div className="relative w-full aspect-[4/3] group">
                <div
                    className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide border bg-gray-100 dark:bg-gray-800"
                    onScroll={(e) => {
                        const el = e.currentTarget;
                        // Avoid calculation errors during resize or unmount by checking clientWidth
                        if (el.clientWidth > 0) {
                            const index = Math.round(el.scrollLeft / el.clientWidth);
                            if (index >= 0 && index < images.length && index !== selectedIndex) {
                                setSelectedIndex(index);
                                setMainImage(images[index]);
                            }
                        }
                    }}
                >
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-full h-full snap-center relative cursor-pointer"
                            onClick={() => setIsLightboxOpen(true)}
                        >
                            <Image
                                src={img}
                                alt={`${title} - Fotoğraf ${i + 1}`}
                                fill
                                className="object-cover bg-black/5"
                                priority={i === 0}
                            />
                        </div>
                    ))}
                </div>

                {/* Tag Overlay */}
                <div className="absolute bottom-4 mx-auto left-0 right-0 w-max z-10 pointer-events-none">
                    <span className="bg-black/60 text-white px-3 py-1 font-semibold text-xs rounded-full shadow-sm">
                        {selectedIndex + 1} / {images.length}
                    </span>
                </div>
            </div>

            {/* Lightbox Overlay */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center text-white backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Counter - Top Left */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
                        <span className="bg-black/50 text-white px-3 py-1 font-semibold text-sm rounded-full">
                            {selectedIndex + 1} / {images.length}
                        </span>
                    </div>

                    {/* Close Button - Top Right */}
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-black/50 hover:bg-white/20 rounded-full transition-colors z-50 text-white"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Main Lightbox Image */}
                    <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 py-10 mt-10 sm:mt-0">
                        <Image
                            src={mainImage}
                            alt={title}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Lightbox Nav */}
                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-4 bg-black/20 hover:bg-black/60 rounded-full transition-colors z-50 text-white"
                    >
                        <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-4 bg-black/20 hover:bg-black/60 rounded-full transition-colors z-50 text-white"
                    >
                        <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
                    </button>
                </div>
            )}
        </div>
    );
}
