import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.DO_SPACES_ENDPOINT;
const bucket = process.env.DO_SPACES_BUCKET;
const accessKeyId = process.env.DO_SPACES_ACCESS_KEY_ID ?? process.env.SPACES_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.DO_SPACES_SECRET_ACCESS_KEY ?? process.env.SPACES_SECRET_ACCESS_KEY;
const cdnBaseUrl = process.env.DO_SPACES_CDN_URL;

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "DigitalOcean Spaces requires DO_SPACES_ENDPOINT, DO_SPACES_BUCKET, DO_SPACES_ACCESS_KEY_ID, and DO_SPACES_SECRET_ACCESS_KEY (or SPACES_ACCESS_KEY_ID / SPACES_SECRET_ACCESS_KEY)"
    );
  }
  if (!client) {
    client = new S3Client({
      endpoint,
      region: "us-east-1",
      forcePathStyle: false,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return client;
}

/**
 * Upload a buffer to DigitalOcean Spaces (private). Returns the object key for storage.
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

/**
 * Return the public URL for an object key (only used if bucket were public).
 */
export function getPublicUrl(key: string): string {
  if (cdnBaseUrl) {
    const base = cdnBaseUrl.replace(/\/$/, "");
    return `${base}/${key}`;
  }
  if (!endpoint || !bucket) {
    throw new Error("DO_SPACES_ENDPOINT and DO_SPACES_BUCKET are required");
  }
  const host = endpoint.replace(/^https?:\/\//, "");
  return `https://${bucket}.${host}/${key}`;
}

export function isConfigured(): boolean {
  return !!(endpoint && bucket && accessKeyId && secretAccessKey);
}
