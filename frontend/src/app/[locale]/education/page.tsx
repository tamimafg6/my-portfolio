import { getTranslations } from "next-intl/server";
import { GraduationCap, Calendar, MapPin, Award, BookOpen, ArrowRight } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

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

// Education data
const education: Education[] = [
  {
    id: 1,
    institution: "Champlain College",
    degree: "DEC (Diploma of College Studies)",
    field: "Computer Science",
    location: "Saint-Lambert, QC",
    startDate: "2023-08",
    endDate: "2026-05",
    current: true,
    coursework: [
      "Object-Oriented Programming (Java, C#)",
      "Web Development (HTML, CSS, JavaScript, React)",
      "Database Management (SQL Server, Azure SQL)",
      "Data Structures and Algorithms",
      "Software Engineering Principles",
      "Mobile Development (Kotlin)",
    ],
    achievements: [
      "Dean's List - Multiple Semesters",
      "Peer Tutor for Computer Science",
      "Completed multiple full-stack projects",
    ],
  },
];

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("education");

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(locale, { year: "numeric", month: "short" });
  };

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
          {education.map((edu, index) => (
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
                          Current
                        </span>
                      )}
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {edu.institution}
                      </h2>
                      <p className="text-xl text-blue-500 font-semibold mb-4">
                        {edu.degree} in {edu.field}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm md:text-base">
                            {formatDate(edu.startDate)} -{" "}
                            {edu.current ? "Present" : formatDate(edu.endDate)}
                          </span>
                        </div>
                        <span className="hidden sm:inline text-muted-foreground">•</span>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm md:text-base">{edu.location}</span>
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
                          Achievements
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {edu.achievements.map((achievement, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 group/item"
                          >
                            <ArrowRight className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5 group-hover/item:translate-x-1 transition-transform" />
                            <span className="text-foreground">{achievement}</span>
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
                        Relevant Coursework
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
          ))}
        </div>
      </div>
    </div>
  );
}
