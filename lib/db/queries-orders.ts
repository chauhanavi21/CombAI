import { db } from "./index";
import { orders, orderItems, products, productVariants, users } from "./schema";
import { eq, desc, and } from "drizzle-orm";
import type { Order, OrderItem, Product, ProductVariant } from "./schema";

export type OrderItemWithProduct = OrderItem & {
  product: Product;
  variant: ProductVariant;
};

export type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
};

/**
 * Get an order by Stripe session ID. Used on the success page.
 */
export async function getOrderBySessionId(
  sessionId: string
): Promise<OrderWithItems | null> {
  const result = await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, sessionId),
    with: {
      items: {
        with: {
          product: true,
          variant: true,
        },
      },
    },
  });

  return result ?? null;
}

/**
 * Get all orders for a user (by Clerk ID).
 */
export async function getOrdersByUserId(
  userId: string
): Promise<OrderWithItems[]> {
  const result = await db.query.orders.findMany({
    where: and(eq(orders.userId, userId), eq(orders.status, "paid")),
    with: {
      items: {
        with: {
          product: true,
          variant: true,
        },
      },
    },
    orderBy: [desc(orders.createdAt)],
  });

  return result;
}

/**
 * Find or create a user from Clerk data.
 * Used during checkout to associate orders with users.
 */
export async function findOrCreateUser(
  clerkId: string,
  email: string,
  name?: string
): Promise<string> {
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (existing) return existing.id;

  const [created] = await db
    .insert(users)
    .values({
      clerkId,
      email,
      name: name ?? null,
    })
    .returning();

  return created.id;
}
