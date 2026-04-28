import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md">
        <p
          className="font-display text-[10rem] lg:text-[12rem] text-ink-200 leading-none tracking-tightest"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          404
        </p>
        <p className="label-eyebrow mb-4">Page not found</p>
        <h1 className="font-display text-3xl text-ink-900 tracking-tight mb-4">
          We can't find that page.
        </h1>
        <p className="text-ink-600 leading-relaxed mb-10 text-balance">
          The link you followed may be broken, or the page may have been
          archived. Let's get you back to the collection.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/products">Browse the shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
