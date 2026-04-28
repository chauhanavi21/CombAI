import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  getDefaultVariant,
  getPriceRange,
  type ProductWithVariants,
} from "@/lib/db/queries";
import { getCategoryMeta } from "@/lib/categories";

interface ProductCardProps {
  product: ProductWithVariants;
  index?: number;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  index = 0,
  className,
  priority = false,
}: ProductCardProps) {
  const defaultVariant = getDefaultVariant(product);
  const priceRange = getPriceRange(product);
  const category = getCategoryMeta(product.category);

  const hasMultipleTiers =
    priceRange && priceRange.min !== priceRange.max;

  return (
    <Link
      href={`/products/${product.category}/${product.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl border border-ink-200 bg-ink-50",
        "transition-all duration-500 ease-out",
        "hover:border-ink-300 hover:shadow-2xl hover:shadow-ink-900/[0.06] hover:-translate-y-1",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-100">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink-100 to-ink-200">
            <span className="font-display text-6xl text-ink-300">
              {product.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-ink-900/90 backdrop-blur text-ink-50 text-[10px] uppercase tracking-widest font-medium">
              Featured
            </span>
          </div>
        )}

        {/* Hover arrow */}
        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ink-50/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
          <ArrowUpRight size={16} className="text-ink-900" />
        </div>
      </div>

      {/* Body */}
      <div className="p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-ink-500 font-medium">
            {category?.shortLabel}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-ink-400">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="font-display text-2xl tracking-tight text-ink-900 mb-2">
          {product.title}
        </h3>

        {product.shortDescription && (
          <p className="text-sm text-ink-600 leading-relaxed line-clamp-2 mb-5">
            {product.shortDescription}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-baseline justify-between pt-4 border-t border-ink-200">
          <div className="flex items-baseline gap-2">
            {priceRange && (
              <>
                <span className="font-display text-xl text-ink-900">
                  {formatPrice(priceRange.min)}
                </span>
                {hasMultipleTiers && (
                  <span className="text-xs text-ink-500">
                    – {formatPrice(priceRange.max)}
                  </span>
                )}
              </>
            )}
            {product.compareAtPriceCents && defaultVariant && (
              <span className="text-xs text-ink-400 line-through ml-1">
                {formatPrice(product.compareAtPriceCents)}
              </span>
            )}
          </div>

          {hasMultipleTiers && (
            <span className="text-[10px] uppercase tracking-widest text-gold-600 font-medium">
              {product.variants.length} tiers
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
