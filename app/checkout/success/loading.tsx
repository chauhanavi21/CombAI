export default function Loading() {
  return (
    <div className="container-lux pt-32 pb-30 lg:pt-40">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-ink-100 animate-pulse" />
        </div>
        <div className="text-center mb-12 space-y-4">
          <div className="h-3 w-32 bg-ink-200 rounded mx-auto animate-pulse" />
          <div className="h-12 w-3/4 bg-ink-200 rounded mx-auto animate-pulse" />
          <div className="h-5 w-2/3 bg-ink-100 rounded mx-auto animate-pulse" />
        </div>
        <div className="rounded-3xl border border-ink-200 h-64 animate-pulse bg-ink-100" />
      </div>
    </div>
  );
}
