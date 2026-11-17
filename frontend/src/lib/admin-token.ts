import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "admin_token";
export const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_TOKEN_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_TOKEN_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyAdminToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
