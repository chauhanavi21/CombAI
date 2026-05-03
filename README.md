# Luxe — Premium Digital Products Storefront

**Status:** Week 1–4 complete. **Real Stripe checkout works.** You can collect money.

## What's new in Week 4

- Real Stripe Checkout integration (no more alert popup)
- Webhook handler creates orders in your DB on successful payment
- Branded success page with order summary
- Order queries module for retrieving past purchases
- Idempotent webhook handling — Stripe can retry without duplicating orders
- Refund webhook updates order status
- Middleware updated to exempt `/api/webhooks` and `/api/checkout` from Clerk auth

## ⚠️ Stripe CLI required for local webhook testing

Webhooks are events that Stripe sends to your server when payments succeed.
In production, Stripe sends them to your live URL. **In local development**,
Stripe can't reach `localhost:3000` directly, so we use the Stripe CLI to
forward events from Stripe to your local machine.

**Without this setup, payments will go through but no order will be saved.**

### Install Stripe CLI

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Windows (manual):** Download from https://github.com/stripe/stripe-cli/releases — get the `.zip` for Windows, extract `stripe.exe`, add it to your PATH.

**Linux:** See https://docs.stripe.com/stripe-cli for apt/yum instructions.

### Login to Stripe CLI (one time)

```bash
stripe login
```

This opens a browser to authenticate. Confirm in the browser. The CLI now has access to your Stripe account.

### Start the webhook listener (every dev session)

In a **second terminal** (keep this running while you work):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_abc123...
```

**Copy that `whsec_...` secret** and paste it into your `.env.local`:

```
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

**Important:** This secret is unique per machine and changes each time you log into the Stripe CLI from a new place. If webhooks stop working, double-check this secret is current.

### Restart your dev server

After setting `STRIPE_WEBHOOK_SECRET`:

```bash
npm run dev
```

## Daily workflow (after setup)

You'll need **3 things running** during dev:

1. **Terminal 1:** `npm run dev` (your app)
2. **Terminal 2:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (webhook forwarder)
3. **Browser:** http://localhost:3000

If you only run the dev server, payments work but orders won't appear in your DB.

## Test card numbers

Use these on Stripe Checkout (in test mode):

- **Success:** `4242 4242 4242 4242`
- **Requires authentication (3DS):** `4000 0027 6000 3184`
- **Declined:** `4000 0000 0000 9995`
- Any future date for expiry, any 3 digits for CVC, any ZIP

## Test the full flow

1. Visit http://localhost:3000/products/notion/founder-os
2. Pick Standard or Pro
3. Click "Buy"
4. You'll be redirected to Stripe Checkout
5. Enter `4242 4242 4242 4242`, any future date, any CVC
6. Click "Pay"
7. Stripe redirects you back to `/checkout/success?session_id=...`
8. Check Terminal 2 — you should see `checkout.session.completed` event
9. Check the success page — should show your order
10. Run `npm run db:studio` and look at the `orders` table — your order is there

## What's NOT in Week 4 (coming Week 5)

- ❌ Real downloads — success page shows disabled "Download" buttons
- ❌ Confirmation emails — webhook logs success but doesn't send email yet
- ❌ Buyer dashboard at `/dashboard`
- ❌ R2 signed URL generation

Week 5 wires all of these up.

## File Structure (new in Week 4)

```
luxe-store/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts           # NEW: creates Stripe sessions
│   │   └── webhooks/stripe/route.ts    # NEW: handles Stripe events
│   └── checkout/
│       └── success/
│           ├── page.tsx                # NEW: post-purchase confirmation
│           └── loading.tsx             # NEW
├── lib/
│   ├── stripe.ts                       # NEW: Stripe client
│   └── db/
│       ├── queries.ts                  # (unchanged from W3)
│       └── queries-orders.ts           # NEW: order queries
├── components/products/
│   └── variant-selector.tsx            # UPDATED: real checkout
├── middleware.ts                       # UPDATED: webhook bypass
└── ...
```

## Build Plan

- ✅ **Week 1:** Foundation, design system, schema, auth
- ✅ **Week 2:** UI primitives, listing pages
- ✅ **Week 3:** Product detail page with variants
- ✅ **Week 4:** Stripe checkout, webhooks, success page
- ⬜ **Week 5:** R2 storage, signed URLs, buyer dashboard, email delivery
- ⬜ **Week 6:** Admin panel
- ⬜ **Week 7:** Blog, real product inventory
- ⬜ **Week 8:** Polish, SEO, launch

## Conventions

- Webhook handler is **idempotent** — Stripe can retry without creating duplicate orders
- Webhook handler verifies signatures — never trust unauthenticated requests
- Order amounts in DB always come from Stripe's `amount_total`, not the request body
- Metadata on Stripe sessions stores our `productId`, `variantId`, `clerkId` for the webhook to use
- All money is in cents — never floats

## Troubleshooting

**"No webhook signing secret":** You haven't run `stripe listen` or you didn't paste the `whsec_...` into `.env.local`. Restart dev server after pasting.

**Payment succeeds but order isn't in DB:** The Stripe CLI isn't running. Start it in a second terminal: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**"Webhook signature verification failed":** Your `STRIPE_WEBHOOK_SECRET` doesn't match what `stripe listen` printed. Re-copy and restart dev server.

**Success page shows "Processing your order":** The webhook hasn't arrived yet. The page automatically retries after 2 seconds. If it persists, check Terminal 2 — the Stripe CLI should be showing the event.

**"This product is not available":** Status is not "published". The seed script publishes everything, so this only happens if you manually changed product status.

**Redirects loop after Stripe checkout:** Your `NEXT_PUBLIC_APP_URL` is wrong or has a trailing slash. Should be exactly `http://localhost:3000` (no slash, no quotes).

**Webhook works but Clerk redirects fail:** Make sure middleware was updated. Check that `/api/checkout` is in `isPublicApiRoute`. We need this because checkout can happen for guest users without sign-in.

## Going to production (preview)

When you launch (Week 8):
1. Create a production webhook in Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `charge.refunded`
4. Copy the production `whsec_...` and add to Vercel env vars (NOT `.env.local`)
5. Switch to live keys (`sk_live_`, `pk_live_`) in Vercel only
6. Test mode keys stay in `.env.local` for local dev — never mix the two
