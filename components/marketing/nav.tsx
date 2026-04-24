"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/products/notion", label: "Notion" },
  { href: "/products/guide", label: "Guides" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-ink-50/80 backdrop-blur-xl border-b border-ink-200/60"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="container-lux flex items-center justify-between h-20">
          <Link
            href="/"
            className="font-display text-2xl tracking-tight text-ink-900 hover:text-ink-700 transition-colors"
            style={{ fontOpticalSizing: "auto", fontVariationSettings: "'opsz' 144" }}
          >
            Luxe<span className="text-gold-500">.</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink-700 hover:text-ink-900 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-ink-900 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <SignedOut>
              <Link
                href="/sign-in"
                className="hidden sm:inline-block text-sm text-ink-700 hover:text-ink-900 transition-colors"
              >
                Sign in
              </Link>
              <Link href="/sign-up" className="hidden sm:inline-flex btn-primary">
                Get started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="hidden sm:inline-block text-sm text-ink-700 hover:text-ink-900 transition-colors"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -mr-2 text-ink-900"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-40 bg-ink-50 animate-fade-in">
          <nav className="container-lux py-12 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-display text-3xl tracking-tight text-ink-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
