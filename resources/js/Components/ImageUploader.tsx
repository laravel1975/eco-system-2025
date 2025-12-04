import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, Star } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
    value: File[];
    onChange: (files: File[]) => void;
    existingImages?: { id: number; url: string; is_primary: boolean }[];
    onRemoveExisting?: (id: number) => void;
    onSetPrimary?: (id: number) => void;
}

export default function ImageUploader({
    value,
    onChange,
    existingImages = [],
    onRemoveExisting,
    onSetPrimary
}: ImageUploaderProps) {
    const [previews, setPreviews] = useState<string[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = [...value, ...acceptedFiles];
        onChange(newFiles);
        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    }, [value, onChange]);

    const removeFile = (index: number) => {
        const newFiles = [...value];
        newFiles.splice(index, 1);
        onChange(newFiles);
        const newPreviews = [...previews];
        if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    // ✅✅ FIX: ต้องรับตัวแปร getRootProps และ getInputProps ออกมาใช้งาน
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/gif': []
        },
        multiple: true
    });

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
            >
                <input {...getInputProps()} />
                <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 text-center">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </div>

            {/* Image Grid */}
            {(existingImages.length > 0 || previews.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {/* Existing Images */}
                    {existingImages.map((img) => (
                        <div key={img.id} className={cn("relative group aspect-square rounded-md overflow-hidden border transition-all", img.is_primary ? "ring-2 ring-yellow-400 border-yellow-400" : "border-gray-200")}>
                            <img src={img.url} alt="Existing" className="w-full h-full object-cover" />

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {onSetPrimary && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        className={cn("h-8 w-8 rounded-full", img.is_primary ? "bg-yellow-400 hover:bg-yellow-500 text-white" : "bg-white/80 hover:bg-white")}
                                        onClick={() => onSetPrimary(img.id)}
                                        title="Set as Primary"
                                    >
                                        <Star className={cn("h-4 w-4", img.is_primary ? "fill-current" : "")} />
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => onRemoveExisting && onRemoveExisting(img.id)}
                                    title="Remove Image"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {img.is_primary && (
                                <div className="absolute top-1 left-1 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> Primary
                                </div>
                            )}
                        </div>
                    ))}

                    {/* New Uploaded Images */}
                    {previews.map((src, index) => (
                        <div key={index} className="relative group aspect-square rounded-md overflow-hidden border border-blue-200">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => removeFile(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="absolute bottom-0 w-full bg-blue-600 text-white text-[10px] text-center py-0.5 opacity-90">
                                New
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
