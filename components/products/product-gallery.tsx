"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  thumbnailUrl: string | null;
  productTitle: string;
}

export function ProductGallery({
  images,
  thumbnailUrl,
  productTitle,
}: ProductGalleryProps) {
  // Combine thumbnail with gallery images, dedupe, and ensure we have at least one image to render
  const allImages = [
    ...(thumbnailUrl ? [thumbnailUrl] : []),
    ...images.filter((url) => url !== thumbnailUrl),
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = allImages.length > 0;
  const fallbackInitial = productTitle.charAt(0).toUpperCase();

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-100 border border-ink-200">
        {hasImages ? (
          <Image
            src={allImages[activeIndex]}
            alt={`${productTitle} — view ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink-100 via-ink-50 to-ink-200">
            <span className="font-display text-[12rem] text-ink-300 leading-none">
              {fallbackInitial}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {allImages.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300",
                activeIndex === idx
                  ? "border-ink-900"
                  : "border-ink-200 hover:border-ink-400 opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${productTitle} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
