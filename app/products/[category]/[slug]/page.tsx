import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getRelatedProducts,
  getAllProductSlugs,
  type ProductCategory,
} from "@/lib/db/queries";
import { getCategoryMeta } from "@/lib/categories";
import { ProductGallery } from "@/components/products/product-gallery";
import { VariantSelector } from "@/components/products/variant-selector";
import { ProductCard } from "@/components/products/product-card";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export const revalidate = 60;

const validCategories: ProductCategory[] = [
  "notion",
  "spreadsheet",
  "guide",
  "prompt",
  "saas",
];

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map(({ category, slug }) => ({
    category,
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.shortDescription ?? product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.shortDescription ?? undefined,
      images: product.thumbnailUrl ? [product.thumbnailUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { category, slug } = await params;

  if (!validCategories.includes(category as ProductCategory)) {
    notFound();
  }

  const product = await getProductBySlug(slug);
  if (!product || product.category !== category) {
    notFound();
  }

  const categoryMeta = getCategoryMeta(category as ProductCategory)!;
  const relatedProducts = await getRelatedProducts(
    category as ProductCategory,
    product.id,
    3
  );

  const galleryImages = product.galleryUrls ?? [];

  return (
    <>
      {/* Breadcrumbs */}
      <div className="container-lux pt-28 lg:pt-32 pb-6">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/products" },
            { label: categoryMeta.shortLabel, href: `/products/${category}` },
            { label: product.title },
          ]}
        />
      </div>

      {/* Main product layout */}
      <section className="container-lux pb-20 lg:pb-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery — left column */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={galleryImages}
              thumbnailUrl={product.thumbnailUrl}
              productTitle={product.title}
            />
          </div>

          {/* Purchase panel — right column (sticky on desktop) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-8">
              {/* Header */}
              <div>
                <p className="label-eyebrow mb-3">{categoryMeta.shortLabel}</p>
                <h1
                  className="font-display text-display-md text-ink-900 tracking-tight text-balance mb-4"
                  style={{ fontVariationSettings: "'opsz' 144" }}
                >
                  {product.title}
                </h1>
                {product.shortDescription && (
                  <p className="text-lg text-ink-600 leading-relaxed text-balance">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Variant selector + buy button */}
              <VariantSelector product={product} />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs section: Description / Features / FAQ */}
      <section className="container-lux py-20 lg:py-30 border-t border-ink-200">
        <div className="max-w-3xl">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              {product.features && product.features.length > 0 && (
                <TabsTrigger value="features">Features</TabsTrigger>
              )}
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <div className="prose prose-ink max-w-none">
                {product.description.split("\n\n").map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-base lg:text-lg text-ink-700 leading-relaxed mb-6"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </TabsContent>

            {product.features && product.features.length > 0 && (
              <TabsContent value="features">
                <ul className="space-y-4">
                  {product.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 pb-4 border-b border-ink-100 last:border-b-0"
                    >
                      <span className="font-mono text-xs tracking-widest text-ink-400 mt-1">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base lg:text-lg text-ink-700 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            )}

            <TabsContent value="faq">
              <div className="space-y-8">
                <FaqItem
                  question="How is the product delivered?"
                  answer="Immediately after purchase. You'll receive an email with a download link, and the product will appear in your dashboard for re-download anytime."
                />
                <FaqItem
                  question="Do I get future updates?"
                  answer="Yes — every purchase includes lifetime updates. When the product is improved or expanded, you get the new version at no additional cost."
                />
                <FaqItem
                  question="Can I get a refund if it's not for me?"
                  answer="Yes. If you're not satisfied within 30 days of purchase, send an email and we'll refund you in full. No questions asked."
                />
                <FaqItem
                  question="Can I share this with my team?"
                  answer="It depends on the tier you choose. Standard tiers are licensed for individual use. Pro and team tiers include multi-seat licenses. Check the 'What's included' section for details."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="container-lux py-20 lg:py-30 border-t border-ink-200">
          <div className="flex items-end justify-between mb-12 gap-8">
            <div>
              <p className="label-eyebrow mb-3">More from this collection</p>
              <h2 className="font-display text-display-sm text-ink-900 tracking-tight">
                You might also enjoy
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {relatedProducts.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="pb-8 border-b border-ink-200 last:border-b-0">
      <h3 className="font-display text-xl text-ink-900 mb-3 tracking-tight">
        {question}
      </h3>
      <p className="text-base text-ink-600 leading-relaxed">{answer}</p>
    </div>
  );
}
