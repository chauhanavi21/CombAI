import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
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
        <p className="label-eyebrow mb-3">New product</p>
        <h1 className="font-display text-display-sm text-ink-900 tracking-tight">
          Add a product
        </h1>
        <p className="mt-2 text-ink-600">
          Create a product with one or more pricing tiers. Save as draft first
          if you want to preview before publishing.
        </p>
      </header>

      <ProductForm mode="create" />
    </>
  );
}
