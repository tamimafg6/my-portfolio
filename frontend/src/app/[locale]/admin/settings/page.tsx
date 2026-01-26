"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { authorized, loading } = useAdminAccess();

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Configure your portfolio settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Settings</CardTitle>
            <CardDescription>Manage your portfolio configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Settings panel coming soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
