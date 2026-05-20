import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { getProductByIdForAdmin } from "@/lib/db/queries-admin";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductByIdForAdmin(id);
  if (!product) notFound();

  return (
    <>
      <header className="mb-10">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 mb-6 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to products
        </Link>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="label-eyebrow mb-3">Edit product</p>
            <h1 className="font-display text-display-sm text-ink-900 tracking-tight">
              {product.title}
            </h1>
            <p className="mt-2 text-ink-600">
              <Link
                href={`/products/${product.category}/${product.slug}`}
                target="_blank"
                className="hover:text-ink-900 underline underline-offset-4"
              >
                View on storefront →
              </Link>
            </p>
          </div>
          <DeleteProductButton productId={product.id} productTitle={product.title} />
        </div>
      </header>

      <ProductForm mode="edit" initialProduct={product} />
    </>
  );
}
