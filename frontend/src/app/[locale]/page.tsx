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
  Sparkles,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";
import TypingEffect from "@/components/TypingEffect";
import ScrollAnimation from "@/components/ScrollAnimation";
import GeometricBackground from "@/components/GeometricBackground";
import Image from "next/image";
import {
  SiTypescript,
  SiJavascript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiSpringboot,
  SiPostgresql,
  SiDocker,
  SiGit,
} from "react-icons/si";
import { FaJava, FaNode } from "react-icons/fa6";
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

// Map skill names to icons
const skillIconMap: Record<string, React.ReactNode> = {
  Java: <FaJava className="w-12 h-12" />,
  "C#": (
    <div className="w-12 h-12 flex items-center justify-center font-bold text-purple-500 text-lg">
      #
    </div>
  ),
  Kotlin: (
    <div className="w-12 h-12 flex items-center justify-center font-bold text-purple-600">
      K
    </div>
  ),
  JavaScript: <SiJavascript className="w-12 h-12" />,
  SQL: (
    <div className="w-12 h-12 flex items-center justify-center text-xl font-bold">
      SQL
    </div>
  ),
  "Spring Boot": <SiSpringboot className="w-12 h-12" />,
  "ASP.NET MVC": (
    <div className="w-12 h-12 flex items-center justify-center text-sm font-bold">
      ASP
    </div>
  ),
  "Next.js": <SiNextdotjs className="w-12 h-12" />,
  "SQL Server": (
    <div className="w-12 h-12 flex items-center justify-center text-xs font-bold">
      MSSQL
    </div>
  ),
  "Azure SQL": (
    <div className="w-12 h-12 flex items-center justify-center text-xs font-bold">
      Azure
    </div>
  ),
  Docker: <SiDocker className="w-12 h-12" />,
  "Git & GitHub": <SiGit className="w-12 h-12" />,
  "IntelliJ IDEA": (
    <div className="w-12 h-12 flex items-center justify-center font-bold text-orange-600">
      I
    </div>
  ),
  "VS Code": (
    <div className="w-12 h-12 flex items-center justify-center text-blue-500 font-bold">
      &lt;&gt;
    </div>
  ),
  Linux: (
    <div className="w-12 h-12 flex items-center justify-center font-bold">
      LNX
    </div>
  ),
  React: <SiReact className="w-12 h-12" />,
  TypeScript: <SiTypescript className="w-12 h-12" />,
  "Node.js": <FaNode className="w-12 h-12" />,
  "Express.js": (
    <div className="w-12 h-12 flex items-center justify-center text-sm font-bold">
      EXP
    </div>
  ),
  PostgreSQL: <SiPostgresql className="w-12 h-12" />,
  "Tailwind CSS": <SiTailwindcss className="w-12 h-12" />,
};

