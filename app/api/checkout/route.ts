import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";

// Validate the incoming request body — defense against malformed requests.
const checkoutBodySchema = z.object({
  variantId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const parsed = checkoutBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { variantId } = parsed.data;

    // 2. Look up the variant + parent product to verify they exist & are active
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId),
      with: {
        product: true,
      },
    });

    if (!variant || !variant.product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (variant.product.status !== "published") {
      return NextResponse.json(
        { error: "Product is not available" },
        { status: 400 }
      );
    }

    // 3. Get user context if signed in. Guests can also check out (we capture email at Stripe).
    const { userId: clerkId } = await auth();
    const user = clerkId ? await currentUser() : null;
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    // 4. Build the Checkout Session.
    // We create line items dynamically (using price_data) rather than relying on Stripe Price IDs,
    // because in Week 4 the seed products don't have Stripe IDs yet. In Week 6's admin panel,
    // we'll sync products to Stripe and start using stripe_price_id directly.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: variant.priceCents,
            product_data: {
              name: `${variant.product.title} — ${variant.name}`,
              description:
                variant.description ??
                variant.product.shortDescription ??
                undefined,
            },
          },
        },
      ],
      // Critical: we attach metadata so the webhook can match this session to a product/variant.
      metadata: {
        productId: variant.product.id,
        variantId: variant.id,
        clerkId: clerkId ?? "",
      },
      // Pre-fill email if we know it
      customer_email: userEmail,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/products/${variant.product.category}/${variant.product.slug}`,
      // Allow promo codes (real coupons come in Week 6, this just enables the field)
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
