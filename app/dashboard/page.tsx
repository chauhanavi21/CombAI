import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { ArrowUpRight, Package, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getOrdersByUserId } from "@/lib/db/queries-orders";
import { Button } from "@/components/ui/button";
import { DownloadButton } from "@/components/dashboard/download-button";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const firstName = clerkUser?.firstName ?? "";

  // Find or create the user record
  let user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user && email) {
    const [created] = await db
      .insert(users)
      .values({
        clerkId,
        email,
        name: clerkUser?.fullName ?? null,
      })
      .returning();
    user = created;
  }

  if (!user) {
    return (
      <div className="container-lux pt-32 pb-30">
        <p className="text-ink-600">
          We couldn't load your dashboard. Please try refreshing.
        </p>
      </div>
    );
  }

  const orders = await getOrdersByUserId(user.id);

  // Flatten into purchases (one row per order item) for cleaner display
  const purchases = orders.flatMap((order) =>
    order.items.map((item) => ({
      orderItemId: item.id,
      orderId: order.id,
      orderDate: order.createdAt,
      productTitle: item.product.title,
      productSlug: item.product.slug,
      productCategory: item.product.category,
      variantName: item.variant.name,
      priceCents: item.priceCentsAtPurchase,
    }))
  );

  return (
    <>
      {/* Header */}
      <section className="container-lux pt-32 pb-12 lg:pt-40">
        <div className="max-w-3xl">
          <p className="label-eyebrow mb-4">Library</p>
          <h1
            className="font-display text-display-md text-ink-900 tracking-tight text-balance"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            {firstName ? (
              <>
                Welcome back,{" "}
                <span className="italic font-light text-ink-700">
                  {firstName}.
                </span>
              </>
            ) : (
              <>
                Your purchase{" "}
                <span className="italic font-light text-ink-700">library.</span>
              </>
            )}
          </h1>
          <p className="mt-6 text-lg text-ink-600 leading-relaxed">
            Every product you've purchased, ready to download or revisit.
          </p>
        </div>
      </section>

      {/* Tabs row */}
      <section className="container-lux pb-8">
        <div className="flex items-center gap-8 border-b border-ink-200">
          <Link
            href="/dashboard"
            className="relative pb-4 text-sm tracking-wide text-ink-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-ink-900"
          >
            Library
          </Link>
          <Link
            href="/dashboard/orders"
            className="pb-4 text-sm tracking-wide text-ink-500 hover:text-ink-700 transition-colors"
          >
            Order history
          </Link>
        </div>
      </section>

      {/* Purchases */}
      <section className="container-lux pb-30">
        {purchases.length === 0 ? (
          <EmptyDashboard />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {purchases.map((purchase) => (
              <div
                key={purchase.orderItemId}
                className="group relative rounded-3xl border border-ink-200 bg-ink-50 p-6 lg:p-8 transition-all duration-500 hover:border-ink-300 hover:shadow-xl hover:shadow-ink-900/5"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center">
                    <Package size={16} className="text-ink-600" />
                  </div>
                  <Link
                    href={`/products/${purchase.productCategory}/${purchase.productSlug}`}
                    className="text-ink-400 hover:text-ink-900 transition-colors"
                    title="View product page"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>

                <p className="label-eyebrow mb-2">{purchase.variantName}</p>
                <h3 className="font-display text-2xl text-ink-900 tracking-tight mb-2">
                  {purchase.productTitle}
                </h3>
                <p className="text-xs text-ink-500 mb-6">
                  Purchased {formatDate(purchase.orderDate)} ·{" "}
                  {formatPrice(purchase.priceCents)}
                </p>

                <DownloadButton orderItemId={purchase.orderItemId} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function EmptyDashboard() {
  return (
    <div className="rounded-3xl border border-ink-200 bg-ink-50 py-30 text-center">
      <div className="w-16 h-16 rounded-full border border-ink-200 flex items-center justify-center mx-auto mb-6">
        <ShoppingBag size={20} className="text-gold-500" />
      </div>
      <h3 className="font-display text-3xl text-ink-900 mb-3 tracking-tight">
        Your library is empty.
      </h3>
      <p className="text-ink-600 max-w-md mx-auto leading-relaxed mb-8">
        Browse the collection to find Notion templates, spreadsheets, and
        guides built for your craft.
      </p>
      <Button asChild>
        <Link href="/products">Browse the shop</Link>
      </Button>
    </div>
  );
}
