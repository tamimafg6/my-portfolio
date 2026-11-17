"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";

const ADMIN_ERROR_KEYS = [
  "passwordRequired",
  "loginFailed",
  "unexpectedError",
] as const;

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const locale = useLocale();
  const t = useTranslations("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("passwordRequired");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signIn(password);
      if (result.error) {
        setError("loginFailed");
        setLoading(false);
        return;
      }
      window.location.href = `/${locale}/admin/dashboard`;
    } catch {
      setError("unexpectedError");
      setLoading(false);
    }
  };

  const displayError = error && (ADMIN_ERROR_KEYS as readonly string[]).includes(error)
    ? t(error as (typeof ADMIN_ERROR_KEYS)[number])
    : error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("login")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("loginSubtitle")}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {displayError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
              {displayError}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="••••••••"
              disabled={loading}
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? t("signingIn") : t("signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}
