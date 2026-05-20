"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/app/admin/products/actions";

interface Props {
  productId: string;
  productTitle: string;
}

export function DeleteProductButton({ productId, productTitle }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      // Auto-cancel after 5 seconds
      setTimeout(() => setConfirming(false), 5000);
      return;
    }

    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
        return;
      }
      router.push("/admin/products");
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant={confirming ? "primary" : "secondary"}
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className={confirming ? "bg-red-600 hover:bg-red-700" : ""}
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Deleting...
          </>
        ) : confirming ? (
          <>
            <Trash2 size={14} />
            Confirm delete
          </>
        ) : (
          <>
            <Trash2 size={14} />
            Delete
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-700 max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
