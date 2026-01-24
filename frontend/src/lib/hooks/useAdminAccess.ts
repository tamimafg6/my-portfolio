import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { getAuthServiceBaseUrl } from "@/lib/utils/auth-url";

/**
 * Custom hook to check if the current user has ADMIN role.
 * Redirects to login if not authenticated or not an admin.
 *
 * @returns { authorized: boolean, loading: boolean }
 */
export function useAdminAccess() {
  const router = useRouter();
  const locale = useLocale();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const extractRoleFromToken = async (): Promise<string | null> => {
      try {
        const tokenResult = await authClient.token();
        const token = tokenResult.data?.token;

        if (!token) {
          return null;
        }

        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
          const base64Url = tokenParts[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "=",
          );

          try {
            const payload = JSON.parse(atob(padded));
            return payload.role || null;
          } catch {
            return null;
          }
        }
      } catch {
        return null;
      }
      return null;
    };

    const checkAccess = async () => {
      try {
        const session = await authClient.getSession();

        if (!session.data?.session) {
          router.push(`/${locale}/admin/login`);
          return;
        }

        // Extract role from JWT token
        const role = await extractRoleFromToken();

        if (role?.toLowerCase() !== "admin") {
          router.push(
            `/${locale}/admin/login?error=Access denied. Admin privileges required.`,
          );
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
