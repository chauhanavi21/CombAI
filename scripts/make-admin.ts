/**
 * Grant admin access to a user by email.
 *
 * Usage:
 *   npm run make-admin -- you@example.com
 *
 * The user must have signed up first (so they exist in Clerk).
 * Run this once after creating your account.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { users } from "../lib/db/schema";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exit(1);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    console.error(
      "   Sign up at /sign-up first, then run this script again."
    );
    process.exit(1);
  }

  await db
    .update(users)
    .set({ isAdmin: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  console.log(`✅ ${email} is now an admin`);
  console.log(`   Visit /admin to access the dashboard.`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
