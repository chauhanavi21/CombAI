"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subscriber {
  email: string;
  source: string;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
}

interface Props {
  subscribers: Subscriber[];
}

export function ExportSubscribersButton({ subscribers }: Props) {
  const handleExport = () => {
    // Build CSV
    const header = "email,source,subscribed_at,unsubscribed_at";
    const rows = subscribers.map((s) =>
      [
        s.email,
        s.source,
        new Date(s.subscribedAt).toISOString(),
        s.unsubscribedAt ? new Date(s.unsubscribedAt).toISOString() : "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleExport} variant="secondary" size="sm">
      <Download size={14} />
      Export CSV
    </Button>
  );
}
