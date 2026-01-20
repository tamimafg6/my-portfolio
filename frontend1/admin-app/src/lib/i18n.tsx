"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";

/**
 * Internationalization (i18n) system for bilingual English/French support.
 *
 * Features:
 * - Automatic browser language detection on first visit
 * - Persistent language preference via localStorage
 * - Dynamic HTML lang attribute for accessibility
 * - Client-side language switching without page reload
 */

export type Language = "en" | "fr";

interface LanguageContextType {
  /** Current active language */
  language: Language;
  /** Switch language and persist preference */
  setLanguage: (lang: Language) => void;
  /** Translate text: returns English or French based on current language */
  t: (en: string, fr: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

/**
 * Language Provider Component
 *
 * Wraps the app to provide bilingual context to all components.
 * Handles language persistence and browser detection.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  /**
   * Change language and persist preference
   * Also updates HTML lang attribute for screen readers and SEO
   */
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);

    // Update <html lang="..."> for accessibility (WCAG) and SEO
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, []);

  // Initialize language on mount: check localStorage first, then browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;

    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fr")) {
      // User has previously selected a language - use it
      setLanguage(savedLanguage);
    } else {
      // First visit: detect browser language preference
      const browserLang = navigator.language.toLowerCase();
      const detectedLanguage: Language = browserLang.startsWith("fr")
        ? "fr"
        : "en";
      setLanguage(detectedLanguage);
    }
  }, [setLanguage]);

  /**
   * Simple translation helper
   * @param en - English text
   * @param fr - French text
   * @returns The text in the current language
   */
  const t = useCallback((en: string, fr: string) => {
    return language === "en" ? en : fr;
  }, [language]);

  // Memoize context value to stabilize t function reference
  const contextValue = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 * @throws Error if used outside LanguageProvider
 * @example
 * const { language, setLanguage, t } = useLanguage();
 * const title = t("Shop Jerseys", "Acheter des maillots");
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

