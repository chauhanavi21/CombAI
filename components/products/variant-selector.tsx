"use client";

import { useState } from "react";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
  ProductWithVariants,
  ProductVariant,
} from "@/lib/db/queries";
import { getDefaultVariant } from "@/lib/db/queries";

interface VariantSelectorProps {
  product: ProductWithVariants;
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const defaultVariant = getDefaultVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    defaultVariant?.id ?? product.variants[0]?.id ?? ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const selectedVariant: ProductVariant | undefined = product.variants.find(
    (v) => v.id === selectedVariantId
  );

  if (!selectedVariant) {
    return (
      <div className="p-6 rounded-2xl border border-ink-200 bg-ink-100">
        <p className="text-sm text-ink-600">
          This product is currently unavailable.
        </p>
      </div>
    );
  }

  const handleBuyClick = async () => {
    setIsLoading(true);
    // Stripe integration arrives in Week 4. For now, simulate.
    await new Promise((resolve) => setTimeout(resolve, 800));
    alert(
      `Stripe checkout integration arrives in Week 4.\n\nWould purchase: ${product.title} — ${selectedVariant.name} (${formatPrice(selectedVariant.priceCents)})`
    );
    setIsLoading(false);
  };

  const hasMultipleVariants = product.variants.length > 1;

  return (
    <div className="space-y-8">
      {/* Variant tier selector */}
      {hasMultipleVariants && (
        <div>
          <p className="label-eyebrow mb-4">Choose your tier</p>
          <div className="space-y-3">
            {product.variants.map((variant) => {
              const isSelected = variant.id === selectedVariantId;
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900",
                    isSelected
                      ? "border-ink-900 bg-ink-900/[0.02]"
                      : "border-ink-200 hover:border-ink-400 bg-transparent"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Radio indicator */}
                    <div
                      className={cn(
                        "mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300",
                        isSelected
                          ? "border-ink-900 bg-ink-900"
                          : "border-ink-300"
                      )}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-ink-50" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <span className="font-display text-xl text-ink-900 tracking-tight">
                          {variant.name}
                        </span>
                        <span className="font-display text-xl text-ink-900 tracking-tight">
                          {formatPrice(variant.priceCents)}
                        </span>
                      </div>
                      {variant.description && (
                        <p className="text-sm text-ink-600 leading-relaxed">
                          {variant.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Single variant — show price prominently */}
      {!hasMultipleVariants && (
        <div className="flex items-baseline gap-3">
          <span className="font-display text-5xl text-ink-900 tracking-tight">
            {formatPrice(selectedVariant.priceCents)}
          </span>
          {product.compareAtPriceCents && (
            <span className="text-lg text-ink-400 line-through">
              {formatPrice(product.compareAtPriceCents)}
            </span>
          )}
        </div>
      )}

      {/* What's included */}
      {selectedVariant.includedItems &&
        selectedVariant.includedItems.length > 0 && (
          <div>
            <p className="label-eyebrow mb-4">What's included</p>
            <ul className="space-y-3">
              {selectedVariant.includedItems.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-ink-700 leading-relaxed"
                >
                  <Check
                    size={16}
                    className="mt-0.5 flex-shrink-0 text-gold-600"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Buy button */}
      <Button
        onClick={handleBuyClick}
        disabled={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Preparing checkout...
          </>
        ) : (
          <>
            <ShoppingBag size={18} />
            Buy {selectedVariant.name} — {formatPrice(selectedVariant.priceCents)}
          </>
        )}
      </Button>

      {/* Trust elements */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-ink-200">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-ink-500 mb-1">
            Delivery
          </p>
          <p className="text-sm text-ink-900 font-medium">Instant</p>
        </div>
        <div className="text-center border-x border-ink-200">
          <p className="text-xs uppercase tracking-widest text-ink-500 mb-1">
            Updates
          </p>
          <p className="text-sm text-ink-900 font-medium">Lifetime</p>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-ink-500 mb-1">
            Guarantee
          </p>
          <p className="text-sm text-ink-900 font-medium">30 days</p>
        </div>
      </div>
    </div>
  );
}
