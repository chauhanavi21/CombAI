import { randomBytes } from "crypto";
import { db } from "./index";
import { downloads, orderItems, orders, productVariants } from "./schema";
import { eq, and } from "drizzle-orm";

/**
 * Download tokens are random 32-byte hex strings.
 * They live in the `downloads` table with an expiry, and are emailed to buyers.
 * The download URL pattern is: /api/download/{token}
 */
export function generateDownloadToken(): string {
  return randomBytes(32).toString("hex");
}

export type DownloadInfo = {
  fileUrl: string | null;
  externalUrl: string | null;
  productTitle: string;
  variantName: string;
  expired: boolean;
};

/**
 * Look up a download token, validate it, and return the file info if valid.
 * Returns null if token doesn't exist; sets expired=true if past expiry.
 */
export async function resolveDownloadToken(
  token: string
): Promise<DownloadInfo | null> {
  const download = await db.query.downloads.findFirst({
    where: eq(downloads.downloadToken, token),
    with: {
      orderItem: {
        with: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!download || !download.orderItem) return null;

  const expired = new Date() > download.expiresAt;

  return {
    fileUrl: download.orderItem.variant.fileUrl,
    externalUrl: download.orderItem.variant.externalUrl,
    productTitle: download.orderItem.product.title,
    variantName: download.orderItem.variant.name,
    expired,
  };
}

/**
 * Create download tokens for every item in an order.
 * Called by the webhook after a successful payment.
 * Default expiry: 90 days. Buyers re-generate fresh tokens via dashboard.
 */
export async function createDownloadTokensForOrder(
  orderId: string,
  expiryDays = 90
): Promise<Array<{ orderItemId: string; token: string }>> {
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
  });

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  const tokensCreated: Array<{ orderItemId: string; token: string }> = [];

  for (const item of items) {
    const token = generateDownloadToken();
    await db.insert(downloads).values({
      orderItemId: item.id,
      userId: order?.userId ?? null,
      downloadToken: token,
      expiresAt,
    });
    tokensCreated.push({ orderItemId: item.id, token });
  }

  return tokensCreated;
}

/**
 * Get an active download token for an order item, or create a fresh one if none exist
 * or all are expired. Used by the dashboard "Download" button to give buyers
 * a current link without requiring them to find the original email.
 */
export async function getOrCreateDownloadToken(
  orderItemId: string,
  userId: string | null,
  expiryDays = 30
): Promise<string> {
  // Check for an active (not expired) token first
  const existing = await db.query.downloads.findMany({
    where: eq(downloads.orderItemId, orderItemId),
  });

  const active = existing.find((d) => new Date() < d.expiresAt);
  if (active) return active.downloadToken;

  // Create a fresh one
  const token = generateDownloadToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  await db.insert(downloads).values({
    orderItemId,
    userId,
    downloadToken: token,
    expiresAt,
  });

  return token;
}

/**
 * Increment download counter — useful for analytics and abuse detection.
 */
export async function recordDownload(token: string): Promise<void> {
  await db
    .update(downloads)
    .set({
      lastDownloadedAt: new Date(),
    })
    .where(eq(downloads.downloadToken, token));

  // Increment count using a separate query
  // (Drizzle doesn't have a clean inc helper for postgres-js without sql template)
  const current = await db.query.downloads.findFirst({
    where: eq(downloads.downloadToken, token),
  });
  if (current) {
    await db
      .update(downloads)
      .set({ downloadCount: current.downloadCount + 1 })
      .where(eq(downloads.downloadToken, token));
  }
}
