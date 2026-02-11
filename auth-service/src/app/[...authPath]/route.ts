import { NextRequest, NextResponse } from "next/server";
import { GET as authApiGET, POST as authApiPOST } from "@/app/api/auth/[...all]/route";
import { GET as tokenGET, POST as tokenPOST } from "@/app/api/auth/token/route";

/**
 * When the platform (e.g. Digital Ocean) routes tamimafg.dev/auth/* to this service
 * and strips the /auth prefix, we receive /token, /sign-in/email, /get-session, etc.
 * Forward to the right handler: /token is our custom route, the rest go to Better Auth [...all].
 */
function normalizeSegments(pathSegments: string[]): string[] | null {
  if (!pathSegments?.length) return null;
  let segments = pathSegments;
  if (segments[0] === "auth") segments = segments.slice(1);
  if (!segments.length) return null;
  return segments;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ authPath: string[] }> }
) {
  const pathSegments = (await params).authPath;
  const segments = normalizeSegments(pathSegments);
  if (!segments) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // /auth/token -> custom token route (session JWT); [...all] does not handle it
  if (segments[0] === "token") {
    return tokenGET(request);
  }
  const internalPath = `/api/auth/${segments.join("/")}`;
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
  const segments = normalizeSegments(pathSegments);
  if (!segments) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (segments[0] === "token") {
    return tokenPOST(request);
  }
  const internalPath = `/api/auth/${segments.join("/")}`;
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
