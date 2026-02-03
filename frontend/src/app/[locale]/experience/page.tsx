import { getTranslations } from "next-intl/server";
import { Briefcase, Calendar, MapPin, ArrowRight } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

function getApiUrl(): string {
  const url =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api";
  return url.replace(/\/$/, "");
}

interface ExperienceItem {
  id: number;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  responsibilities: string[];
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("experience");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-").map((s) => s.replace(/T.*/, ""));
    if (!year) return "";
    const date = new Date(parseInt(year, 10), parseInt(month || "1", 10) - 1);
    return date.toLocaleDateString(locale, { year: "numeric", month: "short" });
  };

  // Fetch experience from API (no cache so admin changes show immediately)
  let experiences: ExperienceItem[] = [];
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/experience`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      experiences = list.map((ex: {
        id: number;
        companyEn: string;
        companyAr?: string;
        positionEn: string;
        positionAr?: string;
        descriptionEn: string | null;
        descriptionAr: string | null;
        startDate: string;
        endDate: string | null;
        isCurrent: boolean;
        location: string | null;
      }) => {
        const description = locale === "fr" ? (ex.descriptionAr || ex.descriptionEn || "") : (ex.descriptionEn || ex.descriptionAr || "");
        const responsibilities = description
          ? description.split(/\n+/).map((s) => s.trim()).filter(Boolean)
          : [];
        return {
          id: ex.id,
          company: locale === "fr" ? (ex.companyAr || ex.companyEn) : ex.companyEn,
          position: locale === "fr" ? (ex.positionAr || ex.positionEn) : ex.positionEn,
          location: ex.location || "",
          startDate: ex.startDate ? String(ex.startDate).slice(0, 7) : "",
          endDate: ex.endDate ? String(ex.endDate).slice(0, 7) : "",
          current: ex.isCurrent ?? false,
          description,
          responsibilities: responsibilities.length > 0 ? responsibilities : [description].filter(Boolean),
        };
      });
    }
  } catch (_) {}

  // Fallback to empty so page still renders
  if (experiences.length === 0) {
    experiences = [];
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      {/* Background geometric pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="experience-grid"
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
            fill="url(#experience-grid)"
            className="text-foreground"
          />
        </svg>
      </div>

      <div className="px-6 md:px-12 relative z-10">
        {/* Header */}
        <ScrollAnimation animation="fade-in" delay={0}>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              {t("title")}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </ScrollAnimation>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line - hidden on mobile */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 opacity-30"></div>

            {/* Experience items */}
            {experiences.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("subtitle")}</p>
                <p className="text-sm mt-2">No experience entries yet.</p>
              </div>
            ) : (
            experiences.map((exp, index) => (
              <ScrollAnimation
                key={exp.id}
                animation={
                  index % 2 === 0 ? "slide-in-from-left" : "slide-in-from-right"
                }
                delay={index * 0.15}
              >
                <div className="relative mb-12 lg:mb-16 group">
                  {/* Timeline dot */}
                  <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 -top-2 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-4 border-background items-center justify-center shadow-lg shadow-blue-500/50">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>

                  {/* Mobile dot */}
                  <div className="lg:hidden absolute -left-4 top-4 w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-background"></div>

                  {/* Timeline connector - mobile only */}
                  <div className="lg:hidden absolute -left-[7px] top-6 w-0.5 h-[calc(100%-24px)] bg-gradient-to-b from-blue-500/50 to-purple-500/50"></div>

                  {/* Content - Grid layout */}
                  <div
                    className={`lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Left side content */}
                    <div
                      className={`${
                        index % 2 === 0 ? "lg:text-left" : "lg:text-right"
                      }`}
                    >
                      {/* Current badge */}
                      {exp.current && (
                        <div className="inline-block mb-4">
                          <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                            {t("current")}
                          </span>
                        </div>
                      )}

                      {/* Position title */}
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {exp.position}
                      </h3>

                      {/* Company */}
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4">
                        <Briefcase className="w-5 h-5" />
                        <span className="font-semibold text-lg">
                          {exp.company}
                        </span>
                      </div>

                      {/* Date and location */}
                      <div className="space-y-2 mb-6 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm md:text-base">
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? t("present") : formatDate(exp.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm md:text-base">
                            {exp.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - card */}
                    <div className="lg:col-span-1">
                      <div className="ml-4 lg:ml-0 p-6 md:p-8 bg-card border border-border rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group/card">
                        <h4 className="text-sm font-semibold text-blue-500 dark:text-blue-400 mb-4 uppercase tracking-wider">
                          {t("keyResponsibilities")}
                        </h4>

                        {/* Description / responsibilities */}
                        {exp.responsibilities.length > 0 ? (
                          <ul className="space-y-3">
                            {exp.responsibilities.map((resp, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-3 group/item"
                              >
                                <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 group-hover/item:translate-x-1 transition-transform" />
                                <span className="text-foreground leading-relaxed">
                                  {resp}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : exp.description ? (
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
