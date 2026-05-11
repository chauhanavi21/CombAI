/**
 * Upload a local file to R2 and link it to a product variant.
 *
 * Usage:
 *   tsx scripts/upload-product-file.ts <variant-slug-or-id> <local-file-path>
 *
 * Example:
 *   tsx scripts/upload-product-file.ts founder-os ./test-files/founder-os.pdf
 *   (matches the first variant of the product with slug "founder-os")
 *
 *   OR by exact variant ID:
 *   tsx scripts/upload-product-file.ts 550e8400-e29b-41d4-a716-446655440000 ./file.pdf
 *
 * This uploads the file to R2 and updates the variant's file_url field.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFileSync } from "fs";
import { basename, extname } from "path";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { products, productVariants } from "../lib/db/schema";
import { uploadFile, buildProductFileKey } from "../lib/r2";

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".txt": "text/plain",
    ".md": "text/markdown",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

async function main() {
  const [, , identifier, filePath] = process.argv;

  if (!identifier || !filePath) {
    console.error("Usage: tsx scripts/upload-product-file.ts <product-slug-or-variant-id> <file-path>");
    process.exit(1);
  }

  // Read the file
  console.log(`📂 Reading ${filePath}...`);
  const fileBuffer = readFileSync(filePath);
  const filename = basename(filePath);
  const ext = extname(filename);
  const mimeType = getMimeType(ext);

  // Find the variant — accept either a product slug (uses first variant) or a variant UUID
  let variant: typeof productVariants.$inferSelect | undefined;
  let productId: string;

  if (identifier.includes("-") && identifier.length === 36) {
    // Looks like a UUID
    variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, identifier),
    });
    if (!variant) {
      console.error(`❌ Variant ${identifier} not found`);
      process.exit(1);
    }
    productId = variant.productId;
  } else {
    // Treat as product slug
    const product = await db.query.products.findFirst({
      where: eq(products.slug, identifier),
      with: { variants: true },
    });
    if (!product) {
      console.error(`❌ Product with slug "${identifier}" not found`);
      process.exit(1);
    }
    if (product.variants.length === 0) {
      console.error(`❌ Product "${identifier}" has no variants`);
      process.exit(1);
    }
    variant = product.variants[0];
    productId = product.id;
    console.log(
      `ℹ️  Using first variant "${variant.name}" of product "${product.title}"`
    );
  }

  // Build R2 key
  const r2Key = buildProductFileKey(productId, variant.name, filename);
  console.log(`☁️  Uploading to R2 at: ${r2Key}`);

  // Upload
  await uploadFile(r2Key, fileBuffer, mimeType);

  // Update variant in DB
  await db
    .update(productVariants)
    .set({ fileUrl: r2Key })
    .where(eq(productVariants.id, variant.id));

  console.log(`✅ Uploaded and linked to variant ${variant.name}`);
  console.log(`   Variant ID: ${variant.id}`);
  console.log(`   R2 Key: ${r2Key}`);
  console.log(`\nBuyers will now receive download links pointing to this file.`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Upload failed:", err);
  process.exit(1);
});
