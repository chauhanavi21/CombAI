import Link from "next/link";
import { Receipt } from "lucide-react";
import { getAllOrdersForAdmin } from "@/lib/db/queries-admin";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

const statusVariants: Record<string, "default" | "gold" | "outline"> = {
  paid: "gold",
  pending: "default",
  refunded: "outline",
  failed: "outline",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersForAdmin();

  return (
    <>
      <header className="mb-12">
        <p className="label-eyebrow mb-3">Orders</p>
        <h1 className="font-display text-display-sm text-ink-900 tracking-tight">
          All orders
        </h1>
        <p className="mt-2 text-ink-600">
          {orders.length} {orders.length === 1 ? "order" : "orders"} on record
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-ink-200 bg-ink-50 py-20 text-center">
          <Receipt className="mx-auto mb-4 text-ink-300" size={32} />
          <p className="text-ink-600">No orders yet.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-ink-200 bg-ink-50 overflow-hidden">
          <ul className="divide-y divide-ink-200">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-ink-100/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-xs text-ink-500">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <Badge
                        variant={statusVariants[order.status] ?? "default"}
                        className="text-[10px] py-0.5 px-2"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-ink-900 truncate">
                      {order.items.length === 0
                        ? "—"
                        : order.items.length === 1
                          ? order.items[0]?.product.title
                          : `${order.items[0]?.product.title} +${order.items.length - 1} more`}
                    </p>
                    <p className="text-xs text-ink-500 truncate mt-0.5">
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
        </div>
      )}
    </>
  );
}
