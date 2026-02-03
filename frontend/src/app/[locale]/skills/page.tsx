import { getTranslations } from "next-intl/server";
import ScrollAnimation from "@/components/ScrollAnimation";
import { getSkillIcon } from "@/lib/skill-icons";

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

  // Group skills by category and sort within each (by order)
  const grouped = allSkills.reduce(
    (acc, skill) => {
      const category = skill.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>,
  );
  // Sort each category by skill order, then display categories in a fixed order so section looks full
  const categoryOrder = [
    "Programming Languages",
    "Frameworks",
    "Databases & Cloud",
    "Tools",
    "Operating Systems",
    "Databases",
    "Cloud",
    "DevOps",
    "Other",
  ];
  const groupedSkills: Record<string, Skill[]> = {};
  for (const cat of categoryOrder) {
    if (grouped[cat]) {
      groupedSkills[cat] = [...grouped[cat]].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  }
  // Append any category not in categoryOrder
  for (const cat of Object.keys(grouped)) {
    if (!groupedSkills[cat]) {
      groupedSkills[cat] = [...grouped[cat]].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  }

  return (
    <div className="min-h-screen py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollAnimation animation="fade-in">
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

        {/* Skills Sections */}
        {Object.keys(groupedSkills).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{t("noSkills")}</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-16">
            {Object.entries(groupedSkills).map(
              ([category, categorySkills], idx) => (
                <ScrollAnimation
                  key={category}
                  animation="fade-in"
                  delay={idx * 0.1}
                >
                  <div>
                    {/* Category Header */}
                    <h2 className="text-2xl font-bold text-foreground mb-8">
                      {category}
                    </h2>

                    {/* Skills Grid with Logos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {categorySkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex flex-col items-center justify-center p-6 rounded-lg bg-card border border-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
                        >
                          <div className="text-4xl mb-3 text-foreground group-hover:scale-110 transition-transform duration-300">
                            {getSkillIcon(skill) ?? (
                              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded font-bold text-white text-sm">
                                {skill.nameEn.charAt(0)}
                              </div>
                            )}
                          </div>
                          <p className="font-semibold text-center text-sm text-foreground">
                            {locale === "fr" ? skill.nameAr : skill.nameEn}
                          </p>
                          <div className="mt-2 flex gap-1">
                            {[...Array(Math.round(skill.level))].map((_, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                              ></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollAnimation>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
