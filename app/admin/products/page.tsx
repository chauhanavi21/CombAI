import Link from "next/link";
import Image from "next/image";
import { Plus, Package } from "lucide-react";
import { getAllProductsForAdmin } from "@/lib/db/queries-admin";
import { getPriceRange } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { getCategoryMeta } from "@/lib/categories";

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <>
      <header className="flex items-end justify-between mb-12 gap-6">
        <div>
          <p className="label-eyebrow mb-3">Products</p>
          <h1 className="font-display text-display-sm text-ink-900 tracking-tight">
            All products
          </h1>
          <p className="mt-2 text-ink-600">
            {products.length} {products.length === 1 ? "product" : "products"} in
            the catalog
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus size={16} />
            New product
          </Link>
        </Button>
      </header>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-ink-200 bg-ink-50 py-20 text-center">
          <Package className="mx-auto mb-4 text-ink-300" size={32} />
          <h3 className="font-display text-xl text-ink-900 mb-2">
            No products yet
          </h3>
          <p className="text-sm text-ink-600 mb-6">
            Add your first product to start selling.
          </p>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus size={16} />
              Create product
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-3xl border border-ink-200 bg-ink-50 overflow-hidden">
          <ul className="divide-y divide-ink-200">
            {products.map((product) => {
              const category = getCategoryMeta(product.category);
              const priceRange = getPriceRange(product);
              return (
                <li key={product.id}>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex items-center gap-4 p-4 lg:p-5 hover:bg-ink-100/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-2xl bg-ink-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {product.thumbnailUrl ? (
                        <Image
                          src={product.thumbnailUrl}
                          alt=""
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="font-display text-2xl text-ink-300">
                          {product.title.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-ink-500">
                          {category?.shortLabel}
                        </span>
                        <Badge
                          variant={
                            product.status === "published" ? "gold" : "default"
                          }
                          className="text-[10px] py-0.5 px-2"
                        >
                          {product.status}
                        </Badge>
                        {product.featured && (
                          <Badge
                            variant="ink"
                            className="text-[10px] py-0.5 px-2"
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="font-display text-lg text-ink-900 tracking-tight truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {product.variants.length}{" "}
                        {product.variants.length === 1 ? "variant" : "variants"}{" "}
                        · Updated {formatDate(product.updatedAt)}
                      </p>
                    </div>

                    {/* Price */}
                    {priceRange && (
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-base text-ink-900">
                          {priceRange.min === priceRange.max
                            ? formatPrice(priceRange.min)
                            : `${formatPrice(priceRange.min)}–${formatPrice(priceRange.max)}`}
                        </p>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
