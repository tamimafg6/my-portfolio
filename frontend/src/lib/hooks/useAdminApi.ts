import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Hook for making authenticated admin API calls.
 * Gets JWT token from auth service and includes it in requests.
 */
export function useAdminApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get JWT token from auth service
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const tokenResult = await authClient.token();
      return tokenResult.data?.token || null;
    } catch (err) {
      console.error("Failed to get auth token:", err);
      return null;
    }
  }, []);

  /**
   * Make an authenticated API call
   */
  const adminFetch = useCallback(
    async <T = unknown>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<{ data: T | null; error: string | null; status: number }> => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();

        if (!token) {
          setError("Not authenticated");
          return { data: null, error: "Not authenticated", status: 401 };
        }

        const url = endpoint.startsWith("http")
          ? endpoint
          : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
        });

        const status = response.status;

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          let errorMessage: string;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorJson.message || errorText;
          } catch {
            errorMessage = errorText;
          }
          setError(errorMessage);
          return { data: null, error: errorMessage, status };
        }

        const data = await response.json();
        return { data, error: null, status };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Request failed";
        setError(errorMessage);
        return { data: null, error: errorMessage, status: 0 };
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  /**
   * GET request
   */
  const get = useCallback(
    <T = unknown>(endpoint: string) => adminFetch<T>(endpoint, { method: "GET" }),
    [adminFetch]
  );

  /**
   * POST request
   */
  const post = useCallback(
    <T = unknown>(endpoint: string, body?: unknown) =>
      adminFetch<T>(endpoint, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      }),
    [adminFetch]
  );

  /**
   * PUT request
   */
  const put = useCallback(
    <T = unknown>(endpoint: string, body?: unknown) =>
      adminFetch<T>(endpoint, {
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
      }),
    [adminFetch]
  );

  /**
   * PATCH request
   */
  const patch = useCallback(
    <T = unknown>(endpoint: string, body?: unknown) =>
      adminFetch<T>(endpoint, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      }),
    [adminFetch]
  );

  /**
   * DELETE request
   */
  const del = useCallback(
    <T = unknown>(endpoint: string) => adminFetch<T>(endpoint, { method: "DELETE" }),
    [adminFetch]
  );

  /**
   * Upload file with authentication
   */
  const uploadFile = useCallback(
    async (
      endpoint: string,
      file: File,
      fieldName: string = "file"
    ): Promise<{ data: unknown | null; error: string | null; status: number }> => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();

        if (!token) {
          setError("Not authenticated");
          return { data: null, error: "Not authenticated", status: 401 };
        }

        const formData = new FormData();
        formData.append(fieldName, file);

        const url = endpoint.startsWith("http")
          ? endpoint
          : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type for FormData - browser sets it with boundary
          },
          body: formData,
        });

        const status = response.status;

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Upload failed");
          setError(errorText);
          return { data: null, error: errorText, status };
        }

        const data = await response.json();
        return { data, error: null, status };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        return { data: null, error: errorMessage, status: 0 };
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  return {
    loading,
    error,
    getToken,
    adminFetch,
    get,
    post,
    put,
    patch,
    del,
    uploadFile,
  };
}
