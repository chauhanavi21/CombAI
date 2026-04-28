import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs tracking-wide text-ink-500">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-ink-900 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-ink-900" : ""}>{item.label}</span>
            )}
            {!isLast && <ChevronRight size={12} className="text-ink-300" />}
          </div>
        );
      })}
    </nav>
  );
}
