import { getTranslations } from "next-intl/server";
import { Github, Linkedin, FileText } from "lucide-react";
import Link from "next/link";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("about");

  const content = {
    en: {
      title: "About Me",
      description:
        "Hi, I'm Tamim Afghanyar. I'm a passionate Computer Science student motivated by learning new technologies and solving problems creatively. I enjoy environments where I can grow, adapt quickly, and contribute to impactful projects. Let's connect!",
    },
    fr: {
      title: "À Propos",
      description:
        "Bonjour, je m'appelle Tamim Afghanyar. Je suis un étudiant passionné en informatique, motivé par l'apprentissage de nouvelles technologies et la résolution créative de problèmes. J'aime les environnements où je peux évoluer, m'adapter rapidement et contribuer à des projets ayant un impact réel. Connectons-nous!",
    },
  };

  const pageContent = locale === "fr" ? content.fr : content.en;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] px-4">
      <div className="max-w-4xl w-full py-16">
        <div className="fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900 dark:text-white">
            {pageContent.title}
          </h1>

          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            {pageContent.description}
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <Link
              href="https://github.com/tamimjdd"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/tamim-afghanyar/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Link>
            <Link
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Resume"
            >
              <FileText className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
