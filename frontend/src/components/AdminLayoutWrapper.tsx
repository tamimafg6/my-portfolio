"use client";

import { usePathname } from "@/i18n/routing";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.includes("/admin");
  const isLoginPage = pathname?.includes("/admin/login");

  // Hide navbar and footer on admin pages (except login)
  if (isAdminPage && !isLoginPage) {
    return <>{children}</>;
  }

  // Show navbar and footer on all other pages
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
