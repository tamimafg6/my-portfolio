import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";

/**
 * Custom hook to check if the admin is logged in.
 * Redirects to login if not authenticated.
 *
 * @returns { authorized: boolean, loading: boolean }
 */
export function useAdminAccess() {
  const router = useRouter();
  const locale = useLocale();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const session = await authClient.getSession();

        if (!session.data?.session) {
          router.push(`/${locale}/admin/login`);
          return;
        }

        setAuthorized(true);
      } catch {
        router.push(`/${locale}/admin/login`);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router, locale]);

  return { authorized, loading };
}
