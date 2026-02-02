/**
 * Get the auth service base URL WITHOUT /api/auth for manual fetch calls.
 * Use this when you're manually adding /api/auth to the path.
 */
export function getAuthServiceBaseUrl(): string {
  // For server-side (Next.js API routes), use AUTH_SERVICE_URL or fallback
  // For client-side, use NEXT_PUBLIC_AUTH_URL
  let url: string;
  
  if (typeof window === "undefined") {
    // Server-side - check if we're in Docker or local
    // In Docker: use service name (auth-service:3001)
    // Locally: use localhost:3001
    // Check if AUTH_SERVICE_URL is set (Docker) or use localhost (local dev)
    if (process.env.AUTH_SERVICE_URL) {
      url = process.env.AUTH_SERVICE_URL;
    } else if (process.env.AUTH_URL) {
      url = process.env.AUTH_URL;
    } else {
      // Try to detect if we're in Docker by checking if we can resolve the service name
      // Default to localhost for local development
      url = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001";
    }
  } else {
    // Client-side - always use localhost or NEXT_PUBLIC_AUTH_URL
    url = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001";
  }
  
  // Remove trailing slash if present
  url = url.trim().replace(/\/$/, "");
  
  // Remove /api/auth if present (for manual fetch calls that add it themselves)
  url = url.replace(/\/api\/auth\/?$/, "");
  
  return url;
}

/**
 * Get the auth service base URL for BetterAuth client.
 * Centralized to avoid duplication and ensure consistency.
 *
 * For this portfolio:
 * - Dev: Auth service runs on http://localhost:3001
 * - BetterAuth adds /api/auth automatically when baseURL has no path
 */
export function getAuthServiceUrl(): string {
  let url =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001"
      : process.env.AUTH_SERVICE_URL ||
        process.env.NEXT_PUBLIC_AUTH_URL ||
        "http://localhost:3001";

  // Remove trailing slash if present
  url = url.trim().replace(/\/$/, "");

  return url;
}
