import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3-compatible object storage (Supabase Storage S3 endpoint)
const endpoint = process.env.STORAGE_ENDPOINT;
const region = process.env.STORAGE_REGION || "us-east-1";
const bucket = process.env.STORAGE_BUCKET;
const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "File storage requires STORAGE_ENDPOINT, STORAGE_BUCKET, STORAGE_ACCESS_KEY_ID, and STORAGE_SECRET_ACCESS_KEY"
    );
  }
  if (!client) {
    client = new S3Client({
      endpoint,
      region,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return client;
}

/**
 * Upload a buffer to the private bucket. Returns the object key for storage.
 */
export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const s3 = getClient();
  const input: PutObjectCommandInput = {
    Bucket: bucket!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };
  await s3.send(new PutObjectCommand(input));
  return key;
}

/**
 * Generate a temporary presigned URL for a private object (e.g. 15 min). Use for download/view without making the bucket public.
 */
export async function getPresignedUrl(
  key: string,
  expiresInSeconds = 900
): Promise<string> {
  const s3 = getClient();
  const command = new GetObjectCommand({
    Bucket: bucket!,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export function isConfigured(): boolean {
  return !!(endpoint && bucket && accessKeyId && secretAccessKey);
}
