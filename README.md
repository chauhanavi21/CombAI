# Luxe — Premium Digital Products Storefront

**Status:** Week 1 + Week 2 + Week 3 complete. Full browsing and product viewing experience is live. Buy button is a placeholder until Week 4.

## Setup (first time)

### 1. Initialize Next.js project (if you haven't already)

```bash
npx create-next-app@latest luxe-store --typescript --tailwind --app --use-npm --no-src-dir --import-alias "@/*" --eslint
cd luxe-store
```

### 2. Replace the project files

Delete everything inside the freshly-created `luxe-store/` directory and copy in every file from this bundle.

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in real values from your accounts.

### 5. Push schema and seed data

```bash
npm run db:push
npm run db:seed
```

If you already seeded in Week 2, you can skip `db:seed` — the seed data is unchanged.

### 6. Run the dev server

```bash
npm run dev
```

## What works in Week 3

You can now visit:
- `/` — Homepage with featured products and live category counts
- `/products` — All products listing
- `/products/[category]` — Category pages (notion, spreadsheet, guide, prompt, saas)
- `/products/[category]/[slug]` — **NEW: Individual product detail page**
  - Image gallery with thumbnail nav
  - Variant selector (Standard/Pro toggle) that updates price live
  - "What's included" list per selected variant
  - Description / Features / FAQ tabs
  - Related products from same category
  - Sticky purchase panel on desktop
  - Breadcrumb navigation
- `/sign-in`, `/sign-up` — Branded auth pages
- 404 page for missing products

Try clicking any product card from `/products` to see the detail page.

## What the Buy button does (Week 3)

For now, clicking "Buy" shows an alert saying Stripe integration arrives in Week 4. The variant selector, price calculation, and UI flow are all real — only the actual checkout request is mocked.

## What's NOT in Week 3 (coming next)

- ❌ Stripe checkout (Week 4) — buy button connects to Stripe
- ❌ Webhook handler (Week 4) — order confirmation
- ❌ Buyer dashboard (Week 5) — `/dashboard` shows purchases
- ❌ R2 file delivery (Week 5) — signed download URLs
- ❌ Email delivery (Week 5) — purchase confirmations via Resend
- ❌ Admin panel (Week 6)
- ❌ Blog (Week 7)

## Build Plan

- ✅ **Week 1:** Project setup, design system, schema, Clerk auth, homepage, nav, footer
- ✅ **Week 2:** UI primitives, product listing, category pages, sign-in/up, seed data
- ✅ **Week 3:** Product detail page with variant selector, image gallery, related products, tabs
- ⬜ **Week 4:** Stripe Checkout, webhook handler, success page
- ⬜ **Week 5:** R2 storage, signed URLs, buyer dashboard, email delivery
- ⬜ **Week 6:** Admin panel for product/order/coupon management
- ⬜ **Week 7:** Blog MDX, real product inventory, copy
- ⬜ **Week 8:** Polish, SEO, legal pages, launch

## File Structure

```
luxe-store/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── not-found.tsx           # NEW: branded 404
│   ├── products/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── [category]/
│   │       ├── page.tsx
│   │       └── [slug]/
│   │           ├── page.tsx    # NEW: product detail
│   │           └── loading.tsx # NEW: detail skeleton
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── tabs.tsx            # NEW: tabs primitive
│   ├── marketing/
│   │   ├── nav.tsx
│   │   ├── footer.tsx
│   │   ├── empty-state.tsx
│   │   └── breadcrumbs.tsx     # NEW
│   └── products/
│       ├── product-card.tsx
│       ├── category-filter.tsx
│       ├── product-gallery.tsx # NEW
│       └── variant-selector.tsx # NEW: the conversion engine
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── queries.ts          # UPDATED: added getRelatedProducts, getAllProductSlugs
│   ├── categories.ts
│   └── utils.ts
├── scripts/
│   └── seed.ts
├── content/blog/
├── drizzle/
├── middleware.ts
├── drizzle.config.ts
├── tailwind.config.ts
└── package.json
```

## Conventions

- Always use `cn()` from `@/lib/utils` for conditional classes
- Always use `formatPrice()` for money (DB stores cents as integer)
- Server components by default; `"use client"` only when needed (variant selector, gallery, tabs need it because they're interactive)
- Reusable UI primitives go in `components/ui/`
- Feature-specific components go in `components/[feature]/`
- Database queries belong in `lib/db/queries.ts`
- Server pages call queries directly, not via API routes (use API routes only for mutations and webhooks)

## Troubleshooting

**"Module not found: @radix-ui/react-tabs":** Run `npm install` to ensure all deps are installed.

**Product card link 404s:** Make sure the seed ran. Check the `slug` and `category` fields in your DB match what's in the URL.

**Variant price not updating:** This is a client component — make sure `"use client"` is at the top of `variant-selector.tsx`.

**Generate static params warning:** This is normal in dev — `generateStaticParams` only runs at build time. ISR with `revalidate = 60` keeps things fresh.

**Image errors:** Seed data has `thumbnailUrl: null`, so cards and the gallery show a fallback letter. This is expected. Real images come in Week 6 via the admin panel.
