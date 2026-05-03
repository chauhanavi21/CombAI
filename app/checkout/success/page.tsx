import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Download, ArrowUpRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderBySessionId } from "@/lib/db/queries-orders";
import { formatPrice, formatDate } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

// Success page is dynamic — no caching, always fresh
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    notFound();
  }

  // Try to find the order. The webhook may not have processed yet,
  // so we retry a few times before giving up. (Stripe redirects faster than webhooks.)
  let order = await getOrderBySessionId(session_id);

  if (!order) {
    // Wait briefly and try once more — webhook usually arrives within 1-2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    order = await getOrderBySessionId(session_id);
  }

  return (
    <div className="container-lux pt-32 pb-30 lg:pt-40">
      <div className="max-w-2xl mx-auto">
        {/* Success indicator */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center animate-fade-in">
            <Check size={28} className="text-gold-700" strokeWidth={2.5} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="label-eyebrow mb-4">Order confirmed</p>
          <h1
            className="font-display text-display-md text-ink-900 tracking-tight text-balance mb-4"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            Thank you for your purchase.
          </h1>
          <p className="text-lg text-ink-600 leading-relaxed text-balance">
            Your order is confirmed. A receipt and download links have been sent
            to {order?.email ? <strong>{order.email}</strong> : "your email"}.
          </p>
        </div>

        {/* Order details */}
        {order ? (
          <div className="rounded-3xl border border-ink-200 bg-ink-50 overflow-hidden">
            {/* Header row */}
            <div className="px-8 py-6 border-b border-ink-200 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-500 mb-1">
                  Order
                </p>
                <p className="font-mono text-sm text-ink-900">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-ink-500 mb-1">
                  Placed
                </p>
                <p className="text-sm text-ink-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Line items */}
            <div className="px-8 py-6 space-y-6">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-6"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl text-ink-900 tracking-tight mb-1">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-ink-600 mb-3">
                      {item.variant.name}
                      {item.quantity > 1 && ` · Qty ${item.quantity}`}
                    </p>

                    {/* Download button — placeholder until Week 5 */}
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled
                      title="Real downloads activate in Week 5 with R2 file storage"
                    >
                      <Download size={14} />
                      Download
                    </Button>
                  </div>
                  <p className="font-display text-lg text-ink-900 tracking-tight whitespace-nowrap">
                    {formatPrice(item.priceCentsAtPurchase)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="px-8 py-6 border-t border-ink-200 flex items-center justify-between">
              <p className="text-sm text-ink-600">Total paid</p>
              <p className="font-display text-2xl text-ink-900 tracking-tight">
                {formatPrice(order.amountCents)}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-ink-200 bg-ink-50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink-100 mb-4">
              <Mail size={20} className="text-ink-600" />
            </div>
            <h3 className="font-display text-xl text-ink-900 mb-2">
              Processing your order
            </h3>
            <p className="text-sm text-ink-600 leading-relaxed max-w-md mx-auto">
              Your payment was successful, but the order details are still
              processing. Refresh this page in a moment, or check your email —
              the receipt is on its way.
            </p>
          </div>
        )}

        {/* Next steps */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard">
              View dashboard
              <ArrowUpRight size={14} />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/products">Keep browsing</Link>
          </Button>
        </div>

        {/* Support note */}
        <p className="mt-12 text-center text-sm text-ink-500 leading-relaxed">
          Questions about your order? Reply to your receipt email and we'll get
          back to you within 24 hours.
        </p>
      </div>
    </div>
  );
}
