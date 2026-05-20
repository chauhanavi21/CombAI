import { db } from "./index";
import {
  products,
  productVariants,
  orders,
  orderItems,
  coupons,
  emailSubscribers,
} from "./schema";
import { desc, eq, sql, and, gte } from "drizzle-orm";

/**
 * Top-level dashboard metrics for the admin home.
 */
export async function getAdminMetrics() {
  const allPaidOrders = await db.query.orders.findMany({
    where: eq(orders.status, "paid"),
    columns: { amountCents: true, createdAt: true },
  });

  const totalRevenueCents = allPaidOrders.reduce(
    (sum, o) => sum + o.amountCents,
    0
  );

  const ordersCount = allPaidOrders.length;
  const avgOrderCents =
    ordersCount > 0 ? Math.round(totalRevenueCents / ordersCount) : 0;

  // Last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentOrders = allPaidOrders.filter(
    (o) => o.createdAt >= thirtyDaysAgo
  );
  const last30RevenueCents = recentOrders.reduce(
    (sum, o) => sum + o.amountCents,
    0
  );

  const publishedProductCount = await db.query.products.findMany({
    where: eq(products.status, "published"),
    columns: { id: true },
  });

  const subscriberCount = await db.query.emailSubscribers.findMany({
    columns: { id: true },
  });

  return {
    totalRevenueCents,
    ordersCount,
    avgOrderCents,
    last30RevenueCents,
    last30OrdersCount: recentOrders.length,
    publishedProductCount: publishedProductCount.length,
    subscriberCount: subscriberCount.length,
  };
}

/**
 * Get all products (any status) for admin product list.
 */
export async function getAllProductsForAdmin() {
  return db.query.products.findMany({
    with: {
      variants: true,
    },
    orderBy: [desc(products.updatedAt)],
  });
}

/**
 * Get a product by ID with variants for admin edit page.
 */
export async function getProductByIdForAdmin(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variants: {
        orderBy: [productVariants.sortOrder],
      },
    },
  });
}

/**
 * Get all orders (any status) for admin order list.
 */
export async function getAllOrdersForAdmin(limit = 100) {
  return db.query.orders.findMany({
    with: {
      items: {
        with: {
          product: true,
          variant: true,
        },
      },
    },
    orderBy: [desc(orders.createdAt)],
    limit,
  });
}

/**
 * Get a single order with full detail for admin order detail page.
 */
export async function getOrderByIdForAdmin(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: {
        with: {
          product: true,
          variant: true,
        },
      },
      user: true,
    },
  });
}

/**
 * Get all coupons for admin list.
 */
export async function getAllCoupons() {
  return db.query.coupons.findMany({
    orderBy: [desc(coupons.createdAt)],
  });
}

/**
 * Get all email subscribers for admin export.
 */
export async function getAllSubscribers() {
  return db.query.emailSubscribers.findMany({
    orderBy: [desc(emailSubscribers.subscribedAt)],
  });
}

/**
 * Recent orders for dashboard home (top 5).
 */
export async function getRecentOrdersForAdmin(limit = 5) {
  return db.query.orders.findMany({
    where: eq(orders.status, "paid"),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
    orderBy: [desc(orders.createdAt)],
    limit,
  });
}
