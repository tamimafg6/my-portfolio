import { NextRequest, NextResponse } from "next/server";
import { GET as authApiGET, POST as authApiPOST } from "@/app/api/auth/[...all]/route";

/**
 * When the platform (e.g. Digital Ocean) routes tamimafg.dev/auth/* to this service
 * and strips the /auth prefix, we receive /sign-in/email, /get-session, etc.
 * Forward to /api/auth/... so Better Auth can handle them (fixes 404 on login).
 */
function buildInternalPath(pathSegments: string[]): string | null {
  if (!pathSegments?.length) return null;
  let segments = pathSegments;
  if (segments[0] === "auth") segments = segments.slice(1);
  if (!segments.length) return null;
  return `/api/auth/${segments.join("/")}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ authPath: string[] }> }
) {
  const pathSegments = (await params).authPath;
  const internalPath = buildInternalPath(pathSegments);
  if (!internalPath) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = new URL(request.url);
  const rewriteUrl = new URL(internalPath, url.origin);
  rewriteUrl.search = url.search;
  const rewritten = new NextRequest(rewriteUrl, { method: "GET", headers: request.headers });
  return authApiGET(rewritten);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ authPath: string[] }> }
) {
  const pathSegments = (await params).authPath;
  const internalPath = buildInternalPath(pathSegments);
  if (!internalPath) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = new URL(request.url);
  const rewriteUrl = new URL(internalPath, url.origin);
  rewriteUrl.search = url.search;
  const body = await request.text();
  const rewritten = new NextRequest(rewriteUrl, {
    method: "POST",
    headers: request.headers,
    body: body || undefined,
  });
  return authApiPOST(rewritten);
}
