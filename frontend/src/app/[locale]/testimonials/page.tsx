import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { useLocale } from "next-intl";
import ScrollAnimation from "@/components/ScrollAnimation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "testimonials" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  image?: string;
  rating: number;
}

// Mock data - will be replaced with API call later
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Project Manager",
    company: "Tech Solutions Inc.",
    content:
      "Working with Tamim was an absolute pleasure. His technical expertise and attention to detail helped us deliver our project ahead of schedule. Highly recommended!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Senior Developer",
    company: "Digital Innovations",
    content:
      "Tamim's problem-solving skills are exceptional. He consistently delivers clean, maintainable code and is always willing to help team members.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "CTO",
    company: "StartupHub",
    content:
      "An outstanding developer who brings both technical excellence and great communication skills. Tamim was instrumental in building our core platform.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Kumar",
    role: "Tech Lead",
    company: "CloudTech Systems",
    content:
      "Tamim's ability to learn new technologies quickly and apply them effectively is impressive. A valuable asset to any development team.",
    rating: 5,
  },
];

export default function TestimonialsPage() {
  const t = useTranslations("testimonials");
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background py-20">
      {/* Background geometric pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5 dark:opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="testimonials-grid"
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
            fill="url(#testimonials-grid)"
            className="text-foreground"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollAnimation animation="fade-in">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              {t("heading")}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("subheading")}
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <ScrollAnimation
              key={testimonial.id}
              animation={
                index % 2 === 0 ? "slide-in-from-left" : "slide-in-from-right"
              }
              delay={index * 0.1}
            >
              <div className="bg-card backdrop-blur-sm p-8 rounded-2xl border border-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group relative">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-foreground text-lg mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      {testimonial.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Quote icon decoration */}
                <div className="absolute top-4 right-4 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                  <svg
                    className="w-16 h-16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Call to action */}
        <ScrollAnimation animation="fade-in" delay={0.4}>
          <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl border border-blue-500/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t("cta.heading")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("cta.description")}</p>
            <a
              href={`/${locale}/contact`}
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              {t("cta.button")}
            </a>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}
