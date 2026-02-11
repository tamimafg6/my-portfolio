import { NextRequest } from "next/server";
import { getAuthServiceBaseUrl } from "@/lib/utils/auth-url";

/**
 * Get JWT token from auth service for server-side admin API calls.
 * Returns null if not authenticated.
 */
export async function getAdminToken(request: NextRequest): Promise<string | null> {
  const cookies = request.headers.get("cookie") || "";
  const authServiceUrl = getAuthServiceBaseUrl();
  const tokenUrl = `${authServiceUrl}/api/auth/token`;

  const tokenRes = await fetch(tokenUrl, {
    method: "GET",
    headers: { Cookie: cookies },
    credentials: "include",
    cache: "no-store",
  });

  if (!tokenRes.ok) return null;
  const data = await tokenRes.json().catch(() => ({}));
  return data?.token ?? null;
}
