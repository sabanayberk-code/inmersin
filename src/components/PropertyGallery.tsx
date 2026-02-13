'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Expand, PlayCircle } from 'lucide-react';

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

    return (
        <div className="space-y-4">
            {/* Main Image Stage */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-800 group">
                <Image
                    src={mainImage}
                    alt={title}
                    fill
                    className="object-contain bg-black/5"
                    priority
                />

                {/* Navigation Arrows */}
                <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Tag Overlay */}
                <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                    <span className="bg-black/60 text-white px-2 py-1 text-xs rounded">
                        {selectedIndex + 1}/{images.length} Fotoğraf
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center text-sm">
                <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="flex items-center gap-2 text-blue-600 font-semibold hover:underline bg-blue-50 px-3 py-2 rounded transition-colors"
                >
                    <Expand className="w-4 h-4" /> Büyük Fotoğraf
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <PlayCircle className="w-4 h-4" /> Video
                </button>
            </div>

            {/* Thumbnail Strip (Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleThumbnailClick(img, idx)}
                        className={cn(
                            "relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all snap-start",
                            selectedIndex === idx ? "border-blue-600 ring-2 ring-blue-100" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                    >
                        <Image
                            src={img}
                            alt={`${title} - Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Lightbox Overlay */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center text-white backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Expand className="w-8 h-8 rotate-180" /> {/* Using expand icon rotated as close/shrink substitute or X if available */}
                    </button>

                    {/* Main Lightbox Image */}
                    <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4">
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
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-10 h-10" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-10 h-10" />
                    </button>

                    {/* Counter */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
                        {selectedIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    );
}
