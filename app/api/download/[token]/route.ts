import { NextRequest, NextResponse } from "next/server";
import {
  resolveDownloadToken,
  recordDownload,
} from "@/lib/db/queries-downloads";
import { getSignedDownloadUrl } from "@/lib/r2";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { token } = await params;

  if (!token || token.length < 16) {
    return NextResponse.json(
      { error: "Invalid download token" },
      { status: 400 }
    );
  }

  const info = await resolveDownloadToken(token);

  if (!info) {
    return NextResponse.json(
      { error: "Download link not found" },
      { status: 404 }
    );
  }

  if (info.expired) {
    return NextResponse.json(
      {
        error: "Download link has expired",
        message:
          "Please sign in to your dashboard to generate a fresh download link.",
      },
      { status: 410 } // Gone
    );
  }

  // Track the download (don't await to avoid slowing the redirect)
  recordDownload(token).catch((err) =>
    console.error("Failed to record download:", err)
  );

  // External URL (e.g., Notion template duplicate link) — redirect directly
  if (info.externalUrl) {
    return NextResponse.redirect(info.externalUrl);
  }

  // R2-hosted file — generate signed URL and redirect
  if (info.fileUrl) {
    try {
      const filename = `${info.productTitle} - ${info.variantName}`;
      const signedUrl = await getSignedDownloadUrl(
        info.fileUrl,
        900, // 15 min
        filename
      );
      return NextResponse.redirect(signedUrl);
    } catch (err) {
      console.error("Failed to generate signed URL:", err);
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 }
      );
    }
  }

  // Neither file_url nor external_url set — admin hasn't uploaded the file yet
  return NextResponse.json(
    {
      error: "File not yet available",
      message:
        "This product is still being prepared. We'll email you as soon as it's ready.",
    },
    { status: 503 }
  );
}
