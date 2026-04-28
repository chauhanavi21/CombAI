import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({
  title = "Nothing here yet.",
  description = "We're crafting something worth waiting for. Check back soon, or sign up for the next drop.",
  ctaLabel = "Browse all",
  ctaHref = "/products",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-30 text-center">
      <div className="w-16 h-16 rounded-full border border-ink-200 flex items-center justify-center mb-6">
        <Sparkles size={20} className="text-gold-500" />
      </div>
      <h3 className="font-display text-3xl text-ink-900 mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-ink-600 max-w-md text-balance leading-relaxed mb-8">
        {description}
      </p>
      <Button asChild>
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
