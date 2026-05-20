"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refundOrderAction } from "@/app/admin/orders/actions";

interface Props {
  orderId: string;
}

export function RefundButton({ orderId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 5000);
      return;
    }

    startTransition(async () => {
      const result = await refundOrderAction(orderId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2 items-end">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Refunding...
          </>
        ) : confirming ? (
          <>
            <RefreshCcw size={14} />
            Confirm refund
          </>
        ) : (
          <>
            <RefreshCcw size={14} />
            Issue refund
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-700 max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
