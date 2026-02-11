"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { Mail, MapPin, Send, Sparkles } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";
import { validateContactForm, capLength, LIMITS } from "@/lib/form-validation";

interface ContactInfo {
  email: string | null;
  address: string | null;
}

export default function ContactPage() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: null,
    address: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/contact/info", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setContactInfo({
            email: data.email ?? null,
            address: data.address ?? null,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const result = validateContactForm(formData);
    if (!result.ok) {
      setFieldErrors(result.errors);
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const maxLen = name === "name" ? LIMITS.name : name === "email" ? LIMITS.email : LIMITS.message;
    setFormData((prev) => ({
      ...prev,
      [name]: capLength(value, maxLen),
    }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const content = {
    en: {
      title: "Get In Touch",
      subtitle:
        "Have a question or want to work together? Feel free to reach out!",
      contactInfo: "Contact Information",
      email: "Email",
      location: "Location",
      formTitle: "Send a Message",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      emailLabel: "Email",
      emailPlaceholder: "Your email",
      messageLabel: "Message",
      messagePlaceholder: "Your message",
      sendButton: "Send Message",
      sending: "Sending...",
      successMessage: "Message sent successfully! I'll get back to you soon.",
      errorMessage: "Something went wrong. Please try again.",
    },
    fr: {
      title: "Contactez-Moi",
      subtitle:
        "Vous avez une question ou souhaitez collaborer? N'hésitez pas à me contacter!",
      contactInfo: "Informations de Contact",
      email: "Courriel",
      location: "Emplacement",
      formTitle: "Envoyer un Message",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom",
      emailLabel: "Courriel",
      emailPlaceholder: "Votre courriel",
      messageLabel: "Message",
      messagePlaceholder: "Votre message",
      sendButton: "Envoyer le Message",
      sending: "Envoi en cours...",
      successMessage: "Message envoyé avec succès! Je vous répondrai bientôt.",
      errorMessage: "Une erreur s'est produite. Veuillez réessayer.",
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
              id="contact-grid"
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
            fill="url(#contact-grid)"
            className="text-foreground"
          />
        </svg>
      </div>

      <div className="px-6 md:px-12 relative z-10">
        {/* Header */}
        <ScrollAnimation animation="fade-in" delay={0}>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-500 uppercase tracking-wider">
                {locale === "fr" ? "Contactez-moi" : "Let's Connect"}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              {pageContent.title}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {pageContent.subtitle}
            </p>
          </div>
        </ScrollAnimation>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <ScrollAnimation animation="slide-in-from-left" delay={0.1}>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">
                  {pageContent.contactInfo}
                </h2>
              </div>

              <div className="space-y-6">
                {contactInfo.email && (
                  <div className="group flex items-start gap-4 p-6 bg-card border border-border rounded-xl hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-foreground">
                        {pageContent.email}
                      </h3>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-muted-foreground hover:text-blue-500 transition-colors"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}

                {contactInfo.address && (
                  <div className="group flex items-start gap-4 p-6 bg-card border border-border rounded-xl hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-foreground">
                        {pageContent.location}
                      </h3>
                      <p className="text-muted-foreground">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollAnimation>

          {/* Contact Form */}
          <ScrollAnimation animation="slide-in-from-right" delay={0.2}>
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-foreground">
                {pageContent.formTitle}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    {pageContent.nameLabel}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={LIMITS.name}
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                    className={`w-full px-4 py-3 border rounded-lg 
                             bg-background text-foreground
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             hover:border-blue-500/50 transition-colors ${fieldErrors.name ? "border-red-500" : "border-border"}`}
                    placeholder={pageContent.namePlaceholder}
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-500" role="alert">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    {pageContent.emailLabel}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={LIMITS.email}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    className={`w-full px-4 py-3 border rounded-lg 
                             bg-background text-foreground
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             hover:border-blue-500/50 transition-colors ${fieldErrors.email ? "border-red-500" : "border-border"}`}
                    placeholder={pageContent.emailPlaceholder}
                  />
                  {fieldErrors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    {pageContent.messageLabel}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={LIMITS.message}
                    rows={5}
                    aria-invalid={!!fieldErrors.message}
                    aria-describedby={fieldErrors.message ? "message-error" : undefined}
                    className={`w-full px-4 py-3 border rounded-lg 
                             bg-background text-foreground
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             hover:border-blue-500/50 transition-colors resize-none ${fieldErrors.message ? "border-red-500" : "border-border"}`}
                    placeholder={pageContent.messagePlaceholder}
                  />
                  {fieldErrors.message && (
                    <p id="message-error" className="mt-1 text-sm text-red-500" role="alert">{fieldErrors.message}</p>
                  )}
                </div>

                {submitStatus === "success" && (
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-500 rounded-lg border border-green-500/20">
                    {pageContent.successMessage}
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-500 rounded-lg border border-red-500/20">
                    {pageContent.errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg 
                           hover:from-blue-600 hover:to-purple-700 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           flex items-center justify-center gap-2 font-medium
                           hover:shadow-lg hover:shadow-blue-500/30
                           transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? pageContent.sending : pageContent.sendButton}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </div>
  );
}
