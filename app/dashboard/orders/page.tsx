import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getOrdersByUserId } from "@/lib/db/queries-orders";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order history",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in?redirect_url=/dashboard/orders");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  const orders = user ? await getOrdersByUserId(user.id) : [];

  return (
    <>
      <section className="container-lux pt-32 pb-12 lg:pt-40">
        <div className="max-w-3xl">
          <p className="label-eyebrow mb-4">Receipts</p>
          <h1
            className="font-display text-display-md text-ink-900 tracking-tight text-balance"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            Order{" "}
            <span className="italic font-light text-ink-700">history.</span>
          </h1>
        </div>
      </section>

      <section className="container-lux pb-8">
        <div className="flex items-center gap-8 border-b border-ink-200">
          <Link
            href="/dashboard"
            className="pb-4 text-sm tracking-wide text-ink-500 hover:text-ink-700 transition-colors"
          >
            Library
          </Link>
          <Link
            href="/dashboard/orders"
            className="relative pb-4 text-sm tracking-wide text-ink-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-ink-900"
          >
            Order history
          </Link>
        </div>
      </section>

      <section className="container-lux pb-30">
        {orders.length === 0 ? (
          <div className="py-30 text-center">
            <p className="text-ink-600">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-ink-200 bg-ink-50 p-6 lg:p-8"
              >
                <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-ink-200">
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
                      Date
                    </p>
                    <p className="text-sm text-ink-900">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-display text-lg text-ink-900 tracking-tight">
                          {item.product.title}
                        </p>
                        <p className="text-sm text-ink-600">
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

                <div className="mt-6 pt-6 border-t border-ink-200 flex items-center justify-between">
                  <p className="text-sm text-ink-600">Total</p>
                  <p className="font-display text-xl text-ink-900 tracking-tight">
                    {formatPrice(order.amountCents)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
