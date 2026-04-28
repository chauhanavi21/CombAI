import { notFound } from "next/navigation";
import { getPublishedProducts, type ProductCategory } from "@/lib/db/queries";
import { CATEGORIES, getCategoryMeta } from "@/lib/categories";
import { ProductCard } from "@/components/products/product-card";
import { CategoryFilter } from "@/components/products/category-filter";
import { EmptyState } from "@/components/marketing/empty-state";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string }>;
}

const validCategories: ProductCategory[] = [
  "notion",
  "spreadsheet",
  "guide",
  "prompt",
  "saas",
];

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const meta = getCategoryMeta(category as ProductCategory);
  if (!meta) return {};

  return {
    title: `${meta.label} — Shop`,
    description: meta.tagline,
  };
}

export const revalidate = 60;

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!validCategories.includes(category as ProductCategory)) {
    notFound();
  }

  const meta = getCategoryMeta(category as ProductCategory)!;
  const products = await getPublishedProducts(category as ProductCategory);

  return (
    <>
      <section className="container-lux pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-3xl">
          <p className="label-eyebrow mb-4">{meta.label}</p>
          <h1
            className="text-display-lg font-display text-ink-900 text-balance"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            <span className="italic font-light text-ink-700">
              {meta.tagline}
            </span>
          </h1>
          <p className="mt-6 text-lg text-ink-600 max-w-2xl leading-relaxed">
            {meta.description}
          </p>
        </div>
      </section>

      <section className="container-lux pb-8 lg:pb-12 sticky top-20 z-30 bg-ink-50/80 backdrop-blur-xl">
        <div className="py-4 border-b border-ink-200">
          <CategoryFilter />
        </div>
      </section>

      <section className="container-lux pb-30">
        {products.length === 0 ? (
          <EmptyState
            title={`No ${meta.shortLabel.toLowerCase()} yet.`}
            description={`The first ${meta.shortLabel.toLowerCase()} drops are in production. Stay tuned.`}
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
