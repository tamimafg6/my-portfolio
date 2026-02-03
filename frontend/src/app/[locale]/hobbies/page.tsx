"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import ScrollAnimation from "@/components/ScrollAnimation";
import { ArrowRight, Heart } from "lucide-react";

interface Hobby {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
}

export default function HobbiesPage() {
  const t = useTranslations("hobbies");
  const locale = useLocale();
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const res = await fetch("/api/hobbies", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setHobbies(Array.isArray(data) ? data : []);
        } else {
          setHobbies([]);
        }
      } catch {
        setHobbies([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHobbies();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="hobbies-grid"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#hobbies-grid)"
            className="text-foreground"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollAnimation animation="fade-in" delay={0}>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              {t("title")}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>
        </ScrollAnimation>

        {isLoading ? (
          <div className="max-w-6xl mx-auto text-center py-16">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : hobbies.length === 0 ? (
          <div className="max-w-6xl mx-auto text-center py-16">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No hobbies listed yet.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
            >
              {t("viewHome")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {hobbies.map((h, idx) => (
                <ScrollAnimation
                  key={h.id}
                  animation={
                    idx % 2 === 0 ? "slide-in-from-left" : "slide-in-from-right"
                  }
                  delay={idx * 0.1}
                >
                  <div className="p-6 md:p-8 bg-card border border-border rounded-2xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                      {locale === "fr" ? h.titleAr : h.titleEn}
                    </h2>
                    {(locale === "fr" ? h.descriptionAr : h.descriptionEn) && (
                      <p className="text-muted-foreground leading-relaxed">
                        {locale === "fr" ? h.descriptionAr : h.descriptionEn}
                      </p>
                    )}
                  </div>
                </ScrollAnimation>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                {t("viewHome")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
