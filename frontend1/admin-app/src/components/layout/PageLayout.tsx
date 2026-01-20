"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const router = useRouter();
  const { authorized, loading } = useAdminAccess();
  const { t } = useLanguage();
  
  // All hooks must be called before any conditional returns
  const [sidebarWidth, setSidebarWidth] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved === "true" ? "lg:pl-16" : "lg:pl-64";
    }
    return "lg:pl-64";
  });

  React.useEffect(() => {
    const updateSidebarWidth = (event?: CustomEvent) => {
      if (event?.detail) {
        setSidebarWidth(event.detail.collapsed ? "lg:pl-16" : "lg:pl-64");
      } else {
        const saved = localStorage.getItem("sidebarCollapsed");
        setSidebarWidth(saved === "true" ? "lg:pl-16" : "lg:pl-64");
      }
    };

    // Listen for custom sidebar toggle event
    window.addEventListener("sidebarToggle", updateSidebarWidth as EventListener);
    
    // Initial check
    updateSidebarWidth();

    return () => {
      window.removeEventListener("sidebarToggle", updateSidebarWidth as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive/20">
          <CardContent className="p-8 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <ShieldX className="h-12 w-12 text-destructive" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {t("Access Denied", "Accès refusé")}
              </h1>
              <p className="text-lg font-semibold text-destructive">
                {t("Not Authorized", "Non autorisé")}
              </p>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <p className="text-muted-foreground">
                {t(
                  "You do not have the required ADMIN role to access this page.",
                  "Vous n'avez pas le rôle ADMIN requis pour accéder à cette page."
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Please contact your administrator if you believe this is an error.",
                  "Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur."
                )}
              </p>
            </div>

            {/* Button */}
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
              variant="default"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("Go back to login", "Retour à la connexion")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={sidebarWidth}>
        <Topbar />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

