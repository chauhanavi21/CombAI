import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders, users } from "@/lib/db/schema";
import { getOrCreateDownloadToken } from "@/lib/db/queries-downloads";

const requestSchema = z.object({
  orderItemId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify ownership: this order item must belong to the requesting user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = await db.query.orderItems.findFirst({
      where: eq(orderItems.id, parsed.data.orderItemId),
      with: {
        order: true,
      },
    });

    if (!item || item.order?.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (item.order.status !== "paid") {
      return NextResponse.json(
        { error: "Order is not eligible for download" },
        { status: 403 }
      );
    }

    const token = await getOrCreateDownloadToken(item.id, user.id);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return NextResponse.json({
      url: `${baseUrl}/api/download/${token}`,
    });
  } catch (err) {
    console.error("Refresh download error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
