# Luxe — Premium Digital Products Storefront

**Status:** Week 1–6 complete. **Full admin panel works.** You can manage products, orders, coupons, and subscribers through the UI.

## What's new in Week 6

- 🔐 **Admin panel** at `/admin` — role-gated, secure
- 📊 **Dashboard** with revenue metrics + recent orders
- 📦 **Product management** — create, edit, delete (with multi-variant support)
- 🖼️ **Image uploads** directly from admin to R2 (no more upload script for images)
- 📁 **File uploads** per variant — set deliverables through the UI
- 🧾 **Order management** — list, detail view, **Stripe-integrated refunds**
- 🏷️ **Coupon management** — create, activate/deactivate, delete
- 📧 **Subscribers list** with CSV export
- ✉️ **Working newsletter form** in footer (writes to DB)
- 🛡️ Admin role enforcement via `requireAdmin()` helper

## ⚡ One-time admin setup

After installing Week 6, you need to grant yourself admin access:

```bash
# 1. Sign up at /sign-up with your email (creates Clerk user)
# 2. Grant admin via script
npm run make-admin -- you@example.com
```

You should see:
```
✅ you@example.com is now an admin
   Visit /admin to access the dashboard.
```

If you see "User not found" — you need to sign up via the storefront first.

## Setup steps for Week 6

```bash
# 1. Drop in the Week 6 bundle (replace files)
# 2. Install (new dev script reference, no new deps)
npm install

# 3. No DB schema changes — skip db:push
# 4. Sign up at localhost:3000/sign-up if you haven't already
# 5. Make yourself admin (see above)
# 6. Run dev as usual
npm run dev
```

If Stripe webhooks: keep `stripe listen --forward-to localhost:3000/api/webhooks/stripe` running in another terminal.

## What works now

Visit `http://localhost:3000/admin`:

- **`/admin`** — Overview with revenue, recent orders, quick actions
- **`/admin/products`** — All products (any status)
- **`/admin/products/new`** — Create a product with images, features, multiple tiers
- **`/admin/products/[id]`** — Edit existing product; delete or archive
- **`/admin/orders`** — All orders chronologically
- **`/admin/orders/[id]`** — Order detail with line items, customer info, refund button
- **`/admin/coupons`** — Manage promo codes
- **`/admin/coupons/new`** — Create a coupon
- **`/admin/subscribers`** — Newsletter list with CSV export

## Test the full admin flow

