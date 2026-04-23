# Luxe — Premium Digital Products Storefront

Week 1 foundation. Next.js 15 + TypeScript + Tailwind + Drizzle + Clerk + Stripe + R2 + Resend.

## Week 1 Setup Steps

### 1. Initialize project

```bash
npx create-next-app@latest luxe-store --typescript --tailwind --app --use-npm --no-src-dir --import-alias "@/*" --eslint
cd luxe-store
```

### 2. Copy Week 1 files into the project

Copy every file from this bundle into the matching path in your new project (overwrite when asked).

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in values from:
- **Supabase** → Project Settings → Database → Connection string (URI, not pooler for now)
- **Clerk** → API Keys in dashboard
- **Stripe** → Developers → API keys (use test keys)
- **Cloudflare R2** → R2 → Manage API tokens (create one bucket named `luxe-store-products`)
- **Resend** → API Keys (verify your sending domain later)

### 5. Set up the database

```bash
npm run db:generate
npm run db:push
```

This creates all tables in your Supabase database.

To verify:
```bash
npm run db:studio
```

Opens Drizzle Studio in browser to inspect tables.

### 6. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`. You should see the premium homepage.

### 7. Deploy skeleton to Vercel (optional Week 1, recommended)

```bash
npm install -g vercel
vercel
```

Follow prompts. Add all env vars to Vercel dashboard.

## What's in Week 1

- ✅ Next.js 15 App Router + TypeScript + Tailwind
- ✅ Premium design system (colors, fonts, components)
- ✅ Drizzle schema with 9 tables
- ✅ Supabase connection
- ✅ Clerk auth (buyer accounts + admin role flag)
- ✅ Navigation with scroll-aware backdrop blur
- ✅ Footer with newsletter signup
- ✅ Homepage with hero, categories, philosophy sections
- ✅ Fraunces (display serif) + Inter (body) fonts
- ✅ Premium color tokens (ink + gold palette)

## What's NOT in Week 1 (coming next)

- ❌ Product pages (Week 3)
- ❌ Stripe checkout (Week 4)
- ❌ Buyer dashboard (Week 5)
- ❌ Admin panel (Week 6)
- ❌ Blog (Week 7)
- ❌ Real product data (Week 7)

## File Structure

```
luxe-store/
├── app/
│   ├── layout.tsx          # Root layout with Clerk + fonts
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles + design tokens
├── components/
│   ├── marketing/
│   │   ├── nav.tsx
│   │   └── footer.tsx
│   └── ui/                 # shadcn components (add as needed)
├── lib/
│   ├── db/
│   │   ├── schema.ts       # Drizzle tables
│   │   └── index.ts        # DB client
│   └── utils.ts            # cn, formatPrice, etc.
├── content/
│   └── blog/               # MDX posts (Week 7)
├── drizzle/                # Generated migrations
├── middleware.ts           # Clerk route protection
├── drizzle.config.ts
├── tailwind.config.ts
└── package.json
```

## Troubleshooting

**Drizzle push fails:** Check DATABASE_URL uses the direct connection (not pooler) for `db:push`. For runtime, the pooler URL works.

**Clerk redirect loops:** Make sure `NEXT_PUBLIC_CLERK_SIGN_IN_URL` matches your actual sign-in route.

**Fonts look wrong:** Clear `.next` cache and restart dev server. Google Fonts sometimes need a fresh fetch.

**Tailwind v4 vs v3:** This uses v3. If you initialized with v4, downgrade: `npm i -D tailwindcss@^3.4.0`.
