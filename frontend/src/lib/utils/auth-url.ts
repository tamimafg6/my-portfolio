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
    // Client-side: prefer NEXT_PUBLIC_AUTH_URL so production hits the auth service
    if (process.env.NEXT_PUBLIC_AUTH_URL?.trim()) {
      url = process.env.NEXT_PUBLIC_AUTH_URL.trim();
    } else if (window.location.origin && !window.location.origin.startsWith("http://localhost") && !window.location.origin.startsWith("http://127.0.0.1")) {
      url = `${window.location.origin.replace(/\/$/, "")}/auth`;
    } else {
      url = "http://localhost:3001";
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
 * - When NEXT_PUBLIC_AUTH_URL is set (e.g. production): use it so auth requests hit the auth service.
 * - On localhost: use NEXT_PUBLIC_AUTH_URL or localhost:3001.
 * - Otherwise same-origin /auth (only when you proxy /auth to the auth service).
 */
export function getAuthServiceUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: prefer explicit auth URL so production can point to the auth service (fixes 404 when auth is separate app)
    const envUrl = process.env.NEXT_PUBLIC_AUTH_URL;
    if (envUrl && envUrl.trim()) {
      return envUrl.trim().replace(/\/$/, "").replace(/\/api\/auth\/?$/, "");
    }
    const origin = window.location.origin;
    if (origin && !origin.startsWith("http://localhost") && !origin.startsWith("http://127.0.0.1")) {
      return `${origin.replace(/\/$/, "")}/auth`;
    }
    return "http://localhost:3001";
  }
  // Server-side
  const url =
    process.env.AUTH_SERVICE_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    "http://localhost:3001";
  return url.trim().replace(/\/$/, "").replace(/\/api\/auth\/?$/, "");
}
