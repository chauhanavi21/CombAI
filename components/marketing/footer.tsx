import Link from "next/link";

const footerLinks = {
  Shop: [
    { href: "/products/notion", label: "Notion Templates" },
    { href: "/products/spreadsheet", label: "Spreadsheets" },
    { href: "/products/guide", label: "Guides" },
    { href: "/products/prompt", label: "Prompt Packs" },
    { href: "/products/saas", label: "Tools" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Journal" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    { href: "/refunds", label: "Refund Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="relative mt-38 border-t border-ink-200 bg-ink-50">
      <div className="container-lux py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand & newsletter */}
          <div className="lg:col-span-5 space-y-6">
            <Link
              href="/"
              className="inline-block font-display text-3xl tracking-tight text-ink-900"
            >
              Luxe<span className="text-gold-500">.</span>
            </Link>
            <p className="text-ink-600 max-w-md text-balance leading-relaxed">
              Thoughtfully crafted digital products for founders, freelancers, and
              creators who care about their craft.
            </p>
            <form className="flex gap-2 max-w-md">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-full border border-ink-300 bg-transparent
                         placeholder:text-ink-400 text-sm
                         focus:outline-none focus:border-ink-900 transition-colors"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="text-xs text-ink-500">
              Monthly drop of new templates and essays. Unsubscribe anytime.
            </p>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="label-eyebrow mb-4">{section}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-700 hover:text-ink-900 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-ink-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-ink-500 tracking-wide">
            © {new Date().getFullYear()} Luxe. Crafted with intention.
          </p>
          <p className="text-xs text-ink-500 tracking-wider uppercase">
            Made in New York
          </p>
        </div>
      </div>
    </footer>
  );
}
