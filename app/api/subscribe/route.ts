import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailSubscribers } from "@/lib/db/schema";

const bodySchema = z.object({
  email: z.string().email(),
  source: z
    .enum(["newsletter", "lead_magnet", "purchase"])
    .default("newsletter"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email" },
        { status: 400 }
      );
    }

    const { email, source } = parsed.data;

    // Check for existing
    const existing = await db.query.emailSubscribers.findFirst({
      where: eq(emailSubscribers.email, email),
    });

    if (existing) {
      // If they unsubscribed previously, re-subscribe them
      if (existing.unsubscribedAt) {
        await db
          .update(emailSubscribers)
          .set({ unsubscribedAt: null, subscribedAt: new Date(), source })
          .where(eq(emailSubscribers.id, existing.id));
      }
      // Otherwise: already subscribed. Treat as success (don't leak existence).
      return NextResponse.json({ success: true });
    }

    await db.insert(emailSubscribers).values({
      email,
      source,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed. Try again." },
      { status: 500 }
    );
  }
}
