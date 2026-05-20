"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadWidget } from "@/components/admin/upload-widget";
import { cn, slugify } from "@/lib/utils";
import {
  createProductAction,
  updateProductAction,
  type ProductFormInput,
} from "@/app/admin/products/actions";
import type {
  Product,
  ProductVariant,
} from "@/lib/db/schema";

const CATEGORIES = [
  { value: "notion", label: "Notion Templates" },
  { value: "spreadsheet", label: "Spreadsheets" },
  { value: "guide", label: "Guides" },
  { value: "prompt", label: "Prompt Packs" },
  { value: "saas", label: "Tools" },
] as const;

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

type VariantDraft = {
  id?: string;
  name: string;
  description: string;
  priceCents: number;
  fileUrl: string | null;
  externalUrl: string;
  deliveryType: "file" | "link" | "both";
  includedItems: string[];
  isDefault: boolean;
  sortOrder: number;
};

interface ProductFormProps {
  mode: "create" | "edit";
  initialProduct?: Product & { variants: ProductVariant[] };
}

const blankVariant = (sortOrder = 0): VariantDraft => ({
  name: "",
  description: "",
  priceCents: 0,
  fileUrl: null,
  externalUrl: "",
  deliveryType: "file",
  includedItems: [],
  isDefault: false,
  sortOrder,
});

