"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "fr" : "en";
    // pathname from next-intl is already without locale prefix
    const currentPath = pathname || "/";
    // Construct new path with new locale
    const newPath = `/${newLocale}${currentPath === "/" ? "" : currentPath}`;
    // Use window.location for reliable locale switching
    window.location.href = newPath;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      {locale === "en" ? "FR" : "EN"}
    </Button>
  );
}
