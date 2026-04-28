"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";

export function CategoryFilter() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/products") {
      return pathname === "/products";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-wrap gap-2 lg:gap-3">
      <Link
        href="/products"
        className={cn(
          "px-4 py-2 rounded-full text-sm transition-all duration-300",
          isActive("/products")
            ? "bg-ink-900 text-ink-50"
            : "border border-ink-300 text-ink-700 hover:border-ink-400 hover:text-ink-900"
        )}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/products/${cat.slug}`}
          className={cn(
            "px-4 py-2 rounded-full text-sm transition-all duration-300",
            isActive(`/products/${cat.slug}`)
              ? "bg-ink-900 text-ink-50"
              : "border border-ink-300 text-ink-700 hover:border-ink-400 hover:text-ink-900"
          )}
        >
          {cat.shortLabel}
        </Link>
      ))}
    </div>
  );
}
