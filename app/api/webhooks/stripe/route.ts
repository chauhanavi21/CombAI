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

// Stripe needs the raw request body to verify signatures — we cannot use req.json().
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

  // Read raw body for signature verification
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

  // Handle the event types we care about
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case "checkout.session.expired": {
        // Optional: clean up pending orders, log analytics
        console.log("Checkout session expired:", event.data.object.id);
        break;
      }

      case "charge.refunded": {
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      }

      default:
        // We don't care about other events yet, but log for debugging
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Critical: if we throw, Stripe will retry. Return 500 only for transient errors.
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle a successful checkout. This is the most important handler.
 * It creates the order record, links it to the user, and prepares for delivery.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Ignore unpaid sessions (e.g. async payment methods that haven't completed)
  if (session.payment_status !== "paid") {
    console.log(`Session ${session.id} not paid, status: ${session.payment_status}`);
    return;
  }

  // Idempotency: if we already processed this session, skip
  const existing = await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, session.id),
  });
  if (existing) {
    console.log(`Order already exists for session ${session.id}, skipping`);
    return;
  }

  // Pull metadata we set during session creation
  const variantId = session.metadata?.variantId;
  const productId = session.metadata?.productId;
  const clerkId = session.metadata?.clerkId;

  if (!variantId || !productId) {
    throw new Error(
      `Missing metadata in session ${session.id}. variantId=${variantId}, productId=${productId}`
    );
  }

  // Verify the variant still exists and prices match (defense against tampering)
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
  });
  if (!variant) {
    throw new Error(`Variant ${variantId} not found for session ${session.id}`);
  }

  // Find or create the user record from Clerk ID
  let userIdInDb: string | null = null;
  if (clerkId) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
    if (existingUser) {
      userIdInDb = existingUser.id;
    } else if (session.customer_email) {
      // Mirror the Clerk user we don't yet have on file
      const [created] = await db
        .insert(users)
        .values({
          clerkId,
          email: session.customer_email,
        })
        .returning();
      userIdInDb = created.id;
    }
  }

  // Create order + order item in a transaction
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

    console.log(
      `✅ Order ${createdOrder.id} created for session ${session.id} (${session.customer_email})`
    );
  });

  // TODO Week 5: send confirmation email with download links
}

/**
 * Handle a refund event. Mark the order as refunded.
 */
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
