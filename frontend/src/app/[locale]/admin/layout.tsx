"use client";

import { usePathname } from "@/i18n/routing";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname?.includes("/admin/login");

  // For login page, don't show sidebar or modify layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For all other admin pages, show sidebar layout
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64">
        {children}
      </div>
    </div>
  );
}
