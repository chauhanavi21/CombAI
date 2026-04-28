import { db } from "./index";
import { products, productVariants } from "./schema";
import { eq, and, desc, asc, ne } from "drizzle-orm";
import type { Product, ProductVariant } from "./schema";

export type ProductCategory =
  | "notion"
  | "spreadsheet"
  | "guide"
  | "prompt"
  | "saas";

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

/**
 * Get all published products, optionally filtered by category.
 * Includes variants ordered by sortOrder.
 */
export async function getPublishedProducts(
  category?: ProductCategory
): Promise<ProductWithVariants[]> {
  const result = await db.query.products.findMany({
    where: category
      ? and(eq(products.status, "published"), eq(products.category, category))
      : eq(products.status, "published"),
    with: {
      variants: {
        orderBy: [asc(productVariants.sortOrder)],
      },
    },
    orderBy: [desc(products.featured), desc(products.createdAt)],
  });

  return result;
}

/**
 * Get a single product by slug, including all variants.
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductWithVariants | null> {
  const result = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, "published")),
    with: {
      variants: {
        orderBy: [asc(productVariants.sortOrder)],
      },
    },
  });

  return result ?? null;
}

/**
 * Get featured products for homepage.
 */
export async function getFeaturedProducts(
  limit = 3
): Promise<ProductWithVariants[]> {
  const result = await db.query.products.findMany({
    where: and(eq(products.status, "published"), eq(products.featured, true)),
    with: {
      variants: {
        orderBy: [asc(productVariants.sortOrder)],
      },
    },
    orderBy: [desc(products.createdAt)],
    limit,
  });

  return result;
}

/**
 * Get related products in the same category, excluding the current one.
 */
export async function getRelatedProducts(
  category: ProductCategory,
  excludeProductId: string,
  limit = 3
): Promise<ProductWithVariants[]> {
  const result = await db.query.products.findMany({
    where: and(
      eq(products.status, "published"),
      eq(products.category, category),
      ne(products.id, excludeProductId)
    ),
    with: {
      variants: {
        orderBy: [asc(productVariants.sortOrder)],
      },
    },
    orderBy: [desc(products.featured), desc(products.createdAt)],
    limit,
  });

  return result;
}

/**
 * Get count of products per category for nav badges, etc.
 */
export async function getCategoryCounts(): Promise<Record<ProductCategory, number>> {
  const all = await db.query.products.findMany({
    where: eq(products.status, "published"),
    columns: { category: true },
  });

  const counts: Record<ProductCategory, number> = {
    notion: 0,
    spreadsheet: 0,
    guide: 0,
    prompt: 0,
    saas: 0,
  };

  for (const p of all) {
    counts[p.category]++;
  }

  return counts;
}

/**
 * Get the default variant for a product (used as the "shown" price on cards).
 */
export function getDefaultVariant(
  product: ProductWithVariants
): ProductVariant | null {
  if (product.variants.length === 0) return null;
  return product.variants.find((v) => v.isDefault) ?? product.variants[0];
}

/**
 * Get the price range for a product with multiple variants.
 * Returns { min, max } in cents, or null if no variants.
 */
export function getPriceRange(
  product: ProductWithVariants
): { min: number; max: number } | null {
  if (product.variants.length === 0) return null;
  const prices = product.variants.map((v) => v.priceCents);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Get all valid product slugs for static generation.
 */
export async function getAllProductSlugs(): Promise<
  Array<{ category: ProductCategory; slug: string }>
> {
  const result = await db.query.products.findMany({
    where: eq(products.status, "published"),
    columns: { slug: true, category: true },
  });
  return result;
}
