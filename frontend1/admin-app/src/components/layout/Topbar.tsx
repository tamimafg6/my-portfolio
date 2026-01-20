"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, User, Clock } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getAuthServiceBaseUrl } from "@/lib/utils/auth-url";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/lib/i18n";

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      // Call our custom logout endpoint to ensure all cookies are cleared
      const authServiceUrl = getAuthServiceBaseUrl();
      await fetch(`${authServiceUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Also call Better Auth's signOut for session cleanup
      await authClient.signOut();

      // Force a full page reload to clear all client-side state
      // Use router.push which respects basePath configuration
      router.push("/login");
      // Force reload after navigation to clear all state
      window.location.reload();
    } catch (error) {
      // Even if signOut fails, redirect to login
      router.push("/login");
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <div className="flex flex-1 items-center justify-end gap-4">
        {/* Language toggle */}
        <LanguageToggle />

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={t("Toggle theme", "Basculer le thème")}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        {/* User menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label={t("User menu", "Menu utilisateur")}
          >
            <User className="h-5 w-5" />
          </Button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border bg-popover shadow-lg">
                <div className="p-2 space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      router.push("/dashboard/sessions");
                      setShowUserMenu(false);
                    }}
                  >
                    <Clock className="h-4 w-4" />
                    {t("Sessions", "Sessions")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("Sign Out", "Déconnexion")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

