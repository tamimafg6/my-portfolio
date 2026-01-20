"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

/**
 * Language Toggle Component (EN | FR)
 *
 * Displays a segmented control for switching between English and French.
 * Features a smooth transition animation when changing languages.
 * Visible in the navigation header on all pages.
 */
export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  /**
   * Handle language change with smooth visual transition
   * Adds a subtle fade effect to make the switch feel polished
   */
  const handleLanguageChange = (newLang: "en" | "fr") => {
    if (newLang !== language) {
      // Add smooth transition class to body
      document.body.style.transition = "opacity 0.15s ease-in-out";
      document.body.style.opacity = "0.95";

      setTimeout(() => {
        setLanguage(newLang);
        document.body.style.opacity = "1";
        setTimeout(() => {
          document.body.style.transition = "";
        }, 150);
      }, 50);
    }
  };

  return (
    <div className="flex items-center gap-1 border border-border rounded-lg p-1">
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleLanguageChange("en")}
        className="h-7 px-3 text-xs font-semibold transition-all"
        aria-label="Switch to English"
      >
        EN
      </Button>
      <Button
        variant={language === "fr" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleLanguageChange("fr")}
        className="h-7 px-3 text-xs font-semibold transition-all"
        aria-label="Passer au français"
      >
        FR
      </Button>
    </div>
  );
};

