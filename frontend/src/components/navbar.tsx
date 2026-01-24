"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "./ui/button";
import { Menu, X, LogIn } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("home"), sectionId: null },
    { href: "/about", label: t("about"), sectionId: "about" },
    { href: "/skills", label: t("skills"), sectionId: "skills" },
    { href: "/projects", label: t("projects"), sectionId: "projects" },
    { href: "/experience", label: t("experience"), sectionId: "experience" },
    { href: "/education", label: t("education"), sectionId: "education" },
    { href: "/testimonials", label: t("testimonials"), sectionId: "testimonials" },
    { href: "/contact", label: t("contact"), sectionId: "contact" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 64; // h-16 = 64px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string | null) => {
    e.preventDefault();
    
    // Close mobile menu if open
    setIsOpen(false);

    // If it's the home link, just navigate to home
    if (!sectionId) {
      router.push("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Check if we're on the home page
    const isHomePage = pathname === `/${locale}` || pathname === "/";
    
    if (isHomePage) {
      // If on home page, scroll to section
      scrollToSection(sectionId);
    } else {
      // If not on home page, navigate to home with hash, then scroll
      router.push(`/#${sectionId}`);
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 300);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.webp"
              alt="TA Logo"
              width={45}
              height={45}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.sectionId ? `#${link.sectionId}` : "/"}
                onClick={(e) => handleNavClick(e, link.sectionId)}
                className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                {t("login")}
              </Button>
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.sectionId ? `#${link.sectionId}` : "/"}
                onClick={(e) => handleNavClick(e, link.sectionId)}
                className="block py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <Link href="/admin/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                <LogIn className="h-4 w-4" />
                {t("login")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
