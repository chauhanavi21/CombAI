## Luxe — Premium Digital Products Storefront

**Status:** Week 1–5 complete. **Full purchase-to-delivery loop works.** Buyers pay, get an email with download links, can re-download anytime from their dashboard.

## What's new in Week 5

- ☁️ **Cloudflare R2** integration for file storage
- 🔐 **Signed URL generation** — 15-minute expiring download links
- 📧 **Email delivery** via Resend with branded React Email template
- 📚 **Buyer dashboard** at `/dashboard` showing all purchases
- 🧾 **Order history** at `/dashboard/orders`
- 🔄 **Re-download support** — fresh tokens generated on demand
- 📤 **Upload utility** — `npm run upload:file` to push real product files to R2

## Setup additions (one time)

If you've been working through the previous weeks, you already have R2 and Resend env vars set. The new file is the upload utility, which you'll use to put a real test file in R2.

### Test the full flow with a real file

1. Create a test file anywhere on your machine, e.g. a PDF:
   ```bash
   echo "This is the Founder OS template." > /tmp/founder-os.pdf
   ```

2. Upload it and link to the seeded "Founder OS" product:
   ```bash
   npm run upload:file -- founder-os /tmp/founder-os.pdf
   ```

   You'll see:
   ```
   📂 Reading /tmp/founder-os.pdf...
   ℹ️  Using first variant "Standard" of product "Founder OS"
   ☁️  Uploading to R2 at: products/abc.../standard/1234-founder-os.pdf
   ✅ Uploaded and linked to variant Standard
   ```

3. Now buy the Standard variant of Founder OS via the storefront. Your email
   will arrive with a real working download link.

## Daily dev workflow (no change from Week 4)

```bash
# Terminal 1
npm run dev

# Terminal 2 (for Stripe webhooks)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Test the complete fulfillment flow

1. Visit http://localhost:3000/products/notion/founder-os
2. Pick a variant → click Buy → use card `4242 4242 4242 4242`
3. Stripe redirects to `/checkout/success?session_id=...`
4. **Watch Terminal 2** — you'll see `checkout.session.completed`
5. **Watch Terminal 1 (the app)** — you'll see:
   - Order created log
   - "📧 Purchase confirmation sent to..."
6. **Check your email** — you should receive the branded email with download buttons
7. Click a download button in the email → file downloads
8. Visit `/dashboard` — your purchase appears with a Download button
9. Click Download in the dashboard → fresh signed URL opens, file downloads
10. Run `npm run db:studio` → check `downloads` table — you'll see the tokens with `lastDownloadedAt` timestamps

## What's NOT in Week 5 (coming Week 6)

- ❌ Admin panel — you can't yet edit products from the UI (use `db:studio` for now)
- ❌ Product image upload from admin (use the upload utility for now)
- ❌ Coupon management UI

## File Structure (new in Week 5)

```
luxe-store/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts                    # (W4)
│   │   ├── webhooks/stripe/route.ts             # UPDATED: now sends emails + creates tokens
│   │   ├── download/[token]/route.ts            # NEW: serves signed URLs
│   │   └── dashboard/refresh-download/route.ts  # NEW: regenerate token from dashboard
│   ├── checkout/success/page.tsx                # UPDATED: real download buttons
│   └── dashboard/
│       ├── page.tsx                             # NEW: library
│       └── orders/
│           └── page.tsx                         # NEW: order history
├── components/
│   └── dashboard/
│       └── download-button.tsx                  # NEW: client-side download button
├── lib/
│   ├── r2.ts                                    # NEW: R2 client + signed URLs
│   ├── db/
│   │   ├── queries-downloads.ts                 # NEW: token management
│   │   └── ...
│   └── email/
│       ├── client.ts                            # NEW: Resend client
│       ├── send.ts                              # NEW: high-level send fn
│       └── templates/
│           └── purchase-confirmation.tsx        # NEW: React Email template
└── scripts/
    └── upload-product-file.ts                   # NEW: upload utility
```

## How the delivery flow works (mental model)

```
┌──────────────────────────────────────────────────────────────────┐
│  Buyer flow                                                      │
└──────────────────────────────────────────────────────────────────┘

1. Buyer pays via Stripe Checkout
2. Stripe sends `checkout.session.completed` webhook to /api/webhooks/stripe
3. Webhook handler:
   a. Creates order in DB (transactional)
   b. Generates download tokens (90-day expiry) in `downloads` table
   c. Builds download URLs: /api/download/{token}
   d. Sends email via Resend with these URLs
4. Buyer clicks download link in email
5. /api/download/[token]:
   a. Looks up token in DB
   b. Checks expiry
   c. Generates fresh 15-min signed R2 URL
   d. Redirects browser to signed URL
   e. Browser downloads the file from R2 directly
6. Buyer can also visit /dashboard, click Download
   → /api/dashboard/refresh-download generates a fresh token
   → same /api/download/[token] flow
```

## Build Plan

- ✅ **Week 1:** Foundation, design system, schema, auth
- ✅ **Week 2:** UI primitives, listing pages
- ✅ **Week 3:** Product detail page with variants
- ✅ **Week 4:** Stripe checkout, webhooks, success page
- ✅ **Week 5:** R2 storage, signed URLs, dashboard, email delivery
- ⬜ **Week 6:** Admin panel for products, orders, coupons
- ⬜ **Week 7:** Blog, real product inventory
- ⬜ **Week 8:** Polish, SEO, launch

## Conventions

- All download URLs go through `/api/download/{token}` — never expose R2 URLs directly
- Tokens expire (90 days from email, 30 days when generated from dashboard)
- Signed R2 URLs expire in 15 minutes (preventing link sharing)
- Email failures don't break the webhook — buyer can re-download from dashboard
- File keys in R2 follow pattern: `products/{productId}/{variantSlug}/{timestamp}-{filename}`

## Troubleshooting

**Email not arriving:** Check Resend dashboard → Logs. If sender is `onboarding@resend.dev`, emails to your own Resend account always work but emails to other addresses may be filtered. Verify a domain in Resend for production.

**Download returns "File not yet available":** The variant's `file_url` is null. Run the upload utility:
```bash
npm run upload:file -- <product-slug> <local-file>
```

**Download returns "Download link has expired":** Token is past its expiry. Sign in to dashboard and click Download — generates a fresh token.

**R2 access denied:** Verify token has `Object Read & Write` permission scoped to your bucket. If you used "Read only", recreate the token.

**"R2_BUCKET_NAME is not configured":** Check `.env.local` has all 5 R2 vars: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`. Restart dev server after changes.

**Webhook order created but no email:** Check Terminal 1 for "Failed to send" log. Most common cause: `RESEND_API_KEY` is not set or invalid.

**Dashboard shows no purchases but I bought something:** Check `users` table — your Clerk ID should match. If you bought as guest before signing up, the order's `userId` is null. Sign in with the same email and an admin tool would normally re-link them — for now, manually update via `db:studio`.

## Going to production preview

- Verify a domain in Resend before launch — `onboarding@resend.dev` is dev-only
- Set up production webhook in Stripe Dashboard pointing to your prod URL
- R2 keys can be the same in dev and prod (the URL is private), or set up a prod bucket
- Add Sentry or LogTail for download error tracking (Week 8)
