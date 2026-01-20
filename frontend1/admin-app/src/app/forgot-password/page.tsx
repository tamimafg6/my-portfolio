"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { validateEmail } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useTheme } from "@/components/ThemeProvider";
import { getImageUrl } from "@/lib/image-utils";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || t("Invalid email", "E-mail invalide"));
      setLoading(false);
      return;
    }

    try {
      // Use Better Auth client to request password reset
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });

      if (result.error) {
        setError(
          result.error.message ||
            t("Failed to send password reset email. Please try again.", "Échec de l'envoi de l'e-mail de réinitialisation du mot de passe. Veuillez réessayer.")
        );
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(t("An unexpected error occurred. Please try again.", "Une erreur inattendue s'est produite. Veuillez réessayer."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Language and Theme Toggles - Top Right */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <LanguageToggle />
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t("Toggle theme", "Basculer le thème")}
            className="h-9 w-9"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-md border">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src={getImageUrl("logo.png")}
            alt={t("Passion Jerseys", "Maillots Passion")}
            width={240}
            height={72}
            unoptimized
            className="h-20 w-auto"
          />
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {t("Reset Your Password", "Réinitialiser votre mot de passe")}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("Enter your email address and we'll send you a link to reset your password.", "Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.")}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-700 px-4 py-3 rounded-md text-sm">
              {t("Password reset email sent! Please check your inbox for instructions.", "E-mail de réinitialisation envoyé ! Veuillez vérifier votre boîte de réception pour les instructions.")}
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">
              {t("Email address", "Adresse e-mail")}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t("Email address", "Adresse e-mail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || success}
            >
              {loading
                ? t("Sending...", "Envoi...")
                : success
                ? t("Email Sent!", "E-mail envoyé !")
                : t("Send Reset Link", "Envoyer le lien de réinitialisation")}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary/90 font-medium"
            >
              {t("Back to login", "Retour à la connexion")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
