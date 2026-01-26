"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
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
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: number;
}

export default function AdminSidebar() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      route: "/admin/dashboard",
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderKanban,
      route: "/admin/projects",
    },
    {
      id: "skills",
      label: "Skills",
      icon: Code,
      route: "/admin/skills",
    },
    {
      id: "experience",
      label: "Experience",
      icon: Briefcase,
      route: "/admin/experience",
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      route: "/admin/education",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      route: "/admin/settings",
    },
  ];

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const isActive = (route: string) => {
    return pathname === route || pathname?.startsWith(route + "/");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-background/95 backdrop-blur"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Portfolio Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.route);
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.route);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      active
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? "text-blue-500" : ""
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                router.push("/");
                setIsMobileOpen(false);
              }}
            >
              <Eye className="w-4 h-4" />
              View Portfolio
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
