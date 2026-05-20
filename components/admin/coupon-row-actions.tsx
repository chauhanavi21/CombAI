"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Power, Trash2 } from "lucide-react";
import {
  toggleCouponActiveAction,
  deleteCouponAction,
} from "@/app/admin/coupons/actions";

interface Props {
  couponId: string;
  isActive: boolean;
}

export function CouponRowActions({ couponId, isActive }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleCouponActiveAction(couponId);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteCouponAction(couponId);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="p-2 rounded-full text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-colors"
        title={isActive ? "Deactivate" : "Activate"}
      >
        <Power size={14} />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 rounded-full text-ink-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
