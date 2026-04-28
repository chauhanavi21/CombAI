import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../lib/db";
import { products, productVariants } from "../lib/db/schema";

const seedProducts = [
  {
    slug: "founder-os-notion",
    title: "Founder OS",
    shortDescription:
      "A complete operating system for early-stage founders. Goals, metrics, and weekly reviews in one workspace.",
    description:
      "Founder OS is the workspace I wish I had when I started my first company. It pulls together OKRs, weekly reviews, hiring pipeline, investor CRM, and a personal task system into one cohesive Notion workspace.\n\nUsed by 200+ founders across YC, Techstars, and indie hackers.",
    category: "notion" as const,
    compareAtPriceCents: 9900,
    featured: true,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "OKRs with auto-rollup to quarterly goals",
      "Weekly review template with reflection prompts",
      "Hiring pipeline with Kanban candidate tracking",
      "Investor CRM with relationship strength scoring",
      "Personal task system inspired by GTD",
    ],
    variants: [
      {
        name: "Standard",
        description: "The complete Founder OS workspace.",
        priceCents: 4900,
        isDefault: true,
        sortOrder: 0,
        includedItems: [
          "Founder OS Notion template",
          "Setup guide PDF",
          "Lifetime updates",
        ],
      },
      {
        name: "Pro",
        description: "Everything in Standard, plus team features and onboarding.",
        priceCents: 14900,
        isDefault: false,
        sortOrder: 1,
        includedItems: [
          "Everything in Standard",
          "Team workspace variant (up to 10 seats)",
          "30-min onboarding call with the creator",
          "Custom workspace customization guide",
          "Private community access",
        ],
      },
    ],
  },
  {
    slug: "saas-financial-model",
    title: "SaaS Financial Model",
    shortDescription:
      "A 5-year SaaS forecast model used by founders raising seed and Series A. MRR, churn, CAC, LTV — all dialed in.",
    description:
      "Built from real models used in successful seed and Series A raises. Plug in your numbers and get instant forecasts that VCs actually take seriously.",
    category: "spreadsheet" as const,
    compareAtPriceCents: null,
    featured: true,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "5-year monthly forecast",
      "Cohort retention analysis",
      "Cap table with dilution modeling",
      "Three scenario presets: conservative, base, aggressive",
    ],
    variants: [
      {
        name: "Standard",
        description: "Google Sheets and Excel versions.",
        priceCents: 7900,
        isDefault: true,
        sortOrder: 0,
        includedItems: [
          "Google Sheets template",
          "Excel template",
          "Quick-start video walkthrough",
        ],
      },
      {
        name: "Pro",
        description: "Add the cap table and scenario tools.",
        priceCents: 19900,
        isDefault: false,
        sortOrder: 1,
        includedItems: [
          "Everything in Standard",
          "Cap table with dilution modeling",
          "Scenario comparison tool",
          "60-min review call to customize for your business",
        ],
      },
    ],
  },
  {
    slug: "first-100-customers",
    title: "The First 100 Customers",
    shortDescription:
      "A 60-page playbook on getting your first 100 paying customers. No fluff, just tactics that worked.",
    description:
      "After helping launch dozens of products, I wrote down everything that actually moved the needle from zero to 100 customers. This is that playbook.",
    category: "guide" as const,
    compareAtPriceCents: null,
    featured: false,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "60 pages of tactics, no theory",
      "Real examples from 12 launches",
      "Templates and scripts you can copy",
      "Cold outreach playbook with response rates",
    ],
    variants: [
      {
        name: "Standard",
        description: "The PDF guide.",
        priceCents: 2900,
        isDefault: true,
        sortOrder: 0,
        includedItems: ["60-page PDF", "Linked templates and scripts"],
      },
    ],
  },
  {
    slug: "creator-content-os",
    title: "Creator Content OS",
    shortDescription:
      "The Notion system used by 7-figure creators to plan, produce, and publish content across platforms.",
    description:
      "If you create content for a living — newsletters, YouTube, podcasts, courses — this is the system to run it on.",
    category: "notion" as const,
    compareAtPriceCents: 12900,
    featured: true,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "Editorial calendar with cross-platform publishing",
      "Idea capture system with weekly review",
      "Sponsorship CRM",
      "Performance analytics rollups",
    ],
    variants: [
      {
        name: "Solo",
        description: "For individual creators.",
        priceCents: 5900,
        isDefault: true,
        sortOrder: 0,
        includedItems: [
          "Creator Content OS template",
          "Setup video walkthrough",
        ],
      },
      {
        name: "Studio",
        description: "Multi-creator team workspace.",
        priceCents: 17900,
        isDefault: false,
        sortOrder: 1,
        includedItems: [
          "Everything in Solo",
          "Team workspace (up to 5 creators)",
          "Editor and reviewer roles",
          "Approval workflow",
        ],
      },
    ],
  },
  {
    slug: "claude-prompt-pack-pro",
    title: "Claude Prompt Pack: Pro",
    shortDescription:
      "120 production-tested prompts for engineering, writing, research, and product work with Claude.",
    description:
      "These aren't toy prompts. Each one has been refined through real client work and saved hours of iteration time.",
    category: "prompt" as const,
    compareAtPriceCents: null,
    featured: false,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "120 prompts across 8 categories",
      "Each prompt with example inputs and outputs",
      "Notion database for easy searching",
      "Quarterly updates as Claude improves",
    ],
    variants: [
      {
        name: "Pack",
        description: "All 120 prompts in Notion + PDF.",
        priceCents: 3900,
        isDefault: true,
        sortOrder: 0,
        includedItems: [
          "Notion database with 120 prompts",
          "PDF reference guide",
          "Quarterly updates",
        ],
      },
    ],
  },
  {
    slug: "client-tracker-pro",
    title: "Client Tracker Pro",
    shortDescription:
      "A spreadsheet system for freelancers managing 5–50 clients. Invoicing, projects, retainers, all in one.",
    description:
      "Built for freelancers who outgrew Notion but don't want a full CRM. Just a beautifully built spreadsheet that does the job.",
    category: "spreadsheet" as const,
    compareAtPriceCents: null,
    featured: false,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "Client database with status tracking",
      "Project pipeline with deliverable tracking",
      "Invoice generator",
      "Income forecasting based on retainers",
    ],
    variants: [
      {
        name: "Standard",
        description: "Google Sheets version.",
        priceCents: 3900,
        isDefault: true,
        sortOrder: 0,
        includedItems: ["Google Sheets template", "Setup guide"],
      },
      {
        name: "Pro",
        description: "Sheets + Excel + Notion sync version.",
        priceCents: 7900,
        isDefault: false,
        sortOrder: 1,
        includedItems: [
          "Google Sheets version",
          "Excel version",
          "Notion sync companion",
          "Email automation guide",
        ],
      },
    ],
  },
  {
    slug: "pricing-playbook",
    title: "The Pricing Playbook",
    shortDescription:
      "A 40-page guide to pricing software, services, and digital products. Frameworks, case studies, scripts.",
    description:
      "Pricing is the highest-leverage decision you'll make. This guide gives you the frameworks to make that decision well.",
    category: "guide" as const,
    compareAtPriceCents: null,
    featured: false,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "40 pages, no filler",
      "8 pricing model frameworks",
      "12 real case studies",
      "Scripts for raising prices with existing customers",
    ],
    variants: [
      {
        name: "Standard",
        description: "The complete PDF guide.",
        priceCents: 3900,
        isDefault: true,
        sortOrder: 0,
        includedItems: [
          "40-page PDF",
          "Pricing calculator spreadsheet",
        ],
      },
    ],
  },
  {
    slug: "developer-prompt-pack",
    title: "Developer Prompt Pack",
    shortDescription:
      "80 prompts engineered for daily software work: code review, refactoring, testing, debugging.",
    description:
      "Stop reinventing the prompt every time you need Claude to review code or write tests. These are the prompts I use every day.",
    category: "prompt" as const,
    compareAtPriceCents: null,
    featured: false,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "80 prompts across the dev workflow",
      "Language-agnostic with examples",
      "Notion + Markdown formats",
      "Updates as new patterns emerge",
    ],
    variants: [
      {
        name: "Pack",
        description: "All prompts in Notion + Markdown.",
        priceCents: 2900,
        isDefault: true,
        sortOrder: 0,
        includedItems: [
          "Notion database",
          "Markdown files for IDE use",
        ],
      },
    ],
  },
  {
    slug: "weekly-review-tool",
    title: "Weekly Review",
    shortDescription:
      "A focused micro-tool for the weekly review ritual. Email-based, takes 12 minutes.",
    description:
      "The weekly review is the most important habit I have. This tool makes it impossible to skip.",
    category: "saas" as const,
    compareAtPriceCents: null,
    featured: false,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "Sunday email with guided prompts",
      "Tracks streaks and themes over time",
      "End-of-quarter synthesis",
    ],
    variants: [
      {
        name: "Annual",
        description: "12 months of access.",
        priceCents: 4900,
        isDefault: true,
        sortOrder: 0,
        includedItems: [
          "12 months of weekly review emails",
          "Quarterly synthesis reports",
          "Lifetime data export",
        ],
      },
    ],
  },
  {
    slug: "newsletter-os",
    title: "Newsletter OS",
    shortDescription:
      "A complete Notion workspace for running a paid newsletter business. From idea to subscription growth.",
    description:
      "Built with input from creators running 5-figure newsletters. Run your editorial, growth, monetization, and reader research from one place.",
    category: "notion" as const,
    compareAtPriceCents: null,
    featured: false,
    thumbnailUrl: null,
    galleryUrls: [],
    features: [
      "Editorial calendar with batch planning",
      "Subscriber growth tracking",
      "Monetization dashboard (subs, sponsors, products)",
      "Reader research database",
    ],
    variants: [
      {
        name: "Standard",
        description: "The complete Newsletter OS template.",
        priceCents: 5900,
        isDefault: true,
        sortOrder: 0,
        includedItems: [
          "Newsletter OS Notion template",
          "Walkthrough video series",
        ],
      },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  for (const productData of seedProducts) {
    const { variants, ...productFields } = productData;

    // Insert product
    const [insertedProduct] = await db
      .insert(products)
      .values({
        ...productFields,
        status: "published",
      })
      .returning();

    console.log(`  ✓ Created product: ${insertedProduct.title}`);

    // Insert variants
    for (const variant of variants) {
      await db.insert(productVariants).values({
        ...variant,
        productId: insertedProduct.id,
      });
    }
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
