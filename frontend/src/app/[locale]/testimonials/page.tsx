"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import ScrollAnimation from "@/components/ScrollAnimation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  email: string;
  createdAt: string;
}

export default function TestimonialsPage() {
  const t = useTranslations("testimonials");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
    content: "",
    rating: 5,
  });

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          setTestimonials(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch testimonials:", res.status);
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role || null,
          company: formData.company || null,
          content: formData.content,
          rating: formData.rating,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmitMessage({ 
          type: "success", 
          text: data.message || t("submitSuccess") 
        });
        setFormData({ name: "", email: "", role: "", company: "", content: "", rating: 5 });
        setShowForm(false);
        // Refresh testimonials list
        const refreshRes = await fetch("/api/testimonials");
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setTestimonials(Array.isArray(refreshData) ? refreshData : []);
        }
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitMessage(null);
        }, 5000);
      } else {
        const error = await res.json();
        setSubmitMessage({ type: "error", text: error.error || t("submitError") });
      }
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      setSubmitMessage({ type: "error", text: t("submitError") });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {isLoading ? (
            <div className="col-span-2 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">{tCommon("loading")}</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <p>No testimonials yet. Be the first to leave a review!</p>
            </div>
          ) : (
            testimonials.map((testimonial, index) => (
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
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      {testimonial.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role}{testimonial.company ? (locale === "fr" ? ` chez ${testimonial.company}` : ` at ${testimonial.company}`) : ""}
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
            ))
          )}
        </div>

        {/* Submit Testimonial Form */}
        <ScrollAnimation animation="fade-in" delay={0.4}>
          <div className="mt-16">
            {/* Success/Error Message - Show even when form is closed */}
            {submitMessage && !showForm && (
              <div
                className={`mb-6 p-6 rounded-lg text-center max-w-2xl mx-auto ${
                  submitMessage.type === "success"
                    ? "bg-green-500/10 text-green-500 border-2 border-green-500/30"
                    : "bg-red-500/10 text-red-500 border-2 border-red-500/30"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {submitMessage.type === "success" ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <p className="font-semibold text-lg">{submitMessage.text}</p>
                </div>
              </div>
            )}
            
            {!showForm ? (
              <div className="text-center p-8 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl border border-blue-500/20">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {t("cta.heading")}
                </h2>
                <p className="text-muted-foreground mb-6">{t("cta.description")}</p>
                <div className="flex gap-4 justify-center items-center">
                  <Button
                    onClick={() => {
                      setShowForm(true);
                      setSubmitMessage(null);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 rounded-lg"
                  >
                    {t("submit")}
                  </Button>
                  <a
                    href={`/${locale}/contact`}
                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-500 text-blue-500 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300 whitespace-nowrap"
                  >
                    {t("cta.button")}
                  </a>
                </div>
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>{t("submit")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {submitMessage && (
                    <div
                      className={`mb-4 p-4 rounded-lg ${
                        submitMessage.type === "success"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {submitMessage.text}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                          {t("yourName")} *
                        </label>
                        <Input
                          id="name"
                          placeholder={t("yourName")}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                          {t("yourEmail")} *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("yourEmail")}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium text-foreground">
                          {t("yourPosition")}
                        </label>
                        <Input
                          id="role"
                          placeholder={t("yourPosition")}
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium text-foreground">
                          {t("yourCompany")}
                        </label>
                        <Input
                          id="company"
                          placeholder={t("yourCompany")}
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="rating" className="text-sm font-medium text-foreground">
                        {t("rating")} *
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className={`text-2xl transition-colors ${
                              star <= formData.rating
                                ? "text-yellow-500"
                                : "text-muted-foreground/30"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="content" className="text-sm font-medium text-foreground">
                        {t("yourMessage")} *
                      </label>
                      <Textarea
                        id="content"
                        placeholder={t("yourMessage")}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={5}
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                      >
                        {isSubmitting ? tCommon("loading") : t("submit")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          setSubmitMessage(null);
                          setFormData({ name: "", email: "", role: "", company: "", content: "", rating: 5 });
                        }}
                      >
                        {tCommon("cancel")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}
