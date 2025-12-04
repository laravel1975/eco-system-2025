import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
    images: string[]; // ✅ รับเป็น Array แทน src เดียว
    alt: string;
    className?: string;
}

export default function ImageViewer({ images = [], alt, className = "w-10 h-10" }: ImageViewerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // ถ้าไม่มีรูปเลย
    if (!images || images.length === 0) {
        return (
            <div className={`${className} bg-muted rounded flex items-center justify-center text-muted-foreground border`}>
                <ImageOff className="w-4 h-4 opacity-50" />
            </div>
        );
    }

    // รูป Thumbnail ที่จะโชว์ในตาราง (เอารูปแรกเสมอ)
    const thumbnailSrc = images[0];

    // ฟังก์ชันเลื่อนรูป
    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') setIsOpen(false);
            if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % images.length);
            if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, images.length]);

    return (
        <>
            {/* Thumbnail Image (Click to Open) */}
            <div
                className={`relative group cursor-zoom-in overflow-hidden rounded border bg-white ${className}`}
                onClick={() => {
                    setCurrentIndex(0); // เปิดมาเริ่มที่รูปแรก
                    setIsOpen(true);
                }}
            >
                <img
                    src={thumbnailSrc}
                    alt={alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* บอกจำนวนรูปถ้ามีมากกว่า 1 */}
                {images.length > 1 && (
                    <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 rounded-tl-md">
                        +{images.length - 1}
                    </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-4 h-4 drop-shadow-md transition-opacity" />
                </div>
            </div>

            {/* Lightbox Modal */}
            {isOpen && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors z-50"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* ✅ Navigator Buttons (แสดงเฉพาะถ้ามีหลายรูป) */}
                    {images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/20 hover:bg-black/50 rounded-full transition-all z-50"
                                onClick={prevImage}
                            >
                                <ChevronLeft className="w-10 h-10" />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/20 hover:bg-black/50 rounded-full transition-all z-50"
                                onClick={nextImage}
                            >
                                <ChevronRight className="w-10 h-10" />
                            </button>
                        </>
                    )}

                    {/* Main Image Container */}
                    <div
                        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`${alt} - ${currentIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
                        />

                        {/* Image Counter / Caption */}
                        <div className="mt-4 text-white text-sm font-medium bg-black/50 px-4 py-1 rounded-full">
                            {currentIndex + 1} / {images.length} : {alt}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
