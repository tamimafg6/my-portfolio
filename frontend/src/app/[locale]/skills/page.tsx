import { getTranslations } from "next-intl/server";

// Use internal Docker network URL for server-side, public URL for client-side
const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

interface Skill {
  id: number;
  nameEn: string;
  nameAr: string;
  category: string;
  level: number;
  icon: string;
  order: number;
}

export default async function SkillsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("skills");

  // Fetch skills from backend API
  const res = await fetch(`${API_URL}/skills`, { cache: "no-store" });
  const allSkills: Skill[] = await res.json();

  // Group skills by category
  const groupedSkills = allSkills.reduce(
    (acc, skill) => {
      const category = skill.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>,
  );

  return (
    <div className="min-h-screen py-16 bg-gray-50 dark:bg-[#0a0a0f]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Skills Sections */}
        {Object.keys(groupedSkills).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400">{t("noSkills")}</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12">
            {Object.entries(groupedSkills).map(
              ([category, categorySkills], idx) => (
                <div
                  key={category}
                  className="fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Category Header */}
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {category}
                  </h2>

                  {/* Skills Badges */}
                  <div className="flex flex-wrap gap-3">
                    {categorySkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group relative px-4 py-2.5 rounded-lg
                                bg-gray-100 dark:bg-[#1a1a2e]
                                border border-gray-300 dark:border-gray-700/50
                                hover:scale-105 transition-all duration-300
                                hover:border-gray-400 dark:hover:border-gray-600
                                cursor-default"
                      >
                        <div className="flex items-center gap-2.5">
                          {skill.icon && (
                            <span className="text-base">{skill.icon}</span>
                          )}
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {locale === "fr"
                              ? skill.nameAr || skill.nameEn
                              : skill.nameEn}
                          </span>
                        </div>

                        {/* Level Indicator (appears on hover) */}
                        {skill.level !== undefined && (
                          <div
                            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                      bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                          >
                            Level {skill.level}/5
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
