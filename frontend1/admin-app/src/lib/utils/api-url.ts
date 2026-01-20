/**
 * Get the normalized API base URL.
 * Centralized to avoid duplication and ensure consistency.
 * Normalizes the URL to ensure /api prefix is included for both dev and prod.
 * 
 * Works for both:
 * - Development: http://localhost:8080 → http://localhost:8080/api
 * - Production: https://api.passionjerseys.me/api → stays as is
 */
export function getApiUrl(): string {
  let apiUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      : process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080";

  // Ensure /api prefix is included (add it if missing, but don't duplicate it)
  if (!apiUrl.endsWith("/api")) {
    apiUrl = `${apiUrl.replace(/\/$/, "")}/api`;
  }

  return apiUrl;
}
