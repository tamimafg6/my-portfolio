"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

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
    <div className="min-h-screen py-16 bg-gray-50 dark:bg-[#0a0a0f]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {pageContent.title}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {pageContent.subtitle}
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8 fade-in" style={{ animationDelay: "0.1s" }}>
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                {pageContent.contactInfo}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">
                    {pageContent.email}
                  </h3>
                  <a
                    href="mailto:tamim.afghanyar@gmail.com"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    tamim.afghanyar@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">
                    {pageContent.phone}
                  </h3>
                  <a
                    href="tel:+15149539598"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    514-953-9598
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">
                    {pageContent.location}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Saint-Jean-sur-Richelieu, Quebec
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className="bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-xl p-8 fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              {pageContent.formTitle}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2 text-gray-900 dark:text-white"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                           bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder={pageContent.namePlaceholder}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-gray-900 dark:text-white"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                           bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder={pageContent.emailPlaceholder}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2 text-gray-900 dark:text-white"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                           bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                  placeholder={pageContent.messagePlaceholder}
                />
              </div>

              {submitStatus === "success" && (
                <div className="p-4 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-500/20">
                  {pageContent.successMessage}
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-500/20">
                  {pageContent.errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg 
                         hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isSubmitting ? pageContent.sending : pageContent.sendButton}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
