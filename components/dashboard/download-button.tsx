"use client";

import { useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  orderItemId: string;
}

export function DownloadButton({ orderItemId }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/refresh-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Failed to generate download link");
      }

      // Open in same tab — browser handles the file download
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        variant="primary"
        size="md"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <Download size={14} />
            Download
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
