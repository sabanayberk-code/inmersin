import { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface ImageUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}

export default function ImageUpload({ value, onChange, placeholder }: ImageUploadProps) {
    const [isCompressing, setIsCompressing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const t = useTranslations('Form');

    const MAX_IMAGES = 12;

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // Check limit
        if (value.length + files.length > MAX_IMAGES) {
            alert(t('err_max_images'));
            return;
        }

        setIsCompressing(true);
        const newUrls: string[] = [];

        try {
            // Process files one by one (or Promise.all if preferred, but sequential is safer for order)
            for (let i = 0; i < files.length; i++) {
                if (newUrls.length + value.length >= MAX_IMAGES) break; // Extra safety

                const file = files[i];

                // Compression Options
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    initialQuality: 0.8
                };

                let fileToUpload = file;

                // Apply compression
                if (file.type.startsWith('image/')) {
                    try {
                        const compressedFile = await imageCompression(file, options);
                        fileToUpload = compressedFile;
                    } catch (error) {
                        console.error("Compression failed, using original file", error);
                    }
                }

                // Upload
                const formData = new FormData();
                formData.append('file', fileToUpload);

                setUploading(true);
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.url) {
                        newUrls.push(data.url);
                    }
                } else {
                    console.error("Upload failed", response.statusText);
                    alert(`Upload failed for ${file.name}. File might be too large.`);
                }
            }

            // Append new URLs
            onChange([...value, ...newUrls]);

        } catch (error) {
            console.error("Error processing images", error);
            alert("Error processing images");
        } finally {
            setIsCompressing(false);
            setUploading(false);
            event.target.value = '';
        }
    };

    const removeImage = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove));
    };

    const moveImage = (index: number, direction: 'left' | 'right') => {
        const newValue = [...value];
        if (direction === 'left') {
            if (index === 0) return; // Can't move left
            [newValue[index - 1], newValue[index]] = [newValue[index], newValue[index - 1]];
        } else {
            if (index === newValue.length - 1) return; // Can't move right
            [newValue[index], newValue[index + 1]] = [newValue[index + 1], newValue[index]];
        }
        onChange(newValue);
    };

    return (
        <div className="space-y-4">
            {/* Warning if limit reached */}
            {value.length >= MAX_IMAGES && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm flex items-center gap-2">
                    <span className="font-bold">!</span> {t('err_max_images')}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {value.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-800 group">
                        <Image
                            src={url}
                            alt={`Listing Image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized // Debugging image load issue
                            onError={(e) => console.error("Image load error:", url, e)}
                        />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); moveImage(index, 'left'); }}
                                disabled={index === 0}
                                className={`p-1 rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 disabled:cursor-not-allowed`}
                                title="Move Left"
                            >
                                ←
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); removeImage(url); }}
                                className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                                title="Remove"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); moveImage(index, 'right'); }}
                                disabled={index === value.length - 1}
                                className={`p-1 rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 disabled:cursor-not-allowed`}
                                title="Move Right"
                            >
                                →
                            </button>
                        </div>

                        {/* Showcase Label (First Image) */}
                        {index === 0 && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-sm font-bold z-10">
                                {t('label_showcase')}
                            </div>
                        )}

                        {/* Number Badge */}
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {index + 1}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isCompressing || uploading ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                <p className="text-sm text-gray-500">{isCompressing ? t('optimizing') : t('uploading')}</p>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-500 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">{t('upload_click')}</span> {t('upload_drag')}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('upload_help')}
                                </p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isCompressing || uploading || value.length >= MAX_IMAGES}
                    />
                </label>
            </div>
            {value.length === 0 && placeholder && (
                <p className="text-xs text-muted-foreground">{placeholder}</p>
            )}
        </div>
    );
}