export default function HomePage() {
  const t = useTranslations("home");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch skills from Next.js API route
    fetch("/api/skills")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch skills");
        return res.json();
      })
      .then((data) => {
        console.log("Skills data received:", data);
        setSkills(data);
      })
      .catch((err) => console.error("Failed to fetch skills:", err));

    // Fetch projects from Next.js API route
    fetch("/api/projects")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json();
      })
      .then((data) => {
        console.log("Projects data received:", data);
        setProjects(data);
      })
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en", { year: "numeric", month: "short" });
  };

  const aboutContent = {
    title: "About Me",
    description:
      "Hi, I'm Tamim Afghanyar, a full-stack developer and Computer Science student who loves building useful, polished experiences.",
    highlights: [
      "Full-Stack with Next.js, React, TypeScript, Tailwind",
      "Focus on clean, maintainable code and good DX",
      "Comfortable across frontend, backend, and databases",
      "Always learning and experimenting with new tech",
    ],
  };

  const experiences = [
    {
      id: 1,
      company: "Immo 1ère",
      position: "Server",
      location: "Montreal, QC",
      startDate: "2024-07",
      endDate: "",
      current: true,
      summary:
        "Customer-first mindset in a fast-paced environment; handled multi-table sections and resolved issues quickly.",
    },
    {
      id: 2,
      company: "Champlain College",
      position: "Peer Tutor",
      location: "Saint-Lambert, QC",
      startDate: "2025-09",
      endDate: "2025-10",
      current: false,
      summary:
        "Helped students with Java, C#, and web dev; debugging guidance and algorithm intuition building.",
    },
  ];

  const education = [
    {
      id: 1,
      institution: "Champlain College",
      degree: "DEC in Computer Science",
      location: "Saint-Lambert, QC",
      startDate: "2023-08",
      endDate: "2026-05",
      current: true,
      coursework: [
        "OOP (Java, C#)",
        "Web Dev (React, JS, CSS)",
        "Databases (SQL Server, Azure SQL)",
        "Data Structures & Algorithms",
      ],
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Project Manager, Tech Solutions",
      quote:
        "Tamim's attention to detail and delivery speed helped us ship ahead of schedule.",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Senior Developer, Digital Innovations",
      quote:
        "Consistently delivers clean code and is quick to unblock teammates.",
    },
  ];

  useEffect(() => {
    // Fetch skills - use all skills for the grid
    fetch("http://localhost:8080/api/skills")
      .then((res) => res.json())
      .then((data) => {
        setSkills(data); // Show all skills
      })
      .catch((err) => console.error("Failed to fetch skills:", err));

    // Fetch projects - show all projects
    fetch("http://localhost:8080/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data); // Show all projects
      })
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  // Handle hash navigation on page load
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const sectionId = hash.substring(1); // Remove the # symbol
        const element = document.getElementById(sectionId);
        if (element) {
          // Small delay to ensure page is fully rendered
          setTimeout(() => {
            const navbarHeight = 64; // h-16 = 64px
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    };

    // Handle initial hash
    handleHashScroll();

    // Handle hash changes (e.g., browser back/forward)
    window.addEventListener("hashchange", handleHashScroll);

    return () => {
      window.removeEventListener("hashchange", handleHashScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Interactive Geometric Background */}
      <GeometricBackground />

      {/* Hero Section */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollAnimation animation="fade-in" delay={0}>
              <h1 className="text-6xl md:text-8xl font-bold mb-6 text-foreground">
                <TypingEffect text="TAMIM AFGHANYAR" speed={80} />
              </h1>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={0.1}>
              <p className="text-2xl md:text-3xl font-semibold text-foreground/80 mb-6">
                Full-Stack Developer
              </p>
            </ScrollAnimation>
            <ScrollAnimation animation="slide-up" delay={0.2}>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("hero.description")}
              </p>
            </ScrollAnimation>

            {/* Social Links */}
            <ScrollAnimation animation="slide-up" delay={0.3}>
              <div className="flex gap-4 mb-12 justify-center">
                <Link
                  href="https://github.com/tamimafg6"
                  target="_blank"
                  className="p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-all"
                  aria-label="GitHub"
                >
                  <Github className="w-6 h-6 text-foreground" />
                </Link>
                <Link
                  href="https://www.linkedin.com/in/tamim-afghanyar-2026852b3"
                  target="_blank"
                  className="p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-6 h-6 text-foreground" />
                </Link>
              </div>
            </ScrollAnimation>

            {/* CTA Buttons */}
            <ScrollAnimation animation="slide-up" delay={0.4}>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/en/projects"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-all font-semibold"
                >
                  {t("hero.viewWork")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/en/contact"
                  className="inline-flex items-center gap-2 border border-border text-foreground px-8 py-3 rounded-lg hover:bg-accent transition-all font-semibold"
                >
                  {t("hero.getInTouch")}
                </Link>
              </div>
            </ScrollAnimation>

            {/* Scroll Down Indicator */}
            <div className="mt-16 animate-bounce">
              <ChevronDown className="w-8 h-8 mx-auto text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative py-20 bg-background/80 backdrop-blur-sm"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <ScrollAnimation animation="slide-in-from-left" delay={0.05}>
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Sparkles className="w-4 h-4" /> About
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  {aboutContent.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {aboutContent.description}
                </p>
                <div className="space-y-3">
                  {aboutContent.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-blue-500/40 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-1" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-in-from-right" delay={0.1}>
              <div className="p-8 md:p-10 bg-card border border-border rounded-2xl shadow-xl shadow-blue-500/5 hover:border-blue-500/50 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      Quick Snapshot
                    </h3>
                    <div className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      Full-Stack
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                      <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold mb-1">
                        Focus
                      </p>
                      <p className="text-foreground">Next.js, React, TS</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <p className="text-xs uppercase tracking-wide text-purple-500 font-semibold mb-1">
                        Backend
                      </p>
                      <p className="text-foreground">Node, SQL</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-xs uppercase tracking-wide text-emerald-500 font-semibold mb-1">
                        Passion
                      </p>
                      <p className="text-foreground">DX & clean code</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <p className="text-xs uppercase tracking-wide text-amber-500 font-semibold mb-1">
                        Soft Skills
                      </p>
                      <p className="text-foreground">
                        Collaboration, mentoring
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/en/about"
                      className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-semibold"
                    >
                      View full about <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section
        id="experience"
        className="relative py-20 bg-muted/30"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <ScrollAnimation animation="fade-in" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  Experience
                </h2>
                <p className="text-lg text-muted-foreground">
                  A quick view of recent roles.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid gap-6 md:gap-8">
              {experiences.map((exp, idx) => (
                <ScrollAnimation
                  key={exp.id}
                  animation="slide-up"
                  delay={idx * 0.15}
                >
                  <div className="p-6 md:p-7 bg-card border border-border rounded-2xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm text-blue-500 font-semibold">
                          {exp.company}
                        </p>
                        <h3 className="text-2xl font-bold text-foreground">
                          {exp.position}
                        </h3>
                      </div>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {exp.current ? "Current" : "Past"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(exp.startDate)} -{" "}
                          {exp.current ? "Present" : formatDate(exp.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{exp.location}</span>
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {exp.summary}
                    </p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/en/experience"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                View full experience <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section
        id="skills"
        className="relative py-20 bg-background"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="fade-in" delay={0}>
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                  Skills
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Key skills that define my professional identity.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
              {skills.map((skill, idx) => (
                <ScrollAnimation
                  key={skill.id}
                  animation="slide-up"
                  delay={idx * 0.03}
                >
                  <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-card border border-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
                    <div className="text-4xl mb-3 text-foreground group-hover:scale-110 transition-transform duration-300">
                      {skillIconMap[skill.nameEn] || (
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded font-bold text-white text-sm">
                          {skill.nameEn.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-center text-sm text-foreground">
                      {skill.nameEn}
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
                </ScrollAnimation>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/en/skills"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                View All Skills <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="relative py-20 bg-muted/30"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="fade-in" delay={0}>
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                  Projects
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Showcasing impactful projects and technical achievements.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {projects.map((project, idx) => (
                <ScrollAnimation
                  key={project.id}
                  animation={
                    idx % 2 === 0 ? "slide-in-from-left" : "slide-in-from-right"
                  }
                  delay={idx * 0.15}
                >
                  <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 h-full flex flex-col">
                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                          <Sparkles className="w-3 h-3" />
                          Featured
                        </div>
                      </div>
                    )}

                    {/* Project Image */}
                    {project.image && (
                      <div className="relative h-56 bg-muted overflow-hidden">
                        <Image
                          src={project.image}
                          alt={project.titleEn}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-80" />
                      </div>
                    )}

                    {/* Project Content */}
                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 text-foreground group-hover:text-blue-500 transition-colors">
                        {project.titleEn}
                      </h3>

                      <p className="text-foreground mb-6 line-clamp-3 leading-relaxed flex-1">
                        {project.descriptionEn}
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
                            Live Demo
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
                            Source Code
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/en/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                View All Projects <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section
        id="education"
        className="relative py-20 bg-background"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <ScrollAnimation animation="fade-in" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  Education
                </h2>
                <p className="text-lg text-muted-foreground">
                  Formal training and relevant coursework.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid gap-8">
              {education.map((edu, idx) => (
                <ScrollAnimation
                  key={edu.id}
                  animation="slide-up"
                  delay={idx * 0.15}
                >
                  <div className="p-8 bg-card border border-border rounded-2xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm text-blue-500 font-semibold">
                          {edu.institution}
                        </p>
                        <h3 className="text-2xl font-bold text-foreground">
                          {edu.degree}
                        </h3>
                      </div>
                      {edu.current && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(edu.startDate)} -{" "}
                          {edu.current ? "Present" : formatDate(edu.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{edu.location}</span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-foreground">
                      {edu.coursework.map((course, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>{course}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/en/education"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                View full education <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="relative py-20 bg-muted/30"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="fade-in" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  Testimonials
                </h2>
                <p className="text-lg text-muted-foreground">
                  Kind words from collaborators.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testi, idx) => (
                <ScrollAnimation
                  key={testi.id}
                  animation={
                    idx % 2 === 0 ? "slide-in-from-left" : "slide-in-from-right"
                  }
                  delay={idx * 0.15}
                >
                  <div className="p-8 bg-card border border-border rounded-2xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
                    <p className="text-lg text-foreground italic mb-6">
                      “{testi.quote}”
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-semibold">
                          {testi.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testi.role}
                        </p>
                      </div>
                      <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center">
                        {testi.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/en/testimonials"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                View all testimonials <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="relative py-20 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-card border border-border rounded-2xl p-10 md:p-12 shadow-xl shadow-blue-500/10">
            <ScrollAnimation animation="slide-up" delay={0}>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Let's build something great
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Ready to collaborate? Reach out and let's chat about your
                project or idea.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/en/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-transform hover:scale-[1.02]"
                >
                  Contact Me <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="mailto:tamim.afghanyar@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
                >
                  Email directly
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
    </div>
  );
}
