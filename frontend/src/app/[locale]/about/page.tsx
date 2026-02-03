import { getTranslations } from "next-intl/server";
import { Github, Linkedin, FileText, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ScrollAnimation from "@/components/ScrollAnimation";

function getApiUrl(): string {
  const url =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api";
  return url.replace(/\/$/, "");
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("about");

  let resumeUrl: string | null = null;
  let resumeLabel = locale === "fr" ? "CV" : "Resume";
  let profilePhotoUrl: string | null = null;
  let linkedInUrl: string | null = null;
  let githubUrl: string | null = null;
  try {
    const apiUrl = getApiUrl();
    const [resumeRes, contactRes] = await Promise.all([
      fetch(`${apiUrl}/resume`, { cache: "no-store" }),
      fetch(`${apiUrl}/contact/info`, { cache: "no-store" }),
    ]);
    if (resumeRes.ok) {
      const resumeData = await resumeRes.json();
      if (resumeData?.fileUrl) {
        resumeUrl = resumeData.fileUrl;
        resumeLabel = locale === "fr" ? (resumeData.labelAr ?? "CV") : (resumeData.labelEn ?? "Resume");
      }
    }
    if (contactRes.ok) {
      const contactData = await contactRes.json();
      profilePhotoUrl = contactData?.profilePhotoUrl ?? null;
      linkedInUrl = contactData?.linkedIn ?? contactData?.linkedin ?? null;
      githubUrl = contactData?.github ?? null;
    }
  } catch (_) {}

  const content = {
    en: {
      title: "About Me",
      description:
        "Hi, I'm Tamim Afghanyar. I'm a passionate Computer Science student motivated by learning new technologies and solving problems creatively. I enjoy environments where I can grow, adapt quickly, and contribute to impactful projects. Let's connect!",
      highlights: [
        "Full-Stack Developer with expertise in modern web technologies",
        "Problem solver who thrives in collaborative environments",
        "Passionate about clean code and best practices",
        "Always eager to learn and explore emerging technologies",
      ],
    },
    fr: {
      title: "À Propos",
      description:
        "Bonjour, je m'appelle Tamim Afghanyar. Je suis un étudiant passionné en informatique, motivé par l'apprentissage de nouvelles technologies et la résolution créative de problèmes. J'aime les environnements où je peux évoluer, m'adapter rapidement et contribuer à des projets ayant un impact réel. Connectons-nous!",
      highlights: [
        "Développeur Full-Stack avec expertise en technologies web modernes",
        "Résolveur de problèmes qui s'épanouit dans les environnements collaboratifs",
        "Passionné par le code propre et les meilleures pratiques",
        "Toujours impatient d'apprendre et d'explorer les technologies émergentes",
      ],
    },
  };

  const pageContent = locale === "fr" ? content.fr : content.en;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      {/* Background geometric pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="about-grid"
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
            fill="url(#about-grid)"
            className="text-foreground"
          />
        </svg>
      </div>

      <div className="px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <ScrollAnimation animation="fade-in" delay={0}>
            <div className="mb-16">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                {profilePhotoUrl && (
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-border shadow-xl shrink-0">
                    <Image
                      src="/api/profile/photo"
                      alt={locale === "fr" ? "Photo de profil" : "Profile photo"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 128px, 160px"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-500 uppercase tracking-wider">
                      {locale === "fr" ? "Qui suis-je" : "Who I Am"}
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                    {pageContent.title}
                  </h1>
                  <div className={`w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 ${profilePhotoUrl ? "mx-auto sm:mx-0" : ""}`}></div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Text Content */}
            <ScrollAnimation animation="slide-in-from-left" delay={0.1}>
              <div>
                <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-light">
                  {pageContent.description}
                </p>

                {/* Highlights */}
                <div className="space-y-3">
                  {pageContent.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <ArrowRight className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>

            {/* Visual Card */}
            <ScrollAnimation animation="slide-in-from-right" delay={0.2}>
              <div className="relative">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>

                {/* Card */}
                <div className="relative p-8 md:p-10 bg-card border border-border rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-3">
                        {locale === "fr" ? "Stack Technique" : "Tech Stack"}
                      </h3>
                      <p className="text-foreground text-sm leading-relaxed">
                        {locale === "fr"
                          ? "Spécialisé en Next.js, React, TypeScript, Tailwind CSS, et architectures modernes d'applications web."
                          : "Specialized in Next.js, React, TypeScript, Tailwind CSS, and modern web application architectures."}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h3 className="text-sm font-semibold text-purple-500 uppercase tracking-wider mb-3">
                        {locale === "fr" ? "Passions" : "Passions"}
                      </h3>
                      <p className="text-foreground text-sm leading-relaxed">
                        {locale === "fr"
                          ? "Création d'applications élégantes, mentorat, contribution à l'open-source et exploration des technologies émergentes."
                          : "Building elegant applications, mentoring, contributing to open-source, and exploring emerging technologies."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>

          {/* Social Links */}
          <ScrollAnimation animation="fade-in" delay={0.3}>
            <div className="border-t border-border pt-12">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                {locale === "fr" ? "Connectons-nous" : "Let's Connect"}
              </h3>
              <div className="flex flex-wrap gap-4">
                {githubUrl && (
                  <Link
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-lg hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-foreground font-medium">GitHub</span>
                  </Link>
                )}
                {linkedInUrl && (
                  <Link
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-lg hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span className="text-foreground font-medium">LinkedIn</span>
                  </Link>
                )}
                {resumeUrl && (
                  <Link
                    href={`/api/resume/file?locale=${locale}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={locale === "fr" ? "cv.pdf" : "resume.pdf"}
                    className="group flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-lg hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                    aria-label={locale === "fr" ? "Télécharger le CV" : "Download CV"}
                  >
                    <FileText className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-foreground font-medium">
                      {locale === "fr" ? "Télécharger le CV" : "Download CV"}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </div>
  );
}
