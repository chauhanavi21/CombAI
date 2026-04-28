# Luxe — Premium Digital Products Storefront

**Status:** Week 1 + Week 2 complete. Storefront browsing experience is live.

## Setup (first time)

### 1. Initialize Next.js project (if you haven't already)

```bash
npx create-next-app@latest luxe-store --typescript --tailwind --app --use-npm --no-src-dir --import-alias "@/*" --eslint
cd luxe-store
```

When prompted, say **No** to Turbopack.

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

Fill in real values from your accounts (Supabase, Clerk, Stripe, R2, Resend).

### 5. Push the schema and seed data

```bash
npm run db:push
npm run db:seed
```

`db:seed` inserts 10 dummy products with multiple variants so you can see the listing pages render. **Run this only once** — running again will create duplicates.

### 6. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## What works in Week 2

You can now visit:
- `/` — Homepage with featured products and live category counts
- `/products` — All products listing with filter
- `/products/notion` — Notion templates only
- `/products/spreadsheet`, `/products/guide`, `/products/prompt`, `/products/saas` — other categories
- `/sign-in`, `/sign-up` — Branded auth pages

You'll see 10 seeded products with multiple tiers (Standard/Pro), price ranges, "featured" badges, and hover animations.

## What's NOT in Week 2 (coming next)

- ❌ Individual product detail pages with variant selector (Week 3)
- ❌ Stripe checkout (Week 4)
- ❌ Buyer dashboard (Week 5)
- ❌ File delivery via R2 (Week 5)
- ❌ Admin panel (Week 6)
- ❌ Blog (Week 7)

Product cards link to `/products/[category]/[slug]` but those pages don't exist yet — clicking will 404. That's expected; Week 3 builds them.

## Build Plan

- ✅ **Week 1:** Project setup, design system, schema, Clerk auth, homepage, nav, footer
- ✅ **Week 2:** UI primitives, product listing, category pages, sign-in/up, seed data
- ⬜ **Week 3:** Product detail page with variant selector, image gallery
- ⬜ **Week 4:** Stripe Checkout, webhook handler, success page
- ⬜ **Week 5:** R2 storage, signed URLs, buyer dashboard, email delivery
- ⬜ **Week 6:** Admin panel for product/order/coupon management
- ⬜ **Week 7:** Blog MDX, real product inventory, copy
- ⬜ **Week 8:** Polish, SEO, legal pages, launch

## File Structure

```
luxe-store/
├── app/
│   ├── layout.tsx          # Root with Clerk + fonts
│   ├── page.tsx            # Homepage (live data)
│   ├── globals.css         # Design tokens
│   ├── products/
│   │   ├── page.tsx        # All products
│   │   ├── loading.tsx     # Skeleton state
│   │   └── [category]/
│   │       └── page.tsx    # Category page
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx      # Variant-driven button
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── marketing/
│   │   ├── nav.tsx
│   │   ├── footer.tsx
│   │   └── empty-state.tsx
│   └── products/
│       ├── product-card.tsx
│       └── category-filter.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts       # All tables
│   │   ├── index.ts        # DB client
│   │   └── queries.ts      # Typed queries
│   ├── categories.ts       # Category metadata
│   └── utils.ts
├── scripts/
│   └── seed.ts             # Seed dummy data
├── content/blog/           # MDX (Week 7)
├── drizzle/                # Generated migrations
├── middleware.ts           # Clerk protection
├── drizzle.config.ts
├── tailwind.config.ts
└── package.json
```

## Conventions (for Cursor and humans)

- Always use `cn()` from `@/lib/utils` for conditional classes
- Always use `formatPrice()` for money (DB stores cents as integer)
- Server components by default; `"use client"` only when needed
- Reusable UI primitives go in `components/ui/`
- Feature-specific components go in `components/[feature]/`
- Database queries belong in `lib/db/queries.ts` — never in component files
- Server pages should call queries directly, not via API routes (use API routes only for mutations and webhooks)

## Troubleshooting

**Seed says "duplicate key":** You already seeded once. Delete the rows in Supabase or just continue — the data is there.

**Cannot find module 'tsx':** Run `npm install` again to ensure dev dependencies installed.

**Images not showing:** That's expected — seed data has `thumbnailUrl: null`. Cards show a fallback letter. You'll add real images via the admin panel in Week 6, or upload manually to R2 and update the DB now.

**Clerk redirect to wrong URL:** Verify `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` in `.env.local` match `/sign-in` and `/sign-up`.

**Next.js Image errors with external URLs:** When you add real R2 image URLs, you'll need to whitelist the R2 domain in `next.config.js`. We'll do this in Week 5 when R2 is integrated.