1. Visit `/admin` — see metrics (likely $0 if you haven't made test purchases)
2. `/admin/products` — your 10 seeded products appear
3. Click any product → edit it → change title or price → save
4. Visit the storefront — changes appear within a few seconds (ISR revalidation)
5. `/admin/products/new` → create a new test product with:
   - Upload a thumbnail image (drag/drop)
   - Add 2 variants
   - Upload a deliverable file to one variant
   - Set status to "Published"
6. Visit `/products/{category}/{slug}` — your new product is live
7. Buy it as a test (in incognito window) — see order appear in `/admin/orders`
8. Open the order detail → click "Issue refund" — Stripe issues the refund

## File Structure (new in Week 6)

```
luxe-store/
├── app/
│   ├── admin/
│   │   ├── layout.tsx                       # NEW: protected admin layout
│   │   ├── page.tsx                         # NEW: overview
│   │   ├── products/
│   │   │   ├── page.tsx                     # NEW: products list
│   │   │   ├── new/page.tsx                 # NEW: create
│   │   │   ├── [id]/page.tsx                # NEW: edit
│   │   │   └── actions.ts                   # NEW: CRUD server actions
│   │   ├── orders/
│   │   │   ├── page.tsx                     # NEW
│   │   │   ├── [id]/page.tsx                # NEW
│   │   │   └── actions.ts                   # NEW: refund action
│   │   ├── coupons/
│   │   │   ├── page.tsx                     # NEW
│   │   │   ├── new/page.tsx                 # NEW
│   │   │   └── actions.ts                   # NEW
│   │   └── subscribers/page.tsx             # NEW
│   └── api/
│       ├── admin/upload/route.ts            # NEW: image/file uploads
│       └── subscribe/route.ts               # NEW: newsletter
├── components/
│   ├── admin/
│   │   ├── admin-nav.tsx                    # NEW
│   │   ├── product-form.tsx                 # NEW: the big one
│   │   ├── upload-widget.tsx                # NEW
│   │   ├── delete-product-button.tsx        # NEW
│   │   ├── refund-button.tsx                # NEW
│   │   ├── coupon-row-actions.tsx           # NEW
│   │   └── export-subscribers-button.tsx    # NEW
│   └── marketing/
│       ├── footer.tsx                       # UPDATED: uses NewsletterForm
│       └── newsletter-form.tsx              # NEW
├── lib/
│   ├── auth-admin.ts                        # NEW: requireAdmin helper
│   └── db/
│       └── queries-admin.ts                 # NEW: admin-only queries
├── scripts/
│   └── make-admin.ts                        # NEW
├── next.config.mjs                          # NEW: R2 image whitelist
└── ...
```

## Build Plan

- ✅ **Week 1:** Foundation, design system, schema, auth
- ✅ **Week 2:** UI primitives, listing pages
- ✅ **Week 3:** Product detail page with variants
- ✅ **Week 4:** Stripe checkout, webhooks
- ✅ **Week 5:** R2 storage, downloads, dashboard, email
- ✅ **Week 6:** Admin panel with full CRUD
- ⬜ **Week 7:** Blog, real product inventory, copy polish
- ⬜ **Week 8:** SEO, legal pages, launch

## Conventions

- Admin routes are doubly protected: middleware + `requireAdmin()` in layout/actions
- Server actions handle all admin mutations (no separate API routes for CRUD)
- File uploads go through `/api/admin/upload` and require admin auth
- Product slugs auto-generate from title but can be overridden
- Slugs are URL-safe and globally unique (enforced at DB + action level)
- Deleting a product fails if orders exist — use "Archived" status instead

## Troubleshooting

**"/admin redirects to home":** You're not an admin. Run `npm run make-admin -- your@email.com` after signing up. Restart browser if needed.

**Image upload fails with 401:** You're not signed in or not an admin. Check `/admin` access first.

**Image upload fails with R2 error:** R2 keys missing or wrong. Verify all 5 R2 env vars are set. Ensure your R2 API token has **Object Read & Write** permission (not just Read).

**Uploaded image doesn't display:** Bucket isn't public. Go to R2 → bucket → Settings → Enable "R2.dev subdomain" public access. Copy the `pub-xxx.r2.dev` URL into `R2_PUBLIC_URL` env var. Restart dev server.

**"Next.js Image: hostname not configured":** Restart dev server after changing `next.config.mjs`. If still failing, hardcode your exact `pub-xxx.r2.dev` hostname in the config.

**Save fails with "Slug already in use":** Slugs must be unique globally. Pick a different slug.

**Delete fails with "may have existing orders":** That's intentional — order history must be preserved. Set status to "Archived" instead; archived products don't appear on the storefront but keep order data intact.

**Refund button missing:** Only "paid" orders can be refunded. Already-refunded orders won't show the button.

**Refund fails:** The order may be missing a Stripe payment intent ID, or the charge has already been fully refunded in Stripe. Check Stripe dashboard.

**Newsletter form says success but no DB row:** Check Terminal 1 for errors. Verify `DATABASE_URL` is correct. If DB writes fail elsewhere, fix that first.

## Honest gotchas

- **Coupon enforcement is partial.** This admin creates coupons in our DB, but Stripe Checkout enforces its own promo codes separately. To make discounts actually reduce prices at checkout, create matching codes in Stripe Dashboard → Products → Coupons. The DB tracks usage when buyers enter them on Stripe's side. Full DB-driven discount enforcement would require switching from Stripe Checkout to Stripe Elements (a Week 8+ consideration).
- **No image cropping yet.** Uploaded images go to R2 at original dimensions. For a polished launch, manually optimize before upload (1200x1500 for thumbnails, max 1MB).
- **No order search.** Lists are chronological with a 100-order cap. For your scale, this is fine. If you cross 100 orders, we add pagination + search.

## Going to production preview

- Make sure to set up production webhook URL in Stripe Dashboard before launch
- The admin's R2 bucket can be the same in dev/prod, or set up a prod-specific bucket
- Verify a domain in Resend for production emails (no more `onboarding@resend.dev`)
