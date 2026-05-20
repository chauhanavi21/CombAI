"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth-admin";

const couponSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/, "Code must be uppercase letters, numbers, dashes, or underscores"),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().int().min(1),
  maxUses: z.number().int().min(1).optional().nullable(),
  expiresAt: z.string().optional().nullable(), // ISO date string
});

export type CouponFormInput = z.infer<typeof couponSchema>;

export async function createCouponAction(input: CouponFormInput) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  // Validate discountValue based on type
  if (data.discountType === "percent" && data.discountValue > 100) {
    return { error: "Percent discount cannot exceed 100" };
  }

  // Check code uniqueness
  const existing = await db.query.coupons.findFirst({
    where: eq(coupons.code, data.code),
  });
  if (existing) {
    return { error: `Code "${data.code}" already exists` };
  }

  try {
    await db.insert(coupons).values({
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      active: true,
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    console.error("Create coupon failed:", err);
    return { error: "Failed to create coupon" };
  }
}

export async function toggleCouponActiveAction(couponId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const existing = await db.query.coupons.findFirst({
    where: eq(coupons.id, couponId),
  });
  if (!existing) return { error: "Coupon not found" };

  await db
    .update(coupons)
    .set({ active: !existing.active })
    .where(eq(coupons.id, couponId));

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCouponAction(couponId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  await db.delete(coupons).where(eq(coupons.id, couponId));
  revalidatePath("/admin/coupons");
  return { success: true };
}
