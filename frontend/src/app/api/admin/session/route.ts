import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-token";

/** Returns whether the admin cookie is valid, plus the token for Bearer calls to the backend. */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authenticated = await verifyAdminToken(token);
  return NextResponse.json(
    authenticated ? { authenticated: true, token } : { authenticated: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
