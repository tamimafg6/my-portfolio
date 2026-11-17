import { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-token";

/**
 * Get the admin token (from the Bearer header or the admin cookie) for server-side
 * admin API calls. Returns null if not authenticated.
 */
export async function getAdminToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const token = bearer || request.cookies.get(ADMIN_COOKIE)?.value || null;
  return (await verifyAdminToken(token)) ? token : null;
}
