"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";

interface ContactLinks {
  github: string | null;
  linkedIn: string | null;
  twitter: string | null;
  email: string | null;
}

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const currentYear = new Date().getFullYear();
  const [links, setLinks] = useState<ContactLinks>({
    github: null,
    linkedIn: null,
    twitter: null,
    email: null,
  });

  useEffect(() => {
    fetch(`/api/contact/info?_=${Date.now()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLinks({
            github: data.github ?? null,
            linkedIn: data.linkedIn ?? data.linkedin ?? null,
            twitter: data.twitter ?? null,
            email: data.email ?? null,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-auto bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-800">
      {/* Subtle grid pattern overlay */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative container mx-auto px-4 py-12 md:py-14">
          {/* Top section - three columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {/* Portfolio */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">{t("portfolio")}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-xs">
                {t("description")}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">{t("quickLinks")}</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/about"
                  className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {tNav("about")}
                </Link>
                <Link
                  href="/projects"
                  className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {tNav("projects")}
                </Link>
                <Link
                  href="/contact"
                  className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {tNav("contact")}
                </Link>
              </div>
            </div>

            {/* Connect - use URLs saved in Settings */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">{t("connect")}</h3>
              <div className="flex gap-4">
                {links.github && (
                  <a
                    href={links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                )}
                {links.linkedIn && (
                  <a
                    href={links.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                )}
                {links.twitter && (
                  <a
                    href={links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                )}
                {links.email && (
                  <a
                    href={`mailto:${links.email}`}
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bottom section - logo + copyright */}
          <div className="mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-300 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-black flex items-center justify-center shrink-0 border border-gray-300 dark:border-gray-800">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("copyright", { year: currentYear })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
