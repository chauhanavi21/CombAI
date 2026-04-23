import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ ENUMS ============
export const productCategoryEnum = pgEnum("product_category", [
  "notion",
  "spreadsheet",
  "guide",
  "prompt",
  "saas",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "archived",
]);

export const deliveryTypeEnum = pgEnum("delivery_type", [
  "file",
  "link",
  "both",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "refunded",
  "failed",
]);

export const couponTypeEnum = pgEnum("coupon_type", ["percent", "fixed"]);

export const subscriberSourceEnum = pgEnum("subscriber_source", [
  "newsletter",
  "lead_magnet",
  "purchase",
]);

// ============ TABLES ============

// Users (mirrored from Clerk)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  category: productCategoryEnum("category").notNull(),
  compareAtPriceCents: integer("compare_at_price_cents"),
  status: productStatusEnum("status").notNull().default("draft"),
  thumbnailUrl: text("thumbnail_url"),
  galleryUrls: jsonb("gallery_urls").$type<string[]>().default([]),
  features: jsonb("features").$type<string[]>().default([]),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Product Variants (Standard/Pro tiers)
export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  fileUrl: text("file_url"),
  externalUrl: text("external_url"),
  deliveryType: deliveryTypeEnum("delivery_type").notNull().default("file"),
  includedItems: jsonb("included_items").$type<string[]>().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  stripeSessionId: text("stripe_session_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amountCents: integer("amount_cents").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  couponCode: text("coupon_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  priceCentsAtPurchase: integer("price_cents_at_purchase").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// Downloads (signed URL tracking)
export const downloads = pgTable("downloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderItemId: uuid("order_item_id")
    .notNull()
    .references(() => orderItems.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  downloadToken: text("download_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  downloadCount: integer("download_count").notNull().default(0),
  lastDownloadedAt: timestamp("last_downloaded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Coupons
export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  discountType: couponTypeEnum("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  maxUses: integer("max_uses"),
  usesCount: integer("uses_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email Subscribers
export const emailSubscribers = pgTable("email_subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  source: subscriberSourceEnum("source").notNull(),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

// Blog Posts (MDX files on disk; this tracks analytics)
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  viewsCount: integer("views_count").notNull().default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ RELATIONS ============
export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    orderItems: many(orderItems),
  })
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
  downloads: many(downloads),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [downloads.orderItemId],
    references: [orderItems.id],
  }),
}));

// ============ TYPES ============
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Download = typeof downloads.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
