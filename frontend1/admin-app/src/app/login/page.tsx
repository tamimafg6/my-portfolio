"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { validateEmail } from "@/lib/validation";
import { formatAuthErrorMessage } from "@/lib/auth-errors";
import { parseAuthError } from "@shared/lib/auth/parse-error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useTheme } from "@/components/ThemeProvider";

function LoginForm() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for error message in URL query parameters
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
      // Clear the error from URL to prevent showing it again on refresh
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("error");
      const newUrl = newSearchParams.toString() 
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!emailOrUsername || emailOrUsername.trim().length === 0) {
      setError(t("Email or username is required", "L'e-mail ou le nom d'utilisateur est requis"));
      setLoading(false);
      return;
    }

    if (!password || password.length === 0) {
      setError(t("Password is required", "Le mot de passe est requis"));
      setLoading(false);
      return;
    }

    try {
      // Detect if input is email (contains @) or username
      const isEmail = emailOrUsername.includes("@");
      let result;

      if (isEmail) {
        // Validate email format
        const emailValidation = validateEmail(emailOrUsername);
        if (!emailValidation.valid) {
          setError(emailValidation.error || t("Invalid email", "E-mail invalide"));
          setLoading(false);
          return;
        }
        // Sign in with email
        result = await authClient.signIn.email({
          email: emailOrUsername.trim(),
          password,
          rememberMe,
        });
      } else {
        // Sign in with username
        result = await authClient.signIn.username({
          username: emailOrUsername.trim(),
          password,
          rememberMe,
        });
      }

      const resultWithError = result as
        | { error?: { message?: string } | string | unknown }
        | { data?: unknown };
      if ("error" in resultWithError && resultWithError.error) {
        const defaultMessage = t("Login failed. Please check your credentials.", "Échec de la connexion. Veuillez vérifier vos identifiants.");
        const errorMessage = parseAuthError(resultWithError.error, defaultMessage);

        const formattedError = formatAuthErrorMessage({
          message: errorMessage,
        });
        setError(formattedError || defaultMessage);
        setLoading(false);
        return;
      }

      // Verify session was created
      let session = await authClient.getSession();
      let retries = 0;
      while (!session.data?.session && retries < 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        session = await authClient.getSession();
        retries++;
      }

      if (session.data?.session) {
        // Wait a bit longer to ensure cookies are fully set
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Verify we can get a token before redirecting
        const tokenResult = await authClient.token();
        if (tokenResult.data?.token) {
          // Use router.push to respect basePath configuration
          // This ensures redirects work correctly with /admin basePath
          router.push("/dashboard");
          return; // Exit early, don't set loading to false
        } else {
          setError(
            t("Failed to retrieve authentication token. Please try again.", "Échec de la récupération du jeton d'authentification. Veuillez réessayer.")
          );
          setLoading(false);
        }
      } else {
        setError(t("Failed to establish session. Please try again.", "Échec de l'établissement de la session. Veuillez réessayer."));
        setLoading(false);
      }
    } catch (err: unknown) {
      const defaultMessage = t("Login failed. Please check your credentials.", "Échec de la connexion. Veuillez vérifier vos identifiants.");
      const errorMessage = parseAuthError(err, defaultMessage);

      const formattedError = formatAuthErrorMessage({ message: errorMessage });
      setError(formattedError || defaultMessage);
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
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {t("Admin Login", "Connexion administrateur")}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("Sign in to access the admin console", "Connectez-vous pour accéder à la console d'administration")}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="emailOrUsername" className="sr-only">
                {t("Email or Username", "E-mail ou nom d'utilisateur")}
              </label>
              <Input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                autoComplete="username"
                required
                placeholder={t("Email or Username", "E-mail ou nom d'utilisateur")}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t("Password", "Mot de passe")}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder={t("Password", "Mot de passe")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-foreground"
              >
                {t("Remember me", "Se souvenir de moi")}
              </label>
            </div>
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary/90"
              >
                {t("Forgot password?", "Mot de passe oublié ?")}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("Signing in...", "Connexion...") : t("Sign in", "Se connecter")}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  {t("Or continue with", "Ou continuer avec")}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  // Use basePath-aware callback URL for OAuth
                  // Next.js basePath is automatically included in router paths, but for OAuth we need full URL
                  // Use NEXT_PUBLIC_BASE_PATH if set, otherwise default to empty for dev
                  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
                  const callbackURL =
                    typeof window !== "undefined"
                      ? `${window.location.origin}${basePath}/dashboard`
                      : `${basePath}/dashboard`;
                  await authClient.signIn.social({
                    provider: "google",
                    callbackURL,
                  });
                } catch (err) {
                  setError(t("Failed to sign in with Google", "Échec de la connexion avec Google"));
                }
              }}
              className="w-full flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("Sign in with Google", "Se connecter avec Google")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useLanguage();
  
  return (
    <Suspense fallback={<div>{t("Loading...", "Chargement...")}</div>}>
      <LoginForm />
    </Suspense>
  );
}
