import { Users, Download } from "lucide-react";
import { getAllSubscribers } from "@/lib/db/queries-admin";
import { Badge } from "@/components/ui/badge";
import { ExportSubscribersButton } from "@/components/admin/export-subscribers-button";
import { formatDate } from "@/lib/utils";

export default async function AdminSubscribersPage() {
  const subscribers = await getAllSubscribers();
  const activeCount = subscribers.filter((s) => !s.unsubscribedAt).length;

  return (
    <>
      <header className="flex items-end justify-between mb-12 gap-6">
        <div>
          <p className="label-eyebrow mb-3">Audience</p>
          <h1 className="font-display text-display-sm text-ink-900 tracking-tight">
            Subscribers
          </h1>
          <p className="mt-2 text-ink-600">
            {activeCount} active · {subscribers.length} all-time
          </p>
        </div>
        {subscribers.length > 0 && (
          <ExportSubscribersButton subscribers={subscribers} />
        )}
      </header>

      {subscribers.length === 0 ? (
        <div className="rounded-3xl border border-ink-200 bg-ink-50 py-20 text-center">
          <Users className="mx-auto mb-4 text-ink-300" size={32} />
          <p className="text-ink-600">No subscribers yet.</p>
          <p className="text-sm text-ink-500 mt-1">
            Newsletter signups from the footer and purchase confirmations
            populate this list.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-ink-200 bg-ink-50 overflow-hidden">
          <ul className="divide-y divide-ink-200">
            {subscribers.map((sub) => (
              <li
                key={sub.id}
                className="flex items-center justify-between gap-4 px-6 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-900 truncate">{sub.email}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Joined {formatDate(sub.subscribedAt)}
                    {sub.unsubscribedAt &&
                      ` · Unsubscribed ${formatDate(sub.unsubscribedAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-[10px] py-0.5 px-2">
                    {sub.source}
                  </Badge>
                  {sub.unsubscribedAt && (
                    <Badge
                      variant="default"
                      className="text-[10px] py-0.5 px-2"
                    >
                      Unsubscribed
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
