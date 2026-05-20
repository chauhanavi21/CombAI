"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth-admin";

export async function refundOrderAction(orderId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) return { error: "Order not found" };
  if (order.status === "refunded") return { error: "Already refunded" };
  if (order.status !== "paid")
    return { error: "Only paid orders can be refunded" };

  if (!order.stripePaymentIntentId) {
    return { error: "No payment intent on file — cannot refund via Stripe" };
  }

  try {
    // Issue the refund through Stripe. The charge.refunded webhook will
    // update our DB, but we also update it here for immediate feedback.
    await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    });

    await db
      .update(orders)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true };
  } catch (err) {
    console.error("Refund failed:", err);
    const message =
      err instanceof Error ? err.message : "Refund failed in Stripe";
    return { error: message };
  }
}
