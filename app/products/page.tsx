import { getPublishedProducts } from "@/lib/db/queries";
import { ProductCard } from "@/components/products/product-card";
import { CategoryFilter } from "@/components/products/category-filter";
import { EmptyState } from "@/components/marketing/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — All Collections",
  description:
    "Browse the complete collection of premium digital products: Notion templates, spreadsheets, guides, prompt packs, and tools.",
};

// Revalidate the page every 60 seconds (ISR) so admin changes appear quickly
export const revalidate = 60;

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <>
      {/* Header */}
      <section className="container-lux pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-3xl">
          <p className="label-eyebrow mb-4">The collection</p>
          <h1
            className="text-display-lg font-display text-ink-900 text-balance"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            Every product,
            <br />
            <span className="italic font-light text-ink-700">
              made to last.
            </span>
          </h1>
          <p className="mt-6 text-lg text-ink-600 max-w-2xl leading-relaxed text-balance">
            Each item in the collection is built once, polished obsessively, and
            updated for the life of the product.
          </p>
        </div>
      </section>

      {/* Filter row */}
      <section className="container-lux pb-8 lg:pb-12 sticky top-20 z-30 bg-ink-50/80 backdrop-blur-xl">
        <div className="py-4 border-b border-ink-200">
          <CategoryFilter />
        </div>
      </section>

      {/* Grid */}
      <section className="container-lux pb-30">
        {products.length === 0 ? (
          <EmptyState
            title="The collection is being prepared."
            description="Our first drop launches soon. Subscribe below to be the first to know."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                priority={idx < 3}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
