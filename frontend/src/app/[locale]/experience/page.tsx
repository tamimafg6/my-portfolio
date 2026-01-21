import { getTranslations } from "next-intl/server";
import { Briefcase, Calendar, MapPin, ArrowRight } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

interface Experience {
  id: number;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

// Experience data
const experiences: Experience[] = [
  {
    id: 1,
    company: "Immo 1ère",
    position: "Server",
    location: "Montreal, QC",
    startDate: "2024-07",
    endDate: "",
    current: true,
    responsibilities: [
      "Provided exceptional customer service in a fast-paced restaurant environment",
      "Managed multiple tables efficiently while maintaining attention to detail",
      "Collaborated with kitchen staff to ensure timely and accurate order delivery",
      "Handled customer inquiries and resolved issues professionally",
    ],
  },
  {
    id: 2,
    company: "Champlain College",
    position: "Peer Tutor",
    location: "Saint-Lambert, QC",
    startDate: "2025-09",
    endDate: "2025-10",
    current: false,
    responsibilities: [
      "Tutored students in programming fundamentals and computer science concepts",
      "Assisted with Java, C#, and web development coursework",
      "Helped students debug code and understand complex algorithms",
      "Mentored peers in developing problem-solving skills",
    ],
  },
];

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("experience");

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
            {experiences.map((exp, index) => (
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
                        index % 2 === 0
                          ? "lg:text-left"
                          : "lg:text-right"
                      }`}
                    >
                      {/* Current badge */}
                      {exp.current && (
                        <div className="inline-block mb-4">
                          <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                            Current
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
                            {exp.current ? "Present" : formatDate(exp.endDate)}
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
                          Key Responsibilities
                        </h4>

                        {/* Responsibilities list */}
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
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
