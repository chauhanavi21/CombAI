import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, User as UserIcon } from "lucide-react";
import { getOrderByIdForAdmin } from "@/lib/db/queries-admin";
import { Badge } from "@/components/ui/badge";
import { RefundButton } from "@/components/admin/refund-button";
import { formatPrice, formatDate } from "@/lib/utils";

const statusVariants: Record<string, "default" | "gold" | "outline"> = {
  paid: "gold",
  pending: "default",
  refunded: "outline",
  failed: "outline",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderByIdForAdmin(id);
  if (!order) notFound();

  return (
    <>
      <header className="mb-10">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 mb-6 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to orders
        </Link>
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="label-eyebrow">Order</p>
              <Badge
                variant={statusVariants[order.status] ?? "default"}
                className="text-[10px] py-0.5 px-2"
              >
                {order.status}
              </Badge>
            </div>
            <h1 className="font-mono text-2xl text-ink-900 tracking-tight">
              #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          {order.status === "paid" && <RefundButton orderId={order.id} />}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line items */}
        <div className="lg:col-span-2 rounded-3xl border border-ink-200 bg-ink-50 overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-200">
            <h2 className="font-display text-lg text-ink-900">Items</h2>
          </div>
          <div className="divide-y divide-ink-200">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="px-6 py-5 flex items-start justify-between gap-4"
              >
                <div>
                  <Link
                    href={`/admin/products/${item.product.id}`}
                    className="font-display text-base text-ink-900 hover:underline underline-offset-4"
                  >
                    {item.product.title}
                  </Link>
                  <p className="text-sm text-ink-600 mt-0.5">
                    {item.variant.name}
                    {item.quantity > 1 && ` · Qty ${item.quantity}`}
                  </p>
                </div>
                <p className="text-sm text-ink-900 whitespace-nowrap">
                  {formatPrice(item.priceCentsAtPurchase)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-ink-200 flex items-center justify-between bg-ink-100/40">
            <p className="text-sm text-ink-600">Total</p>
            <p className="font-display text-xl text-ink-900 tracking-tight">
              {formatPrice(order.amountCents)}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="rounded-3xl border border-ink-200 bg-ink-50 p-6 space-y-4">
          <h2 className="font-display text-lg text-ink-900 pb-3 border-b border-ink-200">
            Customer
          </h2>
          <div>
            <p className="label-eyebrow mb-1">Email</p>
            <p className="text-sm text-ink-900 flex items-center gap-2">
              <Mail size={12} className="text-ink-500" />
              <a
                href={`mailto:${order.email}`}
                className="hover:underline underline-offset-4"
              >
                {order.email}
              </a>
            </p>
          </div>
          {order.user && (
            <div>
              <p className="label-eyebrow mb-1">Account</p>
              <p className="text-sm text-ink-900 flex items-center gap-2">
                <UserIcon size={12} className="text-ink-500" />
                {order.user.name ?? "—"}
              </p>
            </div>
          )}
          <div>
            <p className="label-eyebrow mb-1">Stripe session</p>
            <p className="text-xs text-ink-500 break-all font-mono">
              {order.stripeSessionId ?? "—"}
            </p>
          </div>
          {order.couponCode && (
            <div>
              <p className="label-eyebrow mb-1">Coupon</p>
              <p className="text-sm text-ink-900 font-mono">
                {order.couponCode}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
