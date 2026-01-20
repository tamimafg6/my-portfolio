"use client";

import { useState, useEffect, Suspense } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { validatePassword } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useTheme } from "@/components/ThemeProvider";
import { getImageUrl } from "@/lib/image-utils";

function ResetPasswordForm() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(id);
  }, [success, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate passwords
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || t("Invalid password", "Mot de passe invalide"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("Passwords do not match", "Les mots de passe ne correspondent pas"));
      return;
    }

    setLoading(true);

    try {
      if (!token) {
        setError(t("Invalid reset token", "Jeton de réinitialisation invalide"));
        setLoading(false);
        return;
      }

      const result = await authClient.resetPassword({
        token,
        newPassword: password,
      });

      if (result.error) {
        setError(
          result.error.message ||
            t("Failed to reset password. The link may be expired or invalid.", "Échec de la réinitialisation du mot de passe. Le lien peut être expiré ou invalide.")
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

  if (!token) {
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
              {t("Invalid Reset Link", "Lien de réinitialisation invalide")}
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {error ||
                t("No reset token provided. Please request a new password reset link.", "Aucun jeton de réinitialisation fourni. Veuillez demander un nouveau lien de réinitialisation du mot de passe.")}
            </p>
          </div>
          <div className="text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/90 font-medium block"
            >
              {t("Request new reset link", "Demander un nouveau lien de réinitialisation")}
            </Link>
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary/90 font-medium block"
            >
              {t("Back to login", "Retour à la connexion")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            {t("Enter your new password below.", "Entrez votre nouveau mot de passe ci-dessous.")}
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
              {t("Password reset successfully! Redirecting to login...", "Mot de passe réinitialisé avec succès ! Redirection vers la connexion...")}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                {t("New Password", "Nouveau mot de passe")}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder={t("New password", "Nouveau mot de passe")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={success || loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t("Confirm Password", "Confirmer le mot de passe")}
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder={t("Confirm new password", "Confirmer le nouveau mot de passe")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={success || loading}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || success}
            >
              {loading
                ? t("Resetting...", "Réinitialisation...")
                : success
                ? t("Password Reset!", "Mot de passe réinitialisé !")
                : t("Reset Password", "Réinitialiser le mot de passe")}
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

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-lg text-foreground">{t("Loading...", "Chargement...")}</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
