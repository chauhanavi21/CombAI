import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Mail,
  ArrowUpRight,
  Tag,
  Receipt,
} from "lucide-react";
import {
  getAdminMetrics,
  getRecentOrdersForAdmin,
} from "@/lib/db/queries-admin";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminHomePage() {
  const [metrics, recentOrders] = await Promise.all([
    getAdminMetrics(),
    getRecentOrdersForAdmin(5),
  ]);

  return (
    <>
      <header className="mb-12">
        <p className="label-eyebrow mb-3">Overview</p>
        <h1
          className="font-display text-display-sm text-ink-900 tracking-tight"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          Hello there.
        </h1>
        <p className="mt-3 text-ink-600">
          Here's what's happening across your store.
        </p>
      </header>

      {/* Top metric cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <MetricCard
          label="Total revenue"
          value={formatPrice(metrics.totalRevenueCents)}
          subtext={`${metrics.ordersCount} ${metrics.ordersCount === 1 ? "order" : "orders"} all-time`}
          icon={TrendingUp}
        />
        <MetricCard
          label="Last 30 days"
          value={formatPrice(metrics.last30RevenueCents)}
          subtext={`${metrics.last30OrdersCount} ${metrics.last30OrdersCount === 1 ? "order" : "orders"}`}
          icon={ShoppingBag}
        />
        <MetricCard
          label="Avg. order value"
          value={formatPrice(metrics.avgOrderCents)}
          subtext="across paid orders"
          icon={Receipt}
        />
        <MetricCard
          label="Subscribers"
          value={metrics.subscriberCount.toString()}
          subtext={`${metrics.publishedProductCount} products live`}
          icon={Mail}
        />
      </section>

      {/* Recent orders */}
      <section className="rounded-3xl border border-ink-200 bg-ink-50 overflow-hidden">
        <div className="px-6 lg:px-8 py-5 border-b border-ink-200 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink-900 tracking-tight">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-ink-700 hover:text-ink-900 flex items-center gap-1 group"
          >
            View all
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <Package className="mx-auto mb-4 text-ink-300" size={32} />
            <p className="text-ink-600">No paid orders yet.</p>
            <p className="text-sm text-ink-500 mt-1">
              They'll appear here once buyers start checking out.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-200">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-6 lg:px-8 py-4 hover:bg-ink-100/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-ink-500 mb-0.5">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-ink-900 truncate">
                      {order.items.length === 1
                        ? order.items[0]?.product.title
                        : `${order.items[0]?.product.title} +${order.items.length - 1} more`}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5 truncate">
                      {order.email}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-base text-ink-900">
                      {formatPrice(order.amountCents)}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products/new"
          className="group rounded-3xl border border-ink-200 bg-ink-50 p-6 hover:border-ink-400 transition-all duration-300"
        >
          <Package size={20} className="text-ink-700 mb-3" />
          <h3 className="font-display text-lg text-ink-900 mb-1 tracking-tight">
            Add a product
          </h3>
          <p className="text-sm text-ink-600">
            Create a new product with one or more pricing tiers.
          </p>
        </Link>
        <Link
          href="/admin/coupons/new"
          className="group rounded-3xl border border-ink-200 bg-ink-50 p-6 hover:border-ink-400 transition-all duration-300"
        >
          <Tag size={20} className="text-ink-700 mb-3" />
          <h3 className="font-display text-lg text-ink-900 mb-1 tracking-tight">
            Create coupon
          </h3>
          <p className="text-sm text-ink-600">
            Generate promo codes for campaigns or VIPs.
          </p>
        </Link>
      </section>
    </>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;
}) {
  return (
    <div className="rounded-3xl border border-ink-200 bg-ink-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="label-eyebrow">{label}</p>
        <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center">
          <Icon className="text-ink-600" size={14} />
        </div>
      </div>
      <p className="font-display text-3xl text-ink-900 tracking-tight mb-1">
        {value}
      </p>
      <p className="text-xs text-ink-500">{subtext}</p>
    </div>
  );
}
