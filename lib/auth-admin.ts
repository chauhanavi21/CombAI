import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Server-side check: get current user's DB record, ensuring they're an admin.
 * Redirects to home if not signed in or not admin.
 *
 * Use this at the top of every admin page/route.
 */
export async function requireAdmin() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user || !user.isAdmin) {
    redirect("/");
  }

  return user;
}

/**
 * For API routes: returns user or null. Routes decide what to do.
 */
export async function getAdminUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user || !user.isAdmin) return null;
  return user;
}
