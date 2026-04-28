import type { ProductCategory } from "./db/queries";

export type CategoryMeta = {
  slug: ProductCategory;
  label: string;
  shortLabel: string;
  description: string;
  tagline: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "notion",
    label: "Notion Templates",
    shortLabel: "Notion",
    description: "Workspaces engineered for clarity.",
    tagline: "Operating systems for your work.",
  },
  {
    slug: "spreadsheet",
    label: "Spreadsheets",
    shortLabel: "Spreadsheets",
    description: "Finance, tracking, forecasting.",
    tagline: "Numbers that tell the truth.",
  },
  {
    slug: "guide",
    label: "Guides",
    shortLabel: "Guides",
    description: "Frameworks from the field.",
    tagline: "Hard-won lessons, distilled.",
  },
  {
    slug: "prompt",
    label: "Prompt Packs",
    shortLabel: "Prompts",
    description: "Proven prompts for daily work.",
    tagline: "Talk to AI like a professional.",
  },
  {
    slug: "saas",
    label: "Tools",
    shortLabel: "Tools",
    description: "Micro-apps for narrow problems.",
    tagline: "Built to do one thing well.",
  },
];

export function getCategoryMeta(
  slug: ProductCategory
): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
