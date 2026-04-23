import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "2rem",
        lg: "4rem",
        xl: "6rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Premium neutral palette — warm, not stark
        ink: {
          50: "#FAFAF7",
          100: "#F4F3EE",
          200: "#E8E6DD",
          300: "#C9C5B6",
          400: "#A5A090",
          500: "#7B7768",
          600: "#514E44",
          700: "#2E2C27",
          800: "#1A1917",
          900: "#0F0E0C",
          950: "#080807",
        },
        // Signature accent — muted gold / brass
        gold: {
          50: "#FBF7EE",
          100: "#F4EAD0",
          200: "#E6D19E",
          300: "#D4B36E",
          400: "#C39B4D",
          500: "#B8956A",
          600: "#9A7A52",
          700: "#7A6042",
          800: "#584734",
          900: "#3A2F23",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 8vw, 7rem)", { lineHeight: "1", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        tightest: "-0.05em",
        wider: "0.08em",
        widest: "0.2em",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "38": "9.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 1s ease-out forwards",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        "grid": "linear-gradient(to right, rgb(0 0 0 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
