import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";

// Display serif — Fraunces has gorgeous optical sizes
const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

// Body sans — Inter as fallback but with feature settings for refinement.
// Swap to Geist or General Sans via localFont later for more distinction.
const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Luxe — Premium Digital Products for Modern Creators",
    template: "%s · Luxe",
  },
  description:
    "Thoughtfully crafted Notion templates, spreadsheets, guides, and tools for founders, freelancers, and creators who value their craft.",
  openGraph: {
    type: "website",
    siteName: "Luxe",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1A1917",
          colorText: "#0F0E0C",
          colorBackground: "#FAFAF7",
          fontFamily: "var(--font-sans)",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
        <body className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
