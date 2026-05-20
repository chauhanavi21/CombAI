import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { getAllCoupons } from "@/lib/db/queries-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CouponRowActions } from "@/components/admin/coupon-row-actions";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const coupons = await getAllCoupons();

  return (
    <>
      <header className="flex items-end justify-between mb-12 gap-6">
        <div>
          <p className="label-eyebrow mb-3">Coupons</p>
          <h1 className="font-display text-display-sm text-ink-900 tracking-tight">
            Promo codes
          </h1>
          <p className="mt-2 text-ink-600">
            {coupons.length} {coupons.length === 1 ? "code" : "codes"} on record
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus size={16} />
            New coupon
          </Link>
        </Button>
      </header>

      {coupons.length === 0 ? (
        <div className="rounded-3xl border border-ink-200 bg-ink-50 py-20 text-center">
          <Tag className="mx-auto mb-4 text-ink-300" size={32} />
          <h3 className="font-display text-xl text-ink-900 mb-2">
            No coupons yet
          </h3>
          <p className="text-sm text-ink-600 mb-6">
            Create one to offer discounts at checkout.
          </p>
          <Button asChild>
            <Link href="/admin/coupons/new">
              <Plus size={16} />
              Create coupon
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-3xl border border-ink-200 bg-ink-50 overflow-hidden">
          <ul className="divide-y divide-ink-200">
            {coupons.map((coupon) => (
              <li
                key={coupon.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-mono text-base text-ink-900 font-semibold">
                      {coupon.code}
                    </p>
                    <Badge
                      variant={coupon.active ? "gold" : "outline"}
                      className="text-[10px] py-0.5 px-2"
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-600">
                    {coupon.discountType === "percent"
                      ? `${coupon.discountValue}% off`
                      : `${formatPrice(coupon.discountValue)} off`}
                    {coupon.maxUses &&
                      ` · ${coupon.usesCount}/${coupon.maxUses} used`}
                    {coupon.expiresAt &&
                      ` · expires ${formatDate(coupon.expiresAt)}`}
                  </p>
                </div>
                <CouponRowActions
                  couponId={coupon.id}
                  isActive={coupon.active}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
