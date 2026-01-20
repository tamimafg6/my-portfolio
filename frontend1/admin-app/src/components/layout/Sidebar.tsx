"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Tag,
  Users,
  FolderOpen,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { getImageUrl } from "@/lib/image-utils";

interface NavItem {
  titleEn: string;
  titleFr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  {
    titleEn: "Dashboard",
    titleFr: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    titleEn: "Products",
    titleFr: "Produits",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    titleEn: "Orders",
    titleFr: "Commandes",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    titleEn: "Inventory",
    titleFr: "Inventaire",
    href: "/dashboard/inventory",
    icon: Warehouse,
    comingSoon: true,
  },
  {
    titleEn: "Promotions",
    titleFr: "Promotions",
    href: "/dashboard/promotions",
    icon: Tag,
    comingSoon: true,
  },
  {
    titleEn: "Users",
    titleFr: "Utilisateurs",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    titleEn: "Files",
    titleFr: "Fichiers",
    href: "/dashboard/images",
    icon: FolderOpen,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved === "true";
    }
    return false;
  });
  const { t } = useLanguage();

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(newState));
      // Dispatch custom event to notify PageLayout
      window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: { collapsed: newState } }));
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16 lg:w-16" : "w-64 lg:w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className={cn(
            "flex h-20 items-center border-b transition-all",
            isCollapsed ? "justify-center px-2" : "px-6"
          )}>
            <Link href="/dashboard" className="flex items-center">
              {isCollapsed ? (
                <Image
                  src={getImageUrl("logo.png")}
                  alt="Passion Jerseys"
                  width={40}
                  height={40}
                  unoptimized
                  className="h-10 w-10 rounded"
                />
              ) : (
                <Image
                  src={getImageUrl("logo.png")}
                  alt="Passion Jerseys"
                  width={180}
                  height={54}
                  unoptimized
                  className="h-14 w-auto"
                />
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto scrollbar-hide">
            {/* Dashboard - always first */}
            {navItems
              .filter((item) => item.href === "/dashboard")
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center rounded-lg text-sm font-medium transition-colors",
                      isCollapsed 
                        ? "justify-center w-10 h-10 mx-auto" 
                        : "px-3 py-2 gap-3",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    title={isCollapsed ? t(item.titleEn, item.titleFr) : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{t(item.titleEn, item.titleFr)}</span>}
                  </Link>
                );
              })}

            {/* Section divider */}
            <div className={cn(
              "my-4 border-t",
              isCollapsed ? "mx-auto w-10" : ""
            )} />

            {/* Operations section label */}
            {!isCollapsed && (
              <div className="px-3 py-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {t("Operations", "Opérations")}
                </p>
              </div>
            )}
            {/* Operations items - non-comingSoon */}
            <div className="space-y-1">
              {navItems
                .filter((item) => !item.comingSoon && (item.href.startsWith("/dashboard/products") || item.href.startsWith("/dashboard/orders")))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-colors",
                        isCollapsed 
                          ? "justify-center w-10 h-10 mx-auto" 
                          : "px-3 py-2 gap-3",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      title={isCollapsed ? t(item.titleEn, item.titleFr) : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{t(item.titleEn, item.titleFr)}</span>}
                    </Link>
                  );
                })}
            </div>
            {/* Operations items - comingSoon */}
            <div className="space-y-1">
              {navItems
                .filter((item) => item.comingSoon)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-colors opacity-60",
                        isCollapsed 
                          ? "justify-center w-10 h-10 mx-auto" 
                          : "px-3 py-2 gap-3",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:bg-accent/50"
                      )}
                      title={isCollapsed ? t(item.titleEn, item.titleFr) : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{t(item.titleEn, item.titleFr)}</span>}
                    </Link>
                  );
                })}
            </div>

            <div className={cn(
              "my-4 border-t",
              isCollapsed ? "mx-auto w-10" : ""
            )} />

            {/* Administration section label */}
            {!isCollapsed && (
              <div className="px-3 py-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {t("Administration", "Administration")}
                </p>
              </div>
            )}
            <div className="space-y-1">
              {navItems
                .filter(
                  (item) => !item.comingSoon && item.href !== "/dashboard" && !item.href.startsWith("/dashboard/products") && !item.href.startsWith("/dashboard/orders")
                )
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-colors",
                        isCollapsed 
                          ? "justify-center w-10 h-10 mx-auto" 
                          : "px-3 py-2 gap-3",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      title={isCollapsed ? t(item.titleEn, item.titleFr) : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{t(item.titleEn, item.titleFr)}</span>}
                    </Link>
                  );
                })}
            </div>
          </nav>

          {/* Collapse/Expand Button */}
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="w-full"
              aria-label={isCollapsed ? t("Expand sidebar", "Développer la barre latérale") : t("Collapse sidebar", "Réduire la barre latérale")}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}


