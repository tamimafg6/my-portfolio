import { getTranslations } from "next-intl/server";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";

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

        {/* Projects Grid */}
        {allProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400">
              {t("noProjects")}
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {allProjects.map((project, idx) => (
              <div
                key={project.id}
                className="group relative bg-white dark:bg-dark-card rounded-xl overflow-hidden 
                          border-2 border-gray-200 dark:border-gray-700
                          hover:scale-[1.02] hover:shadow-2xl
                          transition-all duration-300 fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Project Image */}
                {project.image && (
                  <div className="relative h-56 bg-gray-200 dark:bg-gray-800 overflow-hidden">
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
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent
                                  dark:bg-gradient-to-t dark:from-dark-card/90 dark:to-transparent"
                    />
                  </div>
                )}

                {/* Project Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3
                    className="text-2xl font-bold mb-3 text-gray-900 dark:text-white
                                group-hover:text-blue-500 transition-colors"
                  >
                    {locale === "fr"
                      ? project.titleAr || project.titleEn
                      : project.titleEn}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed">
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
                            className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 
                                   text-blue-600 dark:text-blue-400
                                   text-xs font-medium rounded-full
                                   border border-blue-200 dark:border-blue-500/20"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium
                                 text-blue-600 dark:text-blue-400 
                                 hover:text-blue-700 dark:hover:text-blue-300
                                 transition-colors"
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
                        className="flex items-center gap-2 text-sm font-medium
                                 text-gray-700 dark:text-gray-300
                                 hover:text-gray-900 dark:hover:text-white
                                 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        {t("sourceCode")}
                      </a>
                    )}
                  </div>
                </div>

                {/* Hover Gradient Border Effect */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 
                              transition-opacity duration-300 pointer-events-none
                              bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
