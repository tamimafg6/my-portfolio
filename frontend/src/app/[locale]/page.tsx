"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  ArrowRight,
  Code,
  Briefcase,
  Mail,
  Github,
  Linkedin,
  FileDown,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Turnstile from "@/components/Turnstile";
import {
  validateContactForm,
  validateTestimonialForm,
  capLength,
  LIMITS,
} from "@/lib/form-validation";
import { getSkillIcon } from "@/lib/skill-icons";

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

interface Testimonial {
  id: number;
  name: string;
  email: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const t = useTranslations("home");
  const tContact = useTranslations("contact");
  const tTestimonials = useTranslations("testimonials");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [hobbies, setHobbies] = useState<
    {
      id: number;
      titleEn: string;
      titleAr: string;
      descriptionEn: string | null;
      descriptionAr: string | null;
    }[]
  >([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactSubmitStatus, setContactSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [contactFieldErrors, setContactFieldErrors] = useState<
    Record<string, string>
  >({});
  const [contactCaptchaToken, setContactCaptchaToken] = useState<string | null>(null);
  const [testimonialFormData, setTestimonialFormData] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
    content: "",
    rating: 5,
  });
  const [isTestimonialSubmitting, setIsTestimonialSubmitting] = useState(false);
  const [testimonialSubmitMessage, setTestimonialSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [testimonialFieldErrors, setTestimonialFieldErrors] = useState<
    Record<string, string>
  >({});
  const [testimonialCaptchaToken, setTestimonialCaptchaToken] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<
    {
      id: number;
      company: string;
      position: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      summary: string;
    }[]
  >([]);
  const [education, setEducation] = useState<
    {
      id: number;
      institution: string;
      degree: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      coursework: string[];
    }[]
  >([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeLabel, setResumeLabel] = useState<string>("Resume");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);

  const fetchHomeData = () => {
    const opts = { cache: "no-store" as RequestCache };
    // Fetch skills
    fetch("/api/skills", opts)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSkills(Array.isArray(data) ? data : []))
      .catch(() => setSkills([]));
    // Fetch projects
    fetch("/api/projects", opts)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));
    // Fetch testimonials
    fetch("/api/testimonials", opts)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const approved = Array.isArray(data)
          ? data.filter((t: Testimonial) => t.isApproved !== false)
          : [];
        setTestimonials(approved);
      })
      .catch(() => setTestimonials([]));
    // Fetch hobbies
    fetch("/api/hobbies", opts)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setHobbies(Array.isArray(data) ? data : []))
      .catch(() => setHobbies([]));
    // Fetch experience (so home section updates when admin edits)
    fetch("/api/experience", opts)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setExperiences(
          list.map(
            (ex: {
              id: number;
              companyEn: string;
              companyAr?: string;
              positionEn: string;
              positionAr?: string;
              location: string | null;
              startDate: string;
              endDate: string | null;
              isCurrent: boolean;
              descriptionEn: string | null;
              descriptionAr: string | null;
            }) => ({
              id: ex.id,
              company:
                locale === "fr" ? ex.companyAr || ex.companyEn : ex.companyEn,
              position:
                locale === "fr"
                  ? ex.positionAr || ex.positionEn
                  : ex.positionEn,
              location: ex.location || "",
              startDate: ex.startDate ? String(ex.startDate).slice(0, 7) : "",
              endDate: ex.endDate ? String(ex.endDate).slice(0, 7) : "",
              current: ex.isCurrent ?? false,
              summary:
                locale === "fr"
                  ? ex.descriptionAr || ex.descriptionEn || ""
                  : ex.descriptionEn || ex.descriptionAr || "",
            })
          )
        );
      })
      .catch(() => setExperiences([]));
    // Fetch education (so home section updates when admin edits)
    fetch("/api/education", opts)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setEducation(
          list.map(
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
            }) => {
              const institution =
                locale === "fr"
                  ? edu.institutionAr || edu.institutionEn
                  : edu.institutionEn;
              const degree =
                locale === "fr"
                  ? `${edu.degreeAr || edu.degreeEn}${
                      edu.fieldAr ? ` ${edu.fieldAr}` : ""
                    }`
                  : `${edu.degreeEn}${edu.fieldEn ? ` ${edu.fieldEn}` : ""}`;
              const desc =
                locale === "fr"
                  ? edu.descriptionAr || edu.descriptionEn || ""
                  : edu.descriptionEn || edu.descriptionAr || "";
              const coursework = desc
                ? desc
                    .split(/\n+/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];
              return {
                id: edu.id,
                institution,
                degree: degree.trim(),
                location: edu.location || "",
                startDate: edu.startDate
                  ? String(edu.startDate).slice(0, 7)
                  : "",
                endDate: edu.endDate ? String(edu.endDate).slice(0, 7) : "",
                current: !edu.endDate,
                coursework:
                  coursework.length > 0 ? coursework : desc ? [desc] : [],
              };
            }
          )
        );
      })
      .catch(() => setEducation([]));
    // Fetch profile photo
    fetch("/api/contact/info", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profilePhotoUrl) {
          setProfilePhotoUrl(data.profilePhotoUrl);
        }
      })
      .catch(() => {});
    // Fetch resume (show section if any of fileUrl, fileUrlEn, or fileUrlAr exists)
    fetch("/api/resume", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const hasResume = data?.fileUrlEn || data?.fileUrlAr || data?.fileUrl;
        if (hasResume) {
          setResumeUrl(data.fileUrlEn || data.fileUrlAr || data.fileUrl);
          setResumeLabel(
            locale === "fr" ? data.labelAr ?? "CV" : data.labelEn ?? "Resume"
          );
        } else {
          setResumeUrl(null);
        }
      })
      .catch(() => setResumeUrl(null));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFieldErrors({});
    const result = validateContactForm(contactFormData, tContact);
    if (!result.ok) {
      setContactFieldErrors(result.errors);
      setContactSubmitStatus("error");
      return;
    }
    if (!contactCaptchaToken) {
      setContactSubmitStatus("error");
      return;
    }
    setIsContactSubmitting(true);
    setContactSubmitStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, captchaToken: contactCaptchaToken }),
      });
      if (res.ok) {
        setContactSubmitStatus("success");
        setContactFormData({ name: "", email: "", message: "" });
        setContactCaptchaToken(null);
        setTimeout(() => setContactSubmitStatus("idle"), 5000);
      } else {
        setContactSubmitStatus("error");
      }
    } catch (error) {
      setContactSubmitStatus("error");
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialFieldErrors({});
    const result = validateTestimonialForm(testimonialFormData, tTestimonials);
    if (!result.ok) {
      setTestimonialFieldErrors(result.errors);
      setTestimonialSubmitMessage({
        type: "error",
        text: Object.values(result.errors)[0] ?? tTestimonials("submitError"),
      });
      return;
    }
    if (!testimonialCaptchaToken) {
      setTestimonialSubmitMessage({
        type: "error",
        text: tTestimonials("submitError"),
      });
      return;
    }
    setIsTestimonialSubmitting(true);
    setTestimonialSubmitMessage(null);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, captchaToken: testimonialCaptchaToken }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestimonialSubmitMessage({
          type: "success",
          text: tTestimonials("submitSuccess"),
        });
        setTestimonialFormData({
          name: "",
          email: "",
          role: "",
          company: "",
          content: "",
          rating: 5,
        });
        setTestimonialCaptchaToken(null);
        setTimeout(() => setTestimonialSubmitMessage(null), 5000);
      } else {
        const error = await res.json();
        setTestimonialSubmitMessage({
          type: "error",
          text: error.error || tTestimonials("submitError"),
        });
      }
    } catch (error) {
      setTestimonialSubmitMessage({
        type: "error",
        text: tTestimonials("submitError"),
      });
    } finally {
      setIsTestimonialSubmitting(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [locale]);

  // Refetch when user returns to this tab (e.g. after editing in admin) so home sections stay in sync
  useEffect(() => {
    const onFocus = () => fetchHomeData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [locale]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month || "1", 10) - 1);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  };

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
            const offsetPosition =
              elementPosition + window.pageYOffset - navbarHeight;

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
                {t("hero.title")}
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
                {resumeUrl && (
                  <a
                    href={`/api/resume/file?locale=${locale}`}
                    download={locale === "fr" ? "cv.pdf" : "resume.pdf"}
                    className="p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-all"
                    aria-label={locale === "fr" ? "Télécharger CV" : "Download Resume"}
                  >
                    <FileDown className="w-6 h-6 text-foreground" />
                  </a>
                )}
              </div>
            </ScrollAnimation>

            {/* CTA Buttons */}
            <ScrollAnimation animation="slide-up" delay={0.4}>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href={`/${locale}/projects`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-all font-semibold"
                >
                  {t("hero.viewWork")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${locale}/contact`}
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
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  {t("about.title")}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t("about.description")}
                </p>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-blue-500/40 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                      <span className="text-foreground">
                        {t(`about.highlights.${idx}`)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <Link
                    href={`/${locale}/about`}
                    className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-semibold"
                  >
                    {t("about.snapshot.viewFull")}{" "}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-in-from-right" delay={0.1}>
              <div className="flex justify-center md:justify-end">
                {profilePhotoUrl ? (
                  <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden border-4 border-border shadow-xl shrink-0">
                    <Image
                      src="/api/profile/photo"
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 224px, 288px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 md:w-72 md:h-72 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-border flex items-center justify-center shrink-0">
                    <span className="text-6xl md:text-7xl font-bold text-foreground/80">
                      {t("about.title").charAt(0)}
                    </span>
                  </div>
                )}
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
                  {t("experience.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("experience.subtitle")}
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
                        {exp.current
                          ? t("experience.current")
                          : t("experience.past")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(exp.startDate)} -{" "}
                          {exp.current
                            ? t("experience.present")
                            : formatDate(exp.endDate)}
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
                href={`/${locale}/experience`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                {t("experience.viewFull")} <ArrowRight className="w-4 h-4" />
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
                  {t("skillsSection.title")}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t("skillsSection.subtitle")}
                </p>
              </div>
            </ScrollAnimation>

            {/* Horizontal scrolling strip – pauses on hover */}
            <div className="skill-scroll-container overflow-hidden w-full py-8 mb-12">
              <div className="animate-skill-scroll flex gap-6 w-max">
                {[...skills, ...skills].map((skill, idx) => (
                  <div
                    key={`${skill.id}-${idx}`}
                    className="flex flex-col items-center justify-center flex-shrink-0 w-28 py-5 px-4 rounded-xl bg-card border border-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
                  >
                    <div className="mb-2 shrink-0 w-14 h-14 flex items-center justify-center text-foreground group-hover:scale-110 transition-transform duration-300 [&_svg]:w-12 [&_svg]:h-12">
                      {getSkillIcon(skill) ?? (
                        <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg font-bold text-white text-base shadow-lg">
                          {(skill.nameEn || skill.nameAr || "SK")
                            .trim()
                            .slice(0, 2)
                            .toUpperCase() || "SK"}
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-center text-xs text-foreground leading-tight">
                      {locale === "fr" ? skill.nameAr : skill.nameEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href={`/${locale}/skills`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                {t("skillsSection.viewAll")} <ArrowRight className="w-4 h-4" />
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
                  {t("projectsSection.title")}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t("projectsSection.subtitle")}
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
                        {locale === "fr"
                          ? project.titleAr || project.titleEn
                          : project.titleEn}
                      </h3>

                      <p className="text-foreground mb-6 leading-relaxed flex-1">
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
                            {t("projectsSection.liveDemo")}
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
                            {t("projectsSection.sourceCode")}
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
                href={`/${locale}/projects`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                {t("projectsSection.viewAll")}{" "}
                <ArrowRight className="w-4 h-4" />
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
                  {t("educationSection.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("educationSection.subtitle")}
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
                          {t("educationSection.current")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(edu.startDate)} -{" "}
                          {edu.current
                            ? t("educationSection.present")
                            : formatDate(edu.endDate)}
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
                href={`/${locale}/education`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                {t("educationSection.viewFull")}{" "}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hobbies Section */}
      {hobbies.length > 0 && (
        <section id="hobbies" className="relative py-20" style={{ zIndex: 1 }}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <ScrollAnimation animation="fade-in" delay={0}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                    {t("hobbies.title")}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {t("hobbies.description")}
                  </p>
                </div>
              </ScrollAnimation>
              <div className="grid md:grid-cols-2 gap-6">
                {hobbies.map((h, idx) => (
                  <ScrollAnimation
                    key={h.id}
                    animation={
                      idx % 2 === 0
                        ? "slide-in-from-left"
                        : "slide-in-from-right"
                    }
                    delay={idx * 0.1}
                  >
                    <div className="p-6 bg-card border border-border rounded-2xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {locale === "fr" ? h.titleAr : h.titleEn}
                      </h3>
                      {(locale === "fr"
                        ? h.descriptionAr
                        : h.descriptionEn) && (
                        <p className="text-muted-foreground">
                          {locale === "fr" ? h.descriptionAr : h.descriptionEn}
                        </p>
                      )}
                    </div>
                  </ScrollAnimation>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  href={`/${locale}/hobbies`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
                >
                  {t("hobbies.viewFull")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Resume Section */}
      {resumeUrl && (
        <section
          id="resume"
          className="relative py-20 bg-muted/30"
          style={{ zIndex: 1 }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollAnimation animation="fade-in" delay={0}>
                <div className="bg-card border border-border rounded-2xl p-10 md:p-12 text-center hover:border-blue-500/50 transition-all">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                    {locale === "fr"
                      ? "Télécharger mon CV"
                      : "Download My Resume"}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    {locale === "fr"
                      ? "Consultez mon parcours complet, mes compétences et mon expérience professionnelle"
                      : "View my complete background, skills, and professional experience"}
                  </p>
                  <a
                    href={`/api/resume/file?locale=${locale}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={
                      resumeLabel || (locale === "fr" ? "cv.pdf" : "resume.pdf")
                    }
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {resumeLabel ||
                      (locale === "fr"
                        ? "Télécharger le CV"
                        : "Download Resume")}
                  </a>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>
      )}

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
                  {t("testimonialsSection.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("testimonialsSection.subtitle")}
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <p>
                    {t("testimonialsSection.noTestimonials") ||
                      "No testimonials yet. Check back soon!"}
                  </p>
                </div>
              ) : (
                testimonials.map((testi, idx) => (
                  <ScrollAnimation
                    key={testi.id}
                    animation={
                      idx % 2 === 0
                        ? "slide-in-from-left"
                        : "slide-in-from-right"
                    }
                    delay={idx * 0.15}
                  >
                    <div className="p-8 bg-card border border-border rounded-2xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
                      <p className="text-lg text-foreground italic mb-6">
                        "{testi.content}"
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground font-semibold">
                            {testi.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {testi.role && testi.company
                              ? `${testi.role} at ${testi.company}`
                              : testi.role
                              ? testi.role
                              : testi.company
                              ? testi.company
                              : ""}
                          </p>
                        </div>
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center">
                          {testi.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </ScrollAnimation>
                ))
              )}
            </div>

            <div className="text-center mt-10">
              <Link
                href={`/${locale}/testimonials`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
              >
                {t("testimonialsSection.viewAll")}{" "}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Testimonial Submission Form */}
            <ScrollAnimation animation="fade-in" delay={0.4}>
              <div className="mt-16 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {tTestimonials("submit")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {tTestimonials("subheading")}
                  </p>
                  <Button
                    onClick={() => setShowTestimonialForm(!showTestimonialForm)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
                  >
                    {showTestimonialForm
                      ? tTestimonials("hideForm")
                      : tTestimonials("submitButton")}
                  </Button>
                </div>

                {showTestimonialForm && (
                  <div className="bg-card border border-border rounded-2xl p-8 hover:border-blue-500/50 transition-all">
                    {testimonialSubmitMessage && (
                      <div
                        className={`mb-4 p-4 rounded-lg ${
                          testimonialSubmitMessage.type === "success"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}
                      >
                        {testimonialSubmitMessage.text}
                      </div>
                    )}

                    <form
                      onSubmit={handleTestimonialSubmit}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            placeholder={tTestimonials("yourName")}
                            value={testimonialFormData.name}
                            onChange={(e) => {
                              setTestimonialFormData({
                                ...testimonialFormData,
                                name: capLength(e.target.value, LIMITS.name),
                              });
                              if (testimonialFieldErrors.name)
                                setTestimonialFieldErrors((prev) => ({
                                  ...prev,
                                  name: "",
                                }));
                            }}
                            maxLength={LIMITS.name}
                            className={
                              testimonialFieldErrors.name
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {testimonialFieldErrors.name && (
                            <p className="text-sm text-red-500 mt-1">
                              {testimonialFieldErrors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <Input
                            type="email"
                            placeholder={tTestimonials("yourEmail")}
                            value={testimonialFormData.email}
                            onChange={(e) => {
                              setTestimonialFormData({
                                ...testimonialFormData,
                                email: capLength(e.target.value, LIMITS.email),
                              });
                              if (testimonialFieldErrors.email)
                                setTestimonialFieldErrors((prev) => ({
                                  ...prev,
                                  email: "",
                                }));
                            }}
                            maxLength={LIMITS.email}
                            className={
                              testimonialFieldErrors.email
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {testimonialFieldErrors.email && (
                            <p className="text-sm text-red-500 mt-1">
                              {testimonialFieldErrors.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder={tTestimonials("yourPosition")}
                          value={testimonialFormData.role}
                          onChange={(e) =>
                            setTestimonialFormData({
                              ...testimonialFormData,
                              role: capLength(e.target.value, LIMITS.role),
                            })
                          }
                          maxLength={LIMITS.role}
                        />
                        <Input
                          placeholder={tTestimonials("yourCompany")}
                          value={testimonialFormData.company}
                          onChange={(e) =>
                            setTestimonialFormData({
                              ...testimonialFormData,
                              company: capLength(
                                e.target.value,
                                LIMITS.company
                              ),
                            })
                          }
                          maxLength={LIMITS.company}
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder={tTestimonials("yourMessage")}
                          value={testimonialFormData.content}
                          onChange={(e) => {
                            setTestimonialFormData({
                              ...testimonialFormData,
                              content: capLength(
                                e.target.value,
                                LIMITS.content
                              ),
                            });
                            if (testimonialFieldErrors.content)
                              setTestimonialFieldErrors((prev) => ({
                                ...prev,
                                content: "",
                              }));
                          }}
                          rows={4}
                          maxLength={LIMITS.content}
                          className={`resize-none ${
                            testimonialFieldErrors.content
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {testimonialFieldErrors.content && (
                          <p className="text-sm text-red-500 mt-1">
                            {testimonialFieldErrors.content}
                          </p>
                        )}
                      </div>
                      <Turnstile
                        onVerify={(token) => setTestimonialCaptchaToken(token)}
                        onError={() => setTestimonialCaptchaToken(null)}
                        onExpire={() => setTestimonialCaptchaToken(null)}
                      />
                      <Button
                        type="submit"
                        disabled={isTestimonialSubmitting || !testimonialCaptchaToken}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
                      >
                        {isTestimonialSubmitting
                          ? tCommon("loading")
                          : tTestimonials("submit")}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        id="contact-form"
        className="relative py-20 bg-background"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <ScrollAnimation animation="fade-in" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  {tContact("title", { default: "Get In Touch" })}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {tContact("subtitle", {
                    default: "Have a question or want to work together?",
                  })}
                </p>
                <Button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
                >
                  {showContactForm ? tContact("hideForm") : tContact("showForm")}
                </Button>
              </div>
            </ScrollAnimation>

            {showContactForm && (
              <ScrollAnimation animation="slide-up" delay={0.1}>
                <div className="bg-card border border-border rounded-2xl p-8 hover:border-blue-500/50 transition-all">
                  {contactSubmitStatus === "success" && (
                    <div className="mb-4 p-4 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
                      {tContact("form.successMessage", {
                        default: "Message sent successfully!",
                      })}
                    </div>
                  )}
                  {contactSubmitStatus === "error" && (
                    <div className="mb-4 p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                      {tContact("form.errorMessage", {
                        default: "Failed to send message. Please try again.",
                      })}
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <Input
                        placeholder={tContact("form.name", {
                          default: "Your Name",
                        })}
                        value={contactFormData.name}
                        onChange={(e) => {
                          setContactFormData({
                            ...contactFormData,
                            name: capLength(e.target.value, LIMITS.name),
                          });
                          if (contactFieldErrors.name)
                            setContactFieldErrors((prev) => ({
                              ...prev,
                              name: "",
                            }));
                        }}
                        maxLength={LIMITS.name}
                        className={
                          contactFieldErrors.name ? "border-red-500" : ""
                        }
                      />
                      {contactFieldErrors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {contactFieldErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder={tContact("form.email", {
                          default: "Your Email",
                        })}
                        value={contactFormData.email}
                        onChange={(e) => {
                          setContactFormData({
                            ...contactFormData,
                            email: capLength(e.target.value, LIMITS.email),
                          });
                          if (contactFieldErrors.email)
                            setContactFieldErrors((prev) => ({
                              ...prev,
                              email: "",
                            }));
                        }}
                        maxLength={LIMITS.email}
                        className={
                          contactFieldErrors.email ? "border-red-500" : ""
                        }
                      />
                      {contactFieldErrors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {contactFieldErrors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <Textarea
                        placeholder={tContact("form.message", {
                          default: "Your Message",
                        })}
                        value={contactFormData.message}
                        onChange={(e) => {
                          setContactFormData({
                            ...contactFormData,
                            message: capLength(e.target.value, LIMITS.message),
                          });
                          if (contactFieldErrors.message)
                            setContactFieldErrors((prev) => ({
                              ...prev,
                              message: "",
                            }));
                        }}
                        rows={5}
                        maxLength={LIMITS.message}
                        className={`resize-none ${
                          contactFieldErrors.message ? "border-red-500" : ""
                        }`}
                      />
                      {contactFieldErrors.message && (
                        <p className="text-sm text-red-500 mt-1">
                          {contactFieldErrors.message}
                        </p>
                      )}
                    </div>
                    <Turnstile
                      onVerify={(token) => setContactCaptchaToken(token)}
                      onError={() => setContactCaptchaToken(null)}
                      onExpire={() => setContactCaptchaToken(null)}
                    />
                    <Button
                      type="submit"
                      disabled={isContactSubmitting || !contactCaptchaToken}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
                    >
                      {isContactSubmitting
                        ? tContact("form.sending", { default: "Sending..." })
                        : tContact("form.send", { default: "Send Message" })}
                    </Button>
                  </form>
                </div>
              </ScrollAnimation>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section
        className="relative py-20 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"
        style={{ zIndex: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-card border border-border rounded-2xl p-10 md:p-12 shadow-xl shadow-blue-500/10">
            <ScrollAnimation animation="slide-up" delay={0}>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t("contactSection.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t("contactSection.subtitle")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-transform hover:scale-[1.02]"
                >
                  {t("contactSection.contactMe")}{" "}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="mailto:tamim.afghanyar@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-blue-500/50 text-foreground hover:text-blue-500 transition-colors"
                >
                  {t("contactSection.emailDirectly")}
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
    </div>
  );
}
