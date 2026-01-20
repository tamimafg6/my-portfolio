/**
 * Get the auth service base URL WITHOUT /api/auth for manual fetch calls.
 * Use this when you're manually adding /api/auth to the path.
 */
export function getAuthServiceBaseUrl(): string {
  const url = getAuthServiceUrl();
  // Remove /api/auth if present (for manual fetch calls that add it themselves)
  return url.replace(/\/api\/auth\/?$/, "");
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
