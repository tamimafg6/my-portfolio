import { getTranslations } from "next-intl/server";
import {
  GraduationCap,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

function getApiUrl(): string {
  const url =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api";
  return url.replace(/\/$/, "");
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  coursework: string[];
  achievements: string[];
}

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("education");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-").map((s) => (s || "").replace(/T.*/, ""));
    if (!year) return "";
    const date = new Date(parseInt(year, 10), parseInt(month || "1", 10) - 1);
    return date.toLocaleDateString(locale, { year: "numeric", month: "short" });
  };

  // Fetch education from API (no cache so admin changes show immediately)
  let education: Education[] = [];
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/education`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      education = list.map(
        (edu: {
          id: number;
          institutionEn: string;
          institutionAr?: string;
          degreeEn: string;
          degreeAr?: string;
          fieldEn: string | null;
          fieldAr?: string | null;
          location: string | null;
          startDate: string;
          endDate: string | null;
          descriptionEn: string | null;
          descriptionAr: string | null;
          gpa: string | null;
        }) => {
          const institution = locale === "fr" ? edu.institutionAr || edu.institutionEn : edu.institutionEn;
          const degree = locale === "fr" ? edu.degreeAr || edu.degreeEn : edu.degreeEn;
          const field = locale === "fr" ? edu.fieldAr || edu.fieldEn || "" : edu.fieldEn || edu.fieldAr || "";
          const desc = locale === "fr" ? edu.descriptionAr || edu.descriptionEn || "" : edu.descriptionEn || edu.descriptionAr || "";
          const coursework = desc ? desc.split(/\n+/).map((s) => s.trim()).filter(Boolean) : [];
          return {
            id: edu.id,
            institution,
            degree,
            field: field.trim(),
            location: edu.location || "",
            startDate: edu.startDate ? String(edu.startDate).slice(0, 7) : "",
            endDate: edu.endDate ? String(edu.endDate).slice(0, 7) : "",
            current: !edu.endDate,
            gpa: edu.gpa ?? undefined,
            coursework: coursework.length > 0 ? coursework : (desc ? [desc] : []),
            achievements: [], // not in DB schema; leave empty
          };
        }
      );
    }
  } catch (_) {}

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      {/* Background geometric pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="education-grid"
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
            fill="url(#education-grid)"
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

        {/* Education items */}
        <div className="max-w-4xl mx-auto space-y-8">
          {education.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{t("empty")}</p>
            </div>
          ) : (
          education.map((edu, index) => (
            <ScrollAnimation
              key={edu.id}
              animation="fade-in"
              delay={index * 0.15}
            >
              <div className="group">
                <div className="p-8 md:p-10 bg-card border border-border rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-10 h-10 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      {edu.current && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3">
                          {t("current")}
                        </span>
                      )}
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {edu.institution}
                      </h2>
                      <p className="text-xl text-blue-500 font-semibold mb-4">
                        {edu.degree}
                        {edu.field ? ` ${t("degreeFieldPreposition")} ${edu.field}` : ""}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm md:text-base">
                            {formatDate(edu.startDate)} -{" "}
                            {edu.current ? t("present") : formatDate(edu.endDate)}
                          </span>
                        </div>
                        <span className="hidden sm:inline text-muted-foreground">
                          •
                        </span>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm md:text-base">
                            {edu.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  {edu.achievements.length > 0 && (
                    <div className="mb-8 p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl border border-blue-500/10">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-semibold text-foreground">
                          {t("achievements")}
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {edu.achievements.map((achievement, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 group/item"
                          >
                            <ArrowRight className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5 group-hover/item:translate-x-1 transition-transform" />
                            <span className="text-foreground">
                              {achievement}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Relevant Coursework */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t("relevantCoursework")}
                      </h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {edu.coursework.map((course, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 group/item"
                        >
                          <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 group-hover/item:translate-x-1 transition-transform" />
                          <span className="text-foreground">{course}</span>
                        </div>
                      ))}
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
  );
}
