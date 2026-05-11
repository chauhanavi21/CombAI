import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  productVariants,
  users,
} from "@/lib/db/schema";
import { createDownloadTokensForOrder } from "@/lib/db/queries-downloads";
import { getOrderBySessionId } from "@/lib/db/queries-orders";
import { sendPurchaseConfirmation } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`Webhook signature verification failed: ${msg}`);
    return NextResponse.json(
      { error: `Webhook Error: ${msg}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case "checkout.session.expired": {
        console.log("Checkout session expired:", event.data.object.id);
        break;
      }

      case "charge.refunded": {
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    console.log(
      `Session ${session.id} not paid, status: ${session.payment_status}`
    );
    return;
  }

  // Idempotency check
  const existing = await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, session.id),
  });
  if (existing) {
    console.log(`Order already exists for session ${session.id}, skipping`);
    return;
  }

  const variantId = session.metadata?.variantId;
  const productId = session.metadata?.productId;
  const clerkId = session.metadata?.clerkId;

  if (!variantId || !productId) {
    throw new Error(
      `Missing metadata in session ${session.id}. variantId=${variantId}, productId=${productId}`
    );
  }

  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
  });
  if (!variant) {
    throw new Error(`Variant ${variantId} not found for session ${session.id}`);
  }

  // Resolve the user
  let userIdInDb: string | null = null;
  if (clerkId) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
    if (existingUser) {
      userIdInDb = existingUser.id;
    } else if (session.customer_email) {
      const [created] = await db
        .insert(users)
        .values({ clerkId, email: session.customer_email })
        .returning();
      userIdInDb = created.id;
    }
  }

  // Create order + items in a transaction
  let createdOrderId: string;
  await db.transaction(async (tx) => {
    const [createdOrder] = await tx
      .insert(orders)
      .values({
        userId: userIdInDb,
        email: session.customer_email ?? "",
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        amountCents: session.amount_total ?? variant.priceCents,
        status: "paid",
        couponCode: session.metadata?.couponCode ?? null,
      })
      .returning();

    await tx.insert(orderItems).values({
      orderId: createdOrder.id,
      productId,
      variantId,
      priceCentsAtPurchase: variant.priceCents,
      quantity: 1,
    });

    createdOrderId = createdOrder.id;

    console.log(
      `✅ Order ${createdOrder.id} created for session ${session.id} (${session.customer_email})`
    );
  });

  // Create download tokens for each item
  const tokens = await createDownloadTokensForOrder(createdOrderId!);

  // Build download URLs and send confirmation email
  const fullOrder = await getOrderBySessionId(session.id);
  if (fullOrder && session.customer_email) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const itemsForEmail = fullOrder.items.map((item) => {
      const tokenForItem = tokens.find((t) => t.orderItemId === item.id);
      return {
        productTitle: item.product.title,
        variantName: item.variant.name,
        priceCents: item.priceCentsAtPurchase,
        downloadUrl: tokenForItem
          ? `${baseUrl}/api/download/${tokenForItem.token}`
          : `${baseUrl}/dashboard`,
      };
    });

    await sendPurchaseConfirmation({
      to: session.customer_email,
      orderId: fullOrder.id,
      orderTotalCents: fullOrder.amountCents,
      items: itemsForEmail,
    });
  }
}

async function handleRefund(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;

  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent.id;

  await db
    .update(orders)
    .set({
      status: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(orders.stripePaymentIntentId, paymentIntentId));

  console.log(`Order refunded for payment intent ${paymentIntentId}`);
}
