export default function Loading() {
  return (
    <>
      <section className="container-lux pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="max-w-3xl space-y-6">
          <div className="h-3 w-24 bg-ink-200 rounded-full animate-pulse" />
          <div className="h-16 w-full max-w-2xl bg-ink-200 rounded-lg animate-pulse" />
          <div className="h-5 w-full max-w-xl bg-ink-100 rounded animate-pulse" />
        </div>
      </section>

      <section className="container-lux pb-30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-ink-200 overflow-hidden"
            >
              <div className="aspect-[4/5] bg-ink-100 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-20 bg-ink-200 rounded animate-pulse" />
                <div className="h-6 w-3/4 bg-ink-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-ink-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
