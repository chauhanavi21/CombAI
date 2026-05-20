import Link from "next/link";
import { requireAdmin } from "@/lib/auth-admin";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-ink-100/40">
      <div className="container-lux pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <div className="mb-8">
                <p className="label-eyebrow mb-2">Admin</p>
                <Link
                  href="/admin"
                  className="font-display text-2xl text-ink-900 tracking-tight hover:text-ink-700 transition-colors"
                >
                  Control room
                </Link>
              </div>
              <AdminNav />
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
