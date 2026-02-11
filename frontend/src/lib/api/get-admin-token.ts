import { NextRequest } from "next/server";
import { getAuthServiceBaseUrl } from "@/lib/utils/auth-url";

/**
 * Get JWT token from auth service for server-side admin API calls.
 * Returns null if not authenticated.
 */
export async function getAdminToken(request: NextRequest): Promise<string | null> {
  const cookies = request.headers.get("cookie") || "";
  const authServiceUrl = getAuthServiceBaseUrl();
  // Auth base URL is e.g. https://tamimafg.dev/auth; token endpoint is /auth/token (not /auth/api/auth/token)
  const tokenUrl = `${authServiceUrl}/token`;

  const tokenRes = await fetch(tokenUrl, {
    method: "GET",
    headers: { Cookie: cookies },
    credentials: "include",
  });

  if (!tokenRes.ok) return null;
  const data = await tokenRes.json().catch(() => ({}));
  return data?.token ?? null;
}
