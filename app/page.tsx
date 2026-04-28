import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { getFeaturedProducts, getCategoryCounts } from "@/lib/db/queries";
import { CATEGORIES } from "@/lib/categories";
import { ProductCard } from "@/components/products/product-card";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, counts] = await Promise.all([
    getFeaturedProducts(3),
    getCategoryCounts(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [background-size:64px_64px] opacity-60" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-50/80 to-ink-50"
          aria-hidden
        />

        <div className="container-lux relative pt-32 pb-24 lg:pt-44 lg:pb-38">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ink-200 bg-ink-50/60 backdrop-blur mb-8 animate-fade-up">
              <Sparkles size={12} className="text-gold-500" />
              <span className="text-xs tracking-wider uppercase text-ink-600">
                New — Summer Collection
              </span>
            </div>

            <h1
              className="text-display-xl font-display text-ink-900 text-balance animate-fade-up"
              style={{
                fontOpticalSizing: "auto",
                fontVariationSettings: "'opsz' 144, 'SOFT' 30",
                animationDelay: "80ms",
              }}
            >
              Digital products,
              <br />
              <span className="italic font-light text-ink-700">
                refined to a point.
              </span>
            </h1>

            <p
              className="mt-8 text-lg lg:text-xl text-ink-600 max-w-2xl leading-relaxed text-balance animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              A considered collection of Notion templates, spreadsheets, guides,
              and tools — built for operators who measure their work in craft,
              not output.
            </p>

            <div
              className="mt-10 flex flex-wrap gap-3 animate-fade-up"
              style={{ animationDelay: "280ms" }}
            >
              <Link href="/products" className="btn-primary">
                Browse the collection
                <ArrowUpRight size={16} />
              </Link>
              <Link href="/about" className="btn-secondary">
                Our approach
              </Link>
            </div>

            <div
              className="mt-16 flex flex-wrap items-center gap-8 text-xs tracking-wider uppercase text-ink-500 animate-fade-up"
              style={{ animationDelay: "420ms" }}
            >
              <span>Instant delivery</span>
              <span className="text-ink-300">·</span>
              <span>Lifetime updates</span>
              <span className="text-ink-300">·</span>
              <span>30-day guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="container-lux py-20 lg:py-30">
        <div className="flex items-end justify-between mb-12 lg:mb-16 gap-8">
          <div>
            <p className="label-eyebrow mb-3">Collections</p>
            <h2 className="text-display-md font-display text-ink-900 max-w-xl text-balance">
              Five disciplines.
              <br />
              <span className="italic font-light">One standard.</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-ink-700 hover:text-ink-900 group"
          >
            View all
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {CATEGORIES.map((cat, idx) => {
            const count = counts[cat.slug];
            return (
              <Link
                key={cat.slug}
                href={`/products/${cat.slug}`}
                className="group card-lux aspect-[4/5] p-8 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs tracking-widest text-ink-400">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-ink-400 transition-all duration-500 group-hover:text-ink-900 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </div>

                <div>
                  <p className="label-eyebrow mb-2">
                    {count} {count === 1 ? "item" : "items"}
                  </p>
                  <h3 className="font-display text-3xl lg:text-4xl text-ink-900 mb-3 tracking-tight">
                    {cat.label}
                  </h3>
                  <p className="text-sm text-ink-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="w-0 h-px bg-gold-500 transition-all duration-700 group-hover:w-12" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Philosophy / Manifesto */}
      <section className="container-lux py-20 lg:py-30">
        <div className="max-w-3xl mx-auto text-center">
          <p className="label-eyebrow mb-6">The philosophy</p>
          <p className="font-display text-3xl lg:text-5xl text-ink-900 leading-[1.2] tracking-tight text-balance">
            Most templates are{" "}
            <span className="italic font-light text-ink-500">made to sell.</span>
            <br />
            These are made to{" "}
            <span className="italic font-light text-gold-600">be used</span> —
            <br />
            every week, for years.
          </p>
          <div className="divider-ornament mt-12 max-w-xs mx-auto">
            <span className="font-mono text-xs tracking-widest">LUXE</span>
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="container-lux py-20 lg:py-30">
          <div className="flex items-end justify-between mb-12 gap-8">
            <div>
              <p className="label-eyebrow mb-3">Featured</p>
              <h2 className="text-display-md font-display text-ink-900">
                Recently released
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-ink-700 hover:text-ink-900 group"
            >
              All products
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                priority={idx < 3}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
