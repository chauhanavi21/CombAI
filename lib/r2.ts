import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
  // We don't throw at import time because the build process imports this for routes
  // that may not need R2. We throw at call time instead.
  console.warn("R2 credentials are not fully configured");
}

/**
 * R2 is S3-compatible, so we use the AWS S3 SDK pointed at R2's endpoint.
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
  },
});

export const R2_BUCKET = bucketName ?? "";

/**
 * Generate a time-limited signed URL for downloading a file.
 * Default expiry: 15 minutes. Long enough to download, short enough that shared links die fast.
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds = 900,
  downloadFilename?: string
): Promise<string> {
  if (!R2_BUCKET) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    // Force browser to download rather than display, with a clean filename
    ResponseContentDisposition: downloadFilename
      ? `attachment; filename="${sanitizeFilename(downloadFilename)}"`
      : "attachment",
  });

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a signed URL for uploading. Used by admin panel in Week 6.
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<string> {
  if (!R2_BUCKET) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Direct upload from server (used by upload utility script).
 */
export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  if (!R2_BUCKET) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Delete a file from R2.
 */
export async function deleteFile(key: string): Promise<void> {
  if (!R2_BUCKET) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })
  );
}

/**
 * Strip dangerous characters from filenames before using in headers.
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Generate a unique R2 key for a product file.
 * Pattern: products/{productId}/{variantName}/{timestamp}-{filename}
 */
export function buildProductFileKey(
  productId: string,
  variantName: string,
  filename: string
): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeVariant = variantName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const timestamp = Date.now();
  return `products/${productId}/${safeVariant}/${timestamp}-${safeName}`;
}
