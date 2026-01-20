"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowRight,
  Code,
  Briefcase,
  Mail,
  Github,
  Linkedin,
  ChevronDown,
} from "lucide-react";
import TypingEffect from "@/components/TypingEffect";
import { useEffect, useState } from "react";

interface Skill {
  id: number;
  nameEn: string;
  nameAr: string;
  category: string;
  level: number;
  icon: string;
  order: number;
}

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

export default function HomePage() {
  const t = useTranslations("home");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch skills
    fetch("http://localhost:8080/api/skills")
      .then((res) => res.json())
      .then((data) => {
        // Get first 6 skills
        setSkills(data.slice(0, 6));
      })
      .catch((err) => console.error("Failed to fetch skills:", err));

    // Fetch projects
    fetch("http://localhost:8080/api/projects")
      .then((res) => res.json())
      .then((data) => {
        // Get first 3 projects
        setProjects(data.slice(0, 3));
      })
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 animate-in fade-in duration-1000">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 dark:text-white text-gray-900">
                <TypingEffect text="TAMIM AFGHANYAR" speed={80} />
              </h1>
              <p className="text-2xl md:text-3xl font-semibold dark:text-gray-300 text-gray-700 mb-6 animate-in fade-in duration-1000 delay-500">
                Full-Stack Software Engineer
              </p>
              <p className="text-lg dark:text-gray-400 text-gray-600 mb-8 max-w-2xl mx-auto animate-in fade-in duration-1000 delay-700">
                {t("hero.description")}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mb-12 animate-in fade-in duration-1000 delay-1000 justify-center">
              <Link
                href="https://github.com/tamimafg6"
                target="_blank"
                className="p-3 border dark:border-gray-700 border-gray-300 rounded-lg dark:hover:border-gray-500 hover:border-gray-400 dark:hover:bg-gray-800/50 hover:bg-gray-100 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6 dark:text-gray-300 text-gray-700" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/tamim-afghanyar-2026852b3"
                target="_blank"
                className="p-3 border dark:border-gray-700 border-gray-300 rounded-lg dark:hover:border-gray-500 hover:border-gray-400 dark:hover:bg-gray-800/50 hover:bg-gray-100 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6 dark:text-gray-300 text-gray-700" />
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 animate-in fade-in duration-1000 delay-1000 justify-center">
              <Link
                href="/en/projects"
                className="inline-flex items-center gap-2 dark:bg-white bg-gray-900 dark:text-black text-white px-8 py-3 rounded-lg dark:hover:bg-gray-200 hover:bg-gray-800 transition-all font-semibold"
              >
                {t("hero.viewWork")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/en/contact"
                className="inline-flex items-center gap-2 border dark:border-gray-600 border-gray-400 dark:text-white text-gray-900 px-8 py-3 rounded-lg dark:hover:bg-gray-800/50 hover:bg-gray-100 transition-all font-semibold"
              >
                {t("hero.getInTouch")}
              </Link>
            </div>

            {/* Scroll Down Indicator */}
            <div className="mt-16 animate-bounce">
              <ChevronDown className="w-8 h-8 mx-auto dark:text-gray-400 text-gray-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-white dark:bg-[#0a0a0f]/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Skills
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                Key skills that define my professional identity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg 
                           bg-white dark:bg-[#1a1a2e] hover:scale-105 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {skill.icon && (
                      <span className="text-2xl">{skill.icon}</span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {skill.nameEn}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-full rounded-full ${
                          i < skill.level
                            ? "bg-blue-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/en/skills"
                className="inline-flex items-center gap-2 border border-gray-400 dark:border-gray-600 
                         text-gray-900 dark:text-white px-6 py-3 rounded-lg 
                         hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
              >
                <ChevronDown className="w-4 h-4" /> View All Skills
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-gray-50 dark:bg-[#0a0a0f]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Projects
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                Showcasing impactful projects and technical achievements.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/en/projects/${project.id}`}
                  className="group bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 
                           rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all"
                >
                  <div className="p-6">
                    <h3
                      className="text-xl font-bold mb-3 text-gray-900 dark:text-white 
                                 group-hover:text-blue-500 transition-colors"
                    >
                      {project.titleEn}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                      {project.descriptionEn}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies
                        .split(",")
                        .slice(0, 3)
                        .map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 
                                   text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/en/projects"
                className="inline-flex items-center gap-2 border border-gray-400 dark:border-gray-600 
                         text-gray-900 dark:text-white px-6 py-3 rounded-lg 
                         hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
              >
                <ChevronDown className="w-4 h-4" /> View All Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
