"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";

export default function AdminPage() {
  const router = useRouter();
  const locale = useLocale();
  const { authorized, loading } = useAdminAccess();

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    } else if (!loading && authorized) {
      // Redirect to dashboard if authorized
      router.push(`/${locale}/admin/dashboard`);
    }
  }, [authorized, loading, router, locale]);

  if (loading || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
