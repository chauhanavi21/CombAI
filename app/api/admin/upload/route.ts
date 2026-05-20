import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth-admin";
import { uploadFile } from "@/lib/r2";

export const runtime = "nodejs";
// Increase body size limit for images (default 1MB is tight for product photos)
export const maxDuration = 30;

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB cap
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const ALLOWED_FILE_TYPES = new Set([
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
  "text/plain",
  "text/markdown",
]);

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const kind = formData.get("kind"); // "image" or "file"

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isImageOnly = kind === "image";
    const allowed = isImageOnly ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;

    if (!allowed.has(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Build R2 key
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const folder = isImageOnly ? "images" : "files";
    const key = `${folder}/${timestamp}-${safeName}`;

    // Upload
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadFile(key, buffer, file.type);

    // For images, build the public R2.dev URL so we can display them
    // For files, return only the key — they're served via signed URLs
    const publicUrl = process.env.R2_PUBLIC_URL;
    const url =
      isImageOnly && publicUrl
        ? `${publicUrl}/${key}`
        : key;

    return NextResponse.json({
      key,
      url,
      isImage: isImageOnly,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Check server logs." },
      { status: 500 }
    );
  }
}
