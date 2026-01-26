"use client";

import { usePathname } from "@/i18n/routing";
import { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function AdminLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.includes("/admin");
  const isLoginPage = pathname?.includes("/admin/login");

  // Hide navbar and footer for admin pages (except login)
  if (isAdminPage && !isLoginPage) {
    return <>{children}</>;
  }

  // For non-admin pages or login page, show normal layout with navbar and footer
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