export function ProductForm({ mode, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialProduct?.title ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialProduct);
  const [shortDescription, setShortDescription] = useState(
    initialProduct?.shortDescription ?? ""
  );
  const [description, setDescription] = useState(
    initialProduct?.description ?? ""
  );
  const [category, setCategory] = useState<
    "notion" | "spreadsheet" | "guide" | "prompt" | "saas"
  >(initialProduct?.category ?? "notion");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    initialProduct?.status ?? "draft"
  );
  const [compareAtPriceDollars, setCompareAtPriceDollars] = useState(
    initialProduct?.compareAtPriceCents
      ? (initialProduct.compareAtPriceCents / 100).toString()
      : ""
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    initialProduct?.thumbnailUrl ?? null
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    initialProduct?.galleryUrls ?? []
  );
  const [features, setFeatures] = useState<string[]>(
    initialProduct?.features ?? [""]
  );
  const [featured, setFeatured] = useState(initialProduct?.featured ?? false);

  const [variants, setVariants] = useState<VariantDraft[]>(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants.map((v) => ({
        id: v.id,
        name: v.name,
        description: v.description ?? "",
        priceCents: v.priceCents,
        fileUrl: v.fileUrl,
        externalUrl: v.externalUrl ?? "",
        deliveryType: v.deliveryType,
        includedItems: v.includedItems ?? [],
        isDefault: v.isDefault,
        sortOrder: v.sortOrder,
      }));
    }
    return [{ ...blankVariant(0), name: "Standard", isDefault: true }];
  });

  // Auto-generate slug from title in create mode until user touches it
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const addVariant = () => {
    setVariants([...variants, blankVariant(variants.length)]);
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) {
      setError("At least one variant is required");
      return;
    }
    const next = variants.filter((_, i) => i !== idx);
    // If we removed the default, mark first as default
    if (!next.some((v) => v.isDefault)) {
      next[0].isDefault = true;
    }
    setVariants(next);
  };

  const updateVariant = (idx: number, patch: Partial<VariantDraft>) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, ...patch } : v))
    );
  };

  const setDefaultVariant = (idx: number) => {
    setVariants((prev) =>
      prev.map((v, i) => ({ ...v, isDefault: i === idx }))
    );
  };

  const addFeature = () => setFeatures([...features, ""]);
  const updateFeature = (idx: number, value: string) =>
    setFeatures(features.map((f, i) => (i === idx ? value : f)));
  const removeFeature = (idx: number) =>
    setFeatures(features.filter((_, i) => i !== idx));

  const addGalleryImage = (url: string | null) => {
    if (url) setGalleryUrls([...galleryUrls, url]);
  };
  const removeGalleryImage = (idx: number) =>
    setGalleryUrls(galleryUrls.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Build payload
    const compareAtCents = compareAtPriceDollars
      ? Math.round(parseFloat(compareAtPriceDollars) * 100)
      : null;

    const payload: ProductFormInput = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      shortDescription: shortDescription.trim() || null,
      description: description.trim(),
      category,
      status,
      compareAtPriceCents: compareAtCents,
      thumbnailUrl,
      galleryUrls,
      features: features.map((f) => f.trim()).filter(Boolean),
      featured,
      variants: variants.map((v, idx) => ({
        id: v.id,
        name: v.name.trim(),
        description: v.description.trim() || null,
        priceCents: v.priceCents,
        fileUrl: v.fileUrl,
        externalUrl: v.externalUrl.trim() || null,
        deliveryType: v.deliveryType,
        includedItems: v.includedItems
          .map((i) => i.trim())
          .filter(Boolean),
        isDefault: v.isDefault,
        sortOrder: idx,
      })),
    };

    // Quick client validation
    if (!payload.title) return setError("Title is required");
    if (!payload.description) return setError("Description is required");
    if (payload.variants.some((v) => !v.name))
      return setError("All variants need a name");
    if (payload.variants.some((v) => v.priceCents < 100))
      return setError("All variant prices must be at least $1.00");

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(payload)
          : await updateProductAction(initialProduct!.id, payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (mode === "create" && "productId" in result && result.productId) {
        router.push(`/admin/products/${result.productId}`);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Basic info */}
      <Section title="Basics">
        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., Founder OS"
            required
          />
        </Field>
        <Field label="Slug" help="URL: /products/<category>/<slug>">
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="founder-os"
            required
          />
        </Field>
        <Field
          label="Short description"
          help="One sentence shown on product cards. Optional."
        >
          <Input
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="A complete operating system for early-stage founders."
            maxLength={300}
          />
        </Field>
        <Field label="Full description" help="Markdown supported in display.">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full rounded-2xl border border-ink-300 bg-transparent px-4 py-3 text-sm placeholder:text-ink-400 focus:outline-none focus:border-ink-900 transition-colors"
            placeholder="The full description shown on the product page..."
            required
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Category">
            <Select
              value={category}
              onChange={(v) => setCategory(v as typeof category)}
              options={CATEGORIES}
            />
          </Field>
          <Field label="Status">
            <Select
              value={status}
              onChange={(v) => setStatus(v as typeof status)}
              options={STATUSES}
            />
          </Field>
        </div>

        <Field
          label="Compare-at price (USD)"
          help="Optional. Shows as crossed-out 'was' price on the product page."
        >
          <Input
            type="number"
            step="0.01"
            min="0"
            value={compareAtPriceDollars}
            onChange={(e) => setCompareAtPriceDollars(e.target.value)}
            placeholder="99.00"
          />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 rounded border-ink-300"
          />
          <span className="text-sm text-ink-700">
            Feature on homepage
          </span>
        </label>
      </Section>

      {/* Images */}
      <Section title="Imagery">
        <UploadWidget
          label="Thumbnail"
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
          kind="image"
        />

        <div>
          <p className="label-eyebrow mb-3">Gallery</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {galleryUrls.map((url, idx) => (
              <div
                key={url + idx}
                className="relative rounded-2xl border border-ink-200 bg-ink-100 aspect-video overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink-900/80 backdrop-blur text-ink-50 flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <UploadWidget
            value={null}
            onChange={addGalleryImage}
            kind="image"
          />
        </div>
      </Section>

      {/* Features */}
      <Section title="Features">
        <p className="text-sm text-ink-600">
          Bullet points shown in the Features tab on the product page.
        </p>
        <div className="space-y-2">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-400 w-8">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <Input
                value={feature}
                onChange={(e) => updateFeature(idx, e.target.value)}
                placeholder="A feature or benefit"
              />
              <button
                type="button"
                onClick={() => removeFeature(idx)}
                className="text-ink-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFeature}
          className="inline-flex items-center gap-1 text-sm text-ink-700 hover:text-ink-900"
        >
          <Plus size={14} />
          Add feature
        </button>
      </Section>

      {/* Variants */}
      <Section title="Pricing tiers">
        <p className="text-sm text-ink-600">
          One or more pricing tiers. Mark one as default — it shows first on the
          product page.
        </p>
        <div className="space-y-4">
          {variants.map((variant, idx) => (
            <VariantEditor
              key={variant.id ?? `new-${idx}`}
              variant={variant}
              idx={idx}
              onChange={(patch) => updateVariant(idx, patch)}
              onRemove={() => removeVariant(idx)}
              onSetDefault={() => setDefaultVariant(idx)}
              canRemove={variants.length > 1}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1 text-sm text-ink-700 hover:text-ink-900"
        >
          <Plus size={14} />
          Add another tier
        </button>
      </Section>

      {/* Submit */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 p-4 rounded-3xl border border-ink-200 bg-ink-50/95 backdrop-blur-xl">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={14} />
              {mode === "create" ? "Create product" : "Save changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-ink-200 bg-ink-50 p-6 lg:p-8 space-y-6">
      <h2 className="font-display text-xl text-ink-900 tracking-tight pb-4 border-b border-ink-200">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-widest text-ink-600 font-medium">
        {label}
      </label>
      {children}
      {help && <p className="text-xs text-ink-500">{help}</p>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-full border border-ink-300 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-ink-900 transition-colors"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function VariantEditor({
  variant,
  idx,
  onChange,
  onRemove,
  onSetDefault,
  canRemove,
}: {
  variant: VariantDraft;
  idx: number;
  onChange: (patch: Partial<VariantDraft>) => void;
  onRemove: () => void;
  onSetDefault: () => void;
  canRemove: boolean;
}) {
  const [includedItemsText, setIncludedItemsText] = useState(
    variant.includedItems.join("\n")
  );

  const handleIncludedChange = (value: string) => {
    setIncludedItemsText(value);
    onChange({
      includedItems: value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-colors",
        variant.isDefault
          ? "border-ink-900 bg-ink-900/[0.02]"
          : "border-ink-200 bg-ink-50"
      )}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={14} className="text-ink-400" />
          <span className="font-mono text-xs text-ink-500">
            TIER {String(idx + 1).padStart(2, "0")}
          </span>
          {variant.isDefault && (
            <span className="text-[10px] uppercase tracking-widest text-gold-700 font-medium px-2 py-0.5 rounded-full bg-gold-100">
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!variant.isDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              className="text-xs text-ink-600 hover:text-ink-900"
            >
              Make default
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-ink-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Field label="Name">
          <Input
            value={variant.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Standard"
          />
        </Field>
        <Field label="Price (USD)">
          <Input
            type="number"
            step="0.01"
            min="1"
            value={variant.priceCents ? (variant.priceCents / 100).toString() : ""}
            onChange={(e) => {
              const dollars = parseFloat(e.target.value);
              onChange({
                priceCents: Number.isNaN(dollars)
                  ? 0
                  : Math.round(dollars * 100),
              });
            }}
            placeholder="49.00"
          />
        </Field>
      </div>

      <Field
        label="Description"
        help="One line shown next to the variant on the product page."
      >
        <Input
          value={variant.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="The complete workspace."
        />
      </Field>

      <div className="mt-4">
        <Field
          label="What's included"
          help="One item per line. Shown as a checklist on the product page."
        >
          <textarea
            value={includedItemsText}
            onChange={(e) => handleIncludedChange(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-ink-300 bg-transparent px-4 py-3 text-sm placeholder:text-ink-400 focus:outline-none focus:border-ink-900 transition-colors font-mono"
            placeholder="Notion template&#10;Setup guide PDF&#10;Lifetime updates"
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Product file"
          help="Buyers download this after purchase."
        >
          <UploadWidget
            value={variant.fileUrl}
            onChange={(url) => onChange({ fileUrl: url })}
            kind="file"
          />
        </Field>
        <Field
          label="External link"
          help="Optional. Use for Notion template duplicate links, Google Sheets, etc."
        >
          <Input
            value={variant.externalUrl}
            onChange={(e) => onChange({ externalUrl: e.target.value })}
            placeholder="https://notion.so/..."
            type="url"
          />
        </Field>
      </div>
    </div>
  );
}
