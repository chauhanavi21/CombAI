"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth-admin";
import { slugify } from "@/lib/utils";

const variantSchema = z.object({
  id: z.string().optional(), // present when editing existing variant
  name: z.string().min(1, "Name required").max(100),
  description: z.string().max(500).optional().nullable(),
  priceCents: z.number().int().min(100, "Min $1.00").max(100000000),
  fileUrl: z.string().optional().nullable(),
  externalUrl: z.string().url().or(z.literal("")).optional().nullable(),
  deliveryType: z.enum(["file", "link", "both"]).default("file"),
  includedItems: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

const productSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  slug: z.string().min(1, "Slug required").max(200),
  shortDescription: z.string().max(300).optional().nullable(),
  description: z.string().min(1, "Description required"),
  category: z.enum(["notion", "spreadsheet", "guide", "prompt", "saas"]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  compareAtPriceCents: z.number().int().min(0).optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  galleryUrls: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  variants: z.array(variantSchema).min(1, "At least one variant required"),
});

export type ProductFormInput = z.infer<typeof productSchema>;

export async function createProductAction(input: ProductFormInput) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.title);

  // Check slug uniqueness
  const existing = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });
  if (existing) {
    return { error: `Slug "${slug}" is already in use` };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [createdProduct] = await tx
        .insert(products)
        .values({
          slug,
          title: data.title,
          description: data.description,
          shortDescription: data.shortDescription ?? null,
          category: data.category,
          status: data.status,
          compareAtPriceCents: data.compareAtPriceCents ?? null,
          thumbnailUrl: data.thumbnailUrl ?? null,
          galleryUrls: data.galleryUrls,
          features: data.features,
          featured: data.featured,
        })
        .returning();

      // Insert variants — ensure exactly one is marked default
      const hasDefault = data.variants.some((v) => v.isDefault);
      for (const [idx, variant] of data.variants.entries()) {
        await tx.insert(productVariants).values({
          productId: createdProduct.id,
          name: variant.name,
          description: variant.description ?? null,
          priceCents: variant.priceCents,
          fileUrl: variant.fileUrl ?? null,
          externalUrl: variant.externalUrl || null,
          deliveryType: variant.deliveryType,
          includedItems: variant.includedItems,
          isDefault: hasDefault ? variant.isDefault : idx === 0,
          sortOrder: variant.sortOrder,
        });
      }

      return createdProduct;
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${data.category}`);

    return { success: true, productId: result.id };
  } catch (err) {
    console.error("Create product failed:", err);
    return { error: "Failed to create product. Check console." };
  }
}

export async function updateProductAction(
  productId: string,
  input: ProductFormInput
) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.title);

  // Check slug uniqueness (excluding self)
  const existing = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });
  if (existing && existing.id !== productId) {
    return { error: `Slug "${slug}" is already in use` };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          slug,
          title: data.title,
          description: data.description,
          shortDescription: data.shortDescription ?? null,
          category: data.category,
          status: data.status,
          compareAtPriceCents: data.compareAtPriceCents ?? null,
          thumbnailUrl: data.thumbnailUrl ?? null,
          galleryUrls: data.galleryUrls,
          features: data.features,
          featured: data.featured,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      // Delete variants not in the new list
      const existingVariants = await tx.query.productVariants.findMany({
        where: eq(productVariants.productId, productId),
      });

      const submittedIds = new Set(
        data.variants.map((v) => v.id).filter(Boolean)
      );
      const toDelete = existingVariants.filter(
        (v) => !submittedIds.has(v.id)
      );
      for (const v of toDelete) {
        await tx
          .delete(productVariants)
          .where(eq(productVariants.id, v.id));
      }

      // Upsert variants
      const hasDefault = data.variants.some((v) => v.isDefault);
      for (const [idx, variant] of data.variants.entries()) {
        const isDefault = hasDefault ? variant.isDefault : idx === 0;
        if (variant.id) {
          await tx
            .update(productVariants)
            .set({
              name: variant.name,
              description: variant.description ?? null,
              priceCents: variant.priceCents,
              fileUrl: variant.fileUrl ?? null,
              externalUrl: variant.externalUrl || null,
              deliveryType: variant.deliveryType,
              includedItems: variant.includedItems,
              isDefault,
              sortOrder: variant.sortOrder,
            })
            .where(eq(productVariants.id, variant.id));
        } else {
          await tx.insert(productVariants).values({
            productId,
            name: variant.name,
            description: variant.description ?? null,
            priceCents: variant.priceCents,
            fileUrl: variant.fileUrl ?? null,
            externalUrl: variant.externalUrl || null,
            deliveryType: variant.deliveryType,
            includedItems: variant.includedItems,
            isDefault,
            sortOrder: variant.sortOrder,
          });
        }
      }
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/products");
    revalidatePath(`/products/${data.category}`);
    revalidatePath(`/products/${data.category}/${slug}`);

    return { success: true };
  } catch (err) {
    console.error("Update product failed:", err);
    return { error: "Failed to update product. Check console." };
  }
}

export async function deleteProductAction(productId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  try {
    // Note: schema's onDelete cascades variants. Order items reference variant with onDelete=restrict,
    // so we'll fail if there are existing orders. That's intentional — archive instead of delete.
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });
    if (!product) return { error: "Product not found" };

    await db.delete(products).where(eq(products.id, productId));

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.category}`);

    return { success: true };
  } catch (err) {
    console.error("Delete product failed:", err);
    return {
      error:
        "Failed to delete. This product may have existing orders — archive it instead.",
    };
  }
}
