"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Sparkles } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

export default function ContactPage() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const content = {
    en: {
      title: "Get In Touch",
      subtitle:
        "Have a question or want to work together? Feel free to reach out!",
      contactInfo: "Contact Information",
      email: "Email",
      phone: "Phone",
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
      phone: "Téléphone",
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
                <div className="group flex items-start gap-4 p-6 bg-card border border-border rounded-xl hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">
                      {pageContent.email}
                    </h3>
                    <a
                      href="mailto:tamim.afghanyar@gmail.com"
                      className="text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      tamim.afghanyar@gmail.com
                    </a>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-6 bg-card border border-border rounded-xl hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">
                      {pageContent.phone}
                    </h3>
                    <a
                      href="tel:+15149539598"
                      className="text-muted-foreground hover:text-purple-500 transition-colors"
                    >
                      514-953-9598
                    </a>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-6 bg-card border border-border rounded-xl hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">
                      {pageContent.location}
                    </h3>
                    <p className="text-muted-foreground">
                      Saint-Jean-sur-Richelieu, Quebec
                    </p>
                  </div>
                </div>
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
                    className="w-full px-4 py-3 border border-border rounded-lg 
                             bg-background text-foreground
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             hover:border-blue-500/50 transition-colors"
                    placeholder={pageContent.namePlaceholder}
                  />
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
                    className="w-full px-4 py-3 border border-border rounded-lg 
                             bg-background text-foreground
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             hover:border-blue-500/50 transition-colors"
                    placeholder={pageContent.emailPlaceholder}
                  />
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
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-lg 
                             bg-background text-foreground
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             hover:border-blue-500/50 transition-colors resize-none"
                    placeholder={pageContent.messagePlaceholder}
                  />
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

