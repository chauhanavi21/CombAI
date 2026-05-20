"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadWidgetProps {
  value: string | null;
  onChange: (value: string | null) => void;
  kind: "image" | "file";
  label?: string;
  className?: string;
}

export function UploadWidget({
  value,
  onChange,
  kind,
  label,
  className,
}: UploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isImage = kind === "image";
  const accept = isImage
    ? "image/jpeg,image/png,image/webp,image/avif"
    : ".pdf,.zip,.docx,.xlsx,.txt,.md";

  return (
    <div className={className}>
      {label && (
        <p className="label-eyebrow mb-3">{label}</p>
      )}

      {value ? (
        <div className="relative rounded-2xl border border-ink-200 bg-ink-100 overflow-hidden">
          {isImage ? (
            <div className="aspect-video relative">
              <Image
                src={value}
                alt="Uploaded"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="p-4 flex items-center gap-3">
              <FileText size={20} className="text-ink-600 flex-shrink-0" />
              <p className="text-sm text-ink-700 truncate flex-1">{value}</p>
            </div>
          )}
          <button
            onClick={handleClear}
            type="button"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink-900/80 hover:bg-ink-900 backdrop-blur text-ink-50 flex items-center justify-center transition-colors"
            aria-label="Remove"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "block rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 cursor-pointer transition-all duration-300 hover:border-ink-400",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="aspect-video flex flex-col items-center justify-center gap-2 p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 size={20} className="text-ink-500 animate-spin" />
                <span className="text-sm text-ink-600">Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={20} className="text-ink-500" />
                <span className="text-sm text-ink-700 font-medium">
                  {isImage ? "Upload image" : "Upload file"}
                </span>
                <span className="text-xs text-ink-500">
                  {isImage
                    ? "JPG, PNG, WEBP — max 10MB"
                    : "PDF, ZIP, DOCX, XLSX — max 10MB"}
                </span>
              </>
            )}
          </div>
        </label>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
