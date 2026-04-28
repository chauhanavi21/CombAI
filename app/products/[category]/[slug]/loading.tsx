export default function Loading() {
  return (
    <>
      <div className="container-lux pt-28 lg:pt-32 pb-6">
        <div className="h-3 w-64 bg-ink-200 rounded animate-pulse" />
      </div>

      <section className="container-lux pb-20 lg:pb-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/5] rounded-3xl bg-ink-100 animate-pulse" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square w-20 rounded-2xl bg-ink-100 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Right column skeleton */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="h-3 w-20 bg-ink-200 rounded animate-pulse" />
              <div className="h-12 w-full bg-ink-200 rounded animate-pulse" />
              <div className="h-5 w-full bg-ink-100 rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-ink-100 rounded animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-3 w-24 bg-ink-200 rounded animate-pulse" />
              <div className="h-24 rounded-2xl bg-ink-100 animate-pulse" />
              <div className="h-24 rounded-2xl bg-ink-100 animate-pulse" />
            </div>

            <div className="h-14 w-full rounded-full bg-ink-200 animate-pulse" />
          </div>
        </div>
      </section>
    </>
  );
}
