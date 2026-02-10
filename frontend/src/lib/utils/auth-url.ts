/**
 * Get the auth service base URL WITHOUT /api/auth for manual fetch calls.
 * Use this when you're manually adding /api/auth to the path.
 */
export function getAuthServiceBaseUrl(): string {
  // For server-side (Next.js API routes), use AUTH_SERVICE_URL or fallback
  // For client-side, use NEXT_PUBLIC_AUTH_URL
  let url: string;
  
  if (typeof window === "undefined") {
    // Server-side
    if (process.env.AUTH_SERVICE_URL) url = process.env.AUTH_SERVICE_URL;
    else if (process.env.AUTH_URL) url = process.env.AUTH_URL;
    else url = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001";
  } else {
    // Client-side: same-origin when on your domain, else env or localhost
    const origin = window.location.origin;
    if (origin && !origin.startsWith("http://localhost") && !origin.startsWith("http://127.0.0.1")) {
      url = `${origin.replace(/\/$/, "")}/auth`;
    } else {
      url = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001";
    }
  }
  
  // Remove trailing slash if present
  url = url.trim().replace(/\/$/, "");
  
  // Remove /api/auth if present (for manual fetch calls that add it themselves)
  url = url.replace(/\/api\/auth\/?$/, "");
  
  return url;
}

/**
 * Get the auth service base URL for BetterAuth client.
 * - In the browser on your domain (e.g. tamimafg.dev): use same origin + /auth so it always matches.
 * - In the browser on localhost: use NEXT_PUBLIC_AUTH_URL or localhost:3001.
 * - Server-side: use env (AUTH_SERVICE_URL, NEXT_PUBLIC_AUTH_URL) or localhost for dev.
 */
export function getAuthServiceUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: if we're on a non-localhost origin (e.g. tamimafg.dev), use same origin so auth works regardless of build-time env
    const origin = window.location.origin;
    if (origin && !origin.startsWith("http://localhost") && !origin.startsWith("http://127.0.0.1")) {
      return `${origin.replace(/\/$/, "")}/auth`;
    }
    return process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001";
  }
  // Server-side
  const url =
    process.env.AUTH_SERVICE_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    "http://localhost:3001";
  return url.trim().replace(/\/$/, "");
}
