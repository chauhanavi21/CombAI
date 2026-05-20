"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCouponAction } from "@/app/admin/coupons/actions";

export default function NewCouponPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(
    "percent"
  );
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const value =
      discountType === "fixed"
        ? Math.round(parseFloat(discountValue) * 100)
        : parseInt(discountValue, 10);

    if (Number.isNaN(value) || value < 1) {
      setError("Discount value is invalid");
      return;
    }

    startTransition(async () => {
      const result = await createCouponAction({
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: value,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt || null,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/admin/coupons");
    });
  };

  return (
    <>
      <header className="mb-10">
        <Link
          href="/admin/coupons"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 mb-6 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to coupons
        </Link>
        <p className="label-eyebrow mb-3">New coupon</p>
        <h1 className="font-display text-display-sm text-ink-900 tracking-tight">
          Create a coupon
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {error && (
          <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-ink-200 bg-ink-50 p-6 lg:p-8 space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink-600 font-medium mb-2">
              Code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER25"
              required
              maxLength={50}
            />
            <p className="text-xs text-ink-500 mt-1">
              Uppercase letters, numbers, dashes, underscores.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink-600 font-medium mb-2">
                Discount type
              </label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as "percent" | "fixed")
                }
                className="w-full rounded-full border border-ink-300 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-ink-900 transition-colors"
              >
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount off (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink-600 font-medium mb-2">
                {discountType === "percent" ? "Percent" : "Amount (USD)"}
              </label>
              <Input
                type="number"
                step={discountType === "percent" ? "1" : "0.01"}
                min="1"
                max={discountType === "percent" ? "100" : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "25" : "10.00"}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink-600 font-medium mb-2">
                Max uses
              </label>
              <Input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
              />
              <p className="text-xs text-ink-500 mt-1">
                Leave empty for unlimited.
              </p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink-600 font-medium mb-2">
                Expires
              </label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-ink-500 mt-1">
                Optional. Empty = never expires.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={14} />
                Create coupon
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-12 rounded-3xl border border-ink-200 bg-ink-100/40 p-6 text-sm text-ink-600 max-w-2xl">
        <p className="font-medium text-ink-900 mb-2">A note on coupons</p>
        <p>
          Coupon codes are tracked in the database, but Stripe Checkout also
          accepts its own promotion codes. For full discount enforcement at
          checkout, create matching Stripe promotion codes in your Stripe
          dashboard. Database coupons here are tracked when buyers enter them
          on Stripe's side.
        </p>
      </div>
    </>
  );
}
