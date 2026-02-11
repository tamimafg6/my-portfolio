import { NextRequest, NextResponse } from "next/server";
import { GET as authApiGET, POST as authApiPOST } from "@/app/api/auth/[...all]/route";

/**
 * Catch-all for when the platform (e.g. DigitalOcean) routes /auth/* to this service
 * and strips the /auth prefix. So we receive /sign-in/email, /get-session, etc.
 * Forward to /api/auth/... so the Better Auth handler can process them.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ authPath: string[] }> }
) {
  const resolved = await params;
  let pathSegments = resolved.authPath;
  if (!pathSegments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (pathSegments[0] === "auth") {
    pathSegments = pathSegments.slice(1);
    if (!pathSegments.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const internalPath = `/api/auth/${pathSegments.join("/")}`;
  const url = new URL(request.url);
  const rewriteUrl = new URL(internalPath, url.origin);
  rewriteUrl.search = url.search;
  const rewritten = new NextRequest(rewriteUrl, {
    method: "GET",
    headers: request.headers,
  });
  return authApiGET(rewritten);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ authPath: string[] }> }
) {
  const resolved = await params;
  let pathSegments = resolved.authPath;
  if (!pathSegments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (pathSegments[0] === "auth") {
    pathSegments = pathSegments.slice(1);
    if (!pathSegments.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const internalPath = `/api/auth/${pathSegments.join("/")}`;
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
