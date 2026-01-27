import { getTranslations } from "next-intl/server";
import { ExternalLink, Github, Sparkles } from "lucide-react";
import Image from "next/image";
import ScrollAnimation from "@/components/ScrollAnimation";

// Use internal Docker network URL for server-side, public URL for client-side
const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

interface Project {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string | null;
  url: string | null;
  githubUrl: string | null;
  technologies: string;
  featured: boolean;
  order: number;
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("projects");

  // Fetch projects from backend API
  const res = await fetch(`${API_URL}/projects`, { cache: "no-store" });
  const allProjects: Project[] = await res.json();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      {/* Background geometric pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="projects-grid"
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
            fill="url(#projects-grid)"
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

        {/* Projects Grid */}
        {allProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{t("noProjects")}</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {allProjects.map((project, idx) => (
              <ScrollAnimation
                key={project.id}
                animation={
                  idx % 2 === 0 ? "slide-in-from-left" : "slide-in-from-right"
                }
                delay={idx * 0.1}
              >
                <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 h-full flex flex-col">
                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        {t("featured")}
                      </div>
                    </div>
                  )}

                  {/* Project Image */}
                  {project.image && (
                    <div className="relative h-56 bg-muted overflow-hidden">
                      <Image
                        src={project.image}
                        alt={
                          locale === "fr"
                            ? project.titleAr || project.titleEn
                            : project.titleEn
                        }
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-80" />
                    </div>
                  )}

                  {/* Project Content */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-foreground group-hover:text-blue-500 transition-colors">
                      {locale === "fr"
                        ? project.titleAr || project.titleEn
                        : project.titleEn}
                    </h3>

                    {/* Description */}
                    <p className="text-foreground mb-6 line-clamp-3 leading-relaxed flex-1">
                      {locale === "fr"
                        ? project.descriptionAr || project.descriptionEn
                        : project.descriptionEn}
                    </p>

                    {/* Technologies */}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies
                          .split(",")
                          .map((tech: string, techIdx: number) => (
                            <span
                              key={techIdx}
                              className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-4 pt-4 border-t border-border">
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {t("liveDemo")}
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground text-sm font-medium rounded-lg hover:border-blue-500/50 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          {t("sourceCode")}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
