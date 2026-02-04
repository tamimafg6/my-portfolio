"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Code,
  Briefcase,
  GraduationCap,
  Settings,
  Eye,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Heart,
  Languages,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.sidebar");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard,
      route: "/admin/dashboard",
    },
    {
      id: "projects",
      label: t("projects"),
      icon: FolderKanban,
      route: "/admin/projects",
    },
    {
      id: "skills",
      label: t("skills"),
      icon: Code,
      route: "/admin/skills",
    },
    {
      id: "experience",
      label: t("experience"),
      icon: Briefcase,
      route: "/admin/experience",
    },
    {
      id: "education",
      label: t("education"),
      icon: GraduationCap,
      route: "/admin/education",
    },
    {
      id: "testimonials",
      label: t("testimonials"),
      icon: MessageSquare,
      route: "/admin/testimonials",
    },
    {
      id: "hobbies",
      label: t("hobbies"),
      icon: Heart,
      route: "/admin/hobbies",
    },
    {
      id: "messages",
      label: t("messages"),
      icon: MessageSquare,
      route: "/admin/messages",
    },
    {
      id: "settings",
      label: t("settings"),
      icon: Mail,
      route: "/admin/settings",
    },
  ];

  const isActive = (route: string) => {
    const pathWithLocale = `/${locale}${route}`;
    return pathname === pathWithLocale || pathname === route || pathname?.endsWith(route);
  };

  const handleLogout = async () => {
    try {
      // Clear session
      await authClient.signOut();
      // Clear any cached session data
      await authClient.getSession();
      // Force a hard reload to clear all state and cookies
      window.location.href = `/${locale}`;
    } catch (error) {
      console.error("Logout error:", error);
      // Even on error, force redirect to clear state
      window.location.href = `/${locale}`;
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">{t("panelTitle")}</h2>
                <p className="text-xs text-muted-foreground">{t("panelSubtitle")}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.route);
              return (
                <Link
                  key={item.id}
                  href={`/${locale}${item.route}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border space-y-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              onClick={() => {
                const newLocale = locale === "en" ? "fr" : "en";
                const currentPath = pathname || "";
                const pathWithoutLocale = currentPath.replace(/^\/(en|fr)/, "") || "/";
                // Navigate to same path with new locale so language persists
                window.location.href = `/${newLocale}${pathWithoutLocale}`;
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Languages className="w-5 h-5" />
              <span className="font-medium">{locale === "en" ? "Français" : "English"}</span>
            </Button>
            <Link
              href={locale ? `/${locale}` : "/"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">View Portfolio</span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
