"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { parseAuthError } from "@/shared/lib/auth/parse-error";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || email.trim().length === 0) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!password || password.length === 0) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: true,
      });

      const resultWithError = result as
        | { error?: { message?: string } | string | unknown }
        | { data?: unknown };

      if ("error" in resultWithError && resultWithError.error) {
        const defaultMessage = "Login failed. Please check your credentials.";
        const errorMessage = parseAuthError(
          resultWithError.error,
          defaultMessage,
        );
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Verify admin role from JWT token
      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (token) {
        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
          const base64Url = tokenParts[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "=",
          );
          const payload = JSON.parse(atob(padded));

          if (payload.role?.toLowerCase() !== "admin") {
            setError("Access denied. Admin privileges required.");
            await authClient.signOut();
            setLoading(false);
            return;
          }
        }
      }

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err) {
      const errorMessage = parseAuthError(err, "An unexpected error occurred");
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access the portfolio admin panel
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="admin@example.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
