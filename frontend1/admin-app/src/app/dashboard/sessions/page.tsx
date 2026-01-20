"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getAuthServiceBaseUrl } from "@/lib/utils/auth-url";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/lib/i18n";

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revoking, setRevoking] = useState<string | null>(null);

  // Use centralized helper for normalized auth service URL (without /api/auth for manual fetch calls)
  const getAuthApiBase = () => {
    return getAuthServiceBaseUrl();
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Check authentication and admin role
        const session = await authClient.getSession();
        if (!session.data?.session) {
          router.push("/login");
          return;
        }

        const user = session.data.user;
        const role = (user as { role?: string })?.role;
        // Normalize role to uppercase for comparison (handles "admin" vs "ADMIN")
        const normalizedRole = role ? role.toUpperCase() : null;
        if (normalizedRole !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        // Fetch sessions from auth-service
        const baseUrl = getAuthApiBase();
        const response = await fetch(`${baseUrl}/api/auth/sessions`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(t("Failed to fetch sessions", "Échec de la récupération des sessions"));
        }

        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err) {
        setError(t("Failed to load sessions. Please try again.", "Échec du chargement des sessions. Veuillez réessayer."));
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [router, t]);

  const handleRevokeSession = async (sessionId: string) => {
    if (revoking) return;

    setRevoking(sessionId);
    try {
      const baseUrl = getAuthApiBase();
      const response = await fetch(
        `${baseUrl}/api/auth/sessions/${sessionId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(t("Failed to revoke session", "Échec de la révocation de la session"));
      }

      // Remove session from list
      setSessions(sessions.filter((s: Session) => s.id !== sessionId));
    } catch (err) {
      setError(t("Failed to revoke session. Please try again.", "Échec de la révocation de la session. Veuillez réessayer."));
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (
      revoking ||
      !confirm(t("Are you sure you want to revoke all other sessions?", "Êtes-vous sûr de vouloir révoquer toutes les autres sessions ?"))
    ) {
      return;
    }

    setRevoking("all");
    try {
      const baseUrl = getAuthApiBase();
      const response = await fetch(`${baseUrl}/api/auth/sessions`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(t("Failed to revoke sessions", "Échec de la révocation des sessions"));
      }

      // Keep only current session
      setSessions(sessions.filter((s: Session) => s.isCurrent));
    } catch (err) {
      setError(t("Failed to revoke sessions. Please try again.", "Échec de la révocation des sessions. Veuillez réessayer."));
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceInfo = (userAgent: string | null) => {
    if (!userAgent) return t("Unknown device", "Appareil inconnu");

    // Simple device detection
    if (userAgent.includes("Mobile")) return t("Mobile device", "Appareil mobile");
    if (userAgent.includes("Tablet")) return t("Tablet", "Tablette");
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux";

    return t("Desktop", "Bureau");
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("Active Sessions", "Sessions actives")}
            </h1>
            <p className="text-muted-foreground">
              {t("Manage and monitor user sessions", "Gérer et surveiller les sessions utilisateur")}
            </p>
          </div>
          {sessions.length > 0 &&
            sessions.filter((s: Session) => !s.isCurrent).length > 0 && (
              <Button
                onClick={handleRevokeAll}
                disabled={revoking === "all"}
                variant="destructive"
              >
                {revoking === "all"
                  ? t("Revoking...", "Révocation...")
                  : t("Revoke All Other Sessions", "Révoquer toutes les autres sessions")}
              </Button>
            )}
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive text-sm">{error}</div>
            </CardContent>
          </Card>
        )}

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                {t("No active sessions found.", "Aucune session active trouvée.")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("Sessions", "Sessions")} ({sessions.length})</CardTitle>
              <CardDescription>
                {t("All active sessions for your account", "Toutes les sessions actives pour votre compte")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Device", "Appareil")}</TableHead>
                    <TableHead>{t("IP Address", "Adresse IP")}</TableHead>
                    <TableHead>{t("Created", "Créé")}</TableHead>
                    <TableHead>{t("Expires", "Expire")}</TableHead>
                    <TableHead>{t("Status", "Statut")}</TableHead>
                    <TableHead className="text-right">{t("Actions", "Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {getDeviceInfo(session.userAgent)}
                      </TableCell>
                      <TableCell>{session.ipAddress || t("Unknown", "Inconnu")}</TableCell>
                      <TableCell>{formatDate(session.createdAt)}</TableCell>
                      <TableCell>{formatDate(session.expiresAt)}</TableCell>
                      <TableCell>
                        {session.isCurrent ? (
                          <Badge variant="default">{t("Current Session", "Session actuelle")}</Badge>
                        ) : (
                          <Badge variant="secondary">{t("Active", "Actif")}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!session.isCurrent && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={revoking === session.id}
                          >
                            {revoking === session.id ? t("Revoking...", "Révocation...") : t("Revoke", "Révoquer")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
