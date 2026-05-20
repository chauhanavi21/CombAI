"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Receipt,
  Tag,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition-all duration-300",
              isActive
                ? "bg-ink-900 text-ink-50"
                : "text-ink-700 hover:bg-ink-200/60"
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}

      <div className="pt-6 mt-6 border-t border-ink-200">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ExternalLink size={14} />
          View storefront
        </Link>
      </div>
    </nav>
  );
}
