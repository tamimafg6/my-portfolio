"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import {
  fetchUserDetails,
  fetchUserSessions,
  fetchUserAuditLogs,
  updateUserRole,
  resetUserPassword,
  unlockUserAccount,
  lockUserAccount,
  revokeUserSessions,
} from "@/lib/api/users";
import type {
  User,
  UserDetails,
  SessionInfo,
  AuditLogEntry,
  UserRole,
} from "@/types/user";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function UserDetailsDialog({
  user,
  open,
  onClose,
  onRefresh,
}: UserDetailsDialogProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"details" | "sessions" | "audit">(
    "details"
  );
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("CUSTOMER");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setSelectedRole(user.role);
      loadDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const loadDetails = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const userDetails = await fetchUserDetails(user.id);
      setDetails(userDetails);

      if (activeTab === "sessions") {
        const sessionsData = await fetchUserSessions(user.id);
        setSessions(sessionsData.sessions);
      } else if (activeTab === "audit") {
        const logsData = await fetchUserAuditLogs(user.id, { limit: 50 });
        setAuditLogs(logsData.logs);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("Failed to load user details", "Échec du chargement des détails de l'utilisateur")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user && activeTab !== "details") {
      loadTabData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, open, user]);

  const loadTabData = async () => {
    if (!user) return;

    try {
      if (activeTab === "sessions") {
        const sessionsData = await fetchUserSessions(user.id);
        setSessions(sessionsData.sessions);
      } else if (activeTab === "audit") {
        const logsData = await fetchUserAuditLogs(user.id, { limit: 50 });
        setAuditLogs(logsData.logs);
      }
    } catch (err) {
      console.error("Failed to load tab data:", err);
    }
  };

  const handleRoleChange = async () => {
    if (!user || selectedRole === user.role) return;

    setActionLoading(true);
    try {
      await updateUserRole(user.id, selectedRole);
      await loadDetails();
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Failed to update role", "Échec de la mise à jour du rôle"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    if (!confirm(t(`Send password reset email to ${user.email}?`, `Envoyer un e-mail de réinitialisation du mot de passe à ${user.email} ?`))) return;

    setActionLoading(true);
    try {
      await resetUserPassword(user.id);
      alert(t("Password reset email sent successfully", "E-mail de réinitialisation du mot de passe envoyé avec succès"));
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Failed to reset password", "Échec de la réinitialisation du mot de passe"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleLockAccount = async () => {
    if (!user) return;
    if (
      !confirm(
        t(
          `Lock account for ${user.email}? This will prevent them from logging in.`,
          `Verrouiller le compte pour ${user.email} ? Cela les empêchera de se connecter.`
        )
      )
    )
      return;

    setActionLoading(true);
    try {
      await lockUserAccount(user.id);
      await loadDetails();
      onRefresh();
      alert(t("Account locked successfully", "Compte verrouillé avec succès"));
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Failed to lock account", "Échec du verrouillage du compte"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlockAccount = async () => {
    if (!user) return;
    if (!confirm(t(`Unlock account for ${user.email}?`, `Déverrouiller le compte pour ${user.email} ?`))) return;

    setActionLoading(true);
    try {
      await unlockUserAccount(user.id);
      await loadDetails();
      onRefresh();
      alert(t("Account unlocked successfully", "Compte déverrouillé avec succès"));
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Failed to unlock account", "Échec du déverrouillage du compte"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSessions = async () => {
    if (!user) return;
    if (
      !confirm(
        t(
          `Revoke all sessions for ${user.email}? This will log them out from all devices.`,
          `Révoquer toutes les sessions pour ${user.email} ? Cela les déconnectera de tous les appareils.`
        )
      )
    )
      return;

    setActionLoading(true);
    try {
      await revokeUserSessions(user.id);
      await loadDetails();
      if (activeTab === "sessions") {
        await loadTabData();
      }
      alert(t("All sessions revoked successfully", "Toutes les sessions révoquées avec succès"));
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Failed to revoke sessions", "Échec de la révocation des sessions"));
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("User Details", "Détails de l'utilisateur")}: {user.email}</DialogTitle>
          <DialogDescription>
            {t("Manage user account, roles, sessions, and view audit logs", "Gérer le compte utilisateur, les rôles, les sessions et consulter les journaux d'audit")}
          </DialogDescription>
        </DialogHeader>

        {loading && !details ? (
          <div className="p-8 text-center">{t("Loading user details...", "Chargement des détails de l'utilisateur...")}</div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded">
            <p className="text-destructive font-semibold">{t("Error", "Erreur")}: {error}</p>
            <p className="text-destructive/80 text-sm mt-2">
              {t("User ID", "ID utilisateur")}: {user?.id}
            </p>
            <Button onClick={loadDetails} className="mt-2">
              {t("Retry", "Réessayer")}
            </Button>
          </div>
        ) : details ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-border mb-4">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "details"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("details")}
              >
                {t("Details", "Détails")}
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "sessions"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("sessions")}
              >
                {t("Sessions", "Sessions")} ({details?.sessionCount || 0})
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "audit"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("audit")}
              >
                {t("Audit Logs", "Journaux d'audit")}
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4 min-h-[200px]">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        {t("Email", "E-mail")}
                      </label>
                      <p className="mt-1 text-sm text-foreground">
                        {details.user.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        {t("Username", "Nom d'utilisateur")}
                      </label>
                      <p className="mt-1 text-sm text-foreground">
                        {details.user.username ||
                          details.user.displayUsername ||
                          "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        {t("Name", "Nom")}
                      </label>
                      <p className="mt-1 text-sm text-foreground">
                        {details.user.name || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        {t("Role", "Rôle")}
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <UserRoleBadge role={details.user.role} />
                        <select
                          value={selectedRole}
                          onChange={(e) =>
                            setSelectedRole(e.target.value as UserRole)
                          }
                          className="ml-2 px-2 py-1 border border-input bg-background text-foreground rounded text-sm"
                          disabled={actionLoading}
                        >
                          <option value="CUSTOMER">{t("CUSTOMER", "CLIENT")}</option>
                          <option value="TEAM_BUYER">{t("TEAM_BUYER", "ACHETEUR_D'ÉQUIPE")}</option>
                          <option value="ADMIN">{t("ADMIN", "ADMINISTRATEUR")}</option>
                        </select>
                        {selectedRole !== details.user.role && (
                          <Button
                            size="sm"
                            onClick={handleRoleChange}
                            disabled={actionLoading}
                          >
                            {t("Update", "Mettre à jour")}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        {t("Status", "Statut")}
                      </label>
                      <div className="mt-1">
                        <UserStatusBadge
                          emailVerified={details.user.emailVerified}
                          isLocked={details.lockoutStatus.isLocked}
                          isDeleted={details.user.isDeleted || !!details.user.deletedAt}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        {t("Created", "Créé")}
                      </label>
                      <p className="mt-1 text-sm text-foreground">
                        {formatDate(details.user.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        {t("Last Login", "Dernière connexion")}
                      </label>
                      <p className="mt-1 text-sm text-foreground">
                        {details.lastLogin
                          ? formatDate(details.lastLogin)
                          : t("Never", "Jamais")}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        {t("Active Sessions", "Sessions actives")}
                      </label>
                      <p className="mt-1 text-sm text-foreground">
                        {details.sessionCount}
                      </p>
                    </div>
                  </div>

                  {details.lockoutStatus.isLocked && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        {t("Account is locked. Remaining attempts:", "Le compte est verrouillé. Tentatives restantes :")}{" "}
                        {details.lockoutStatus.remainingAttempts}
                        {details.lockoutStatus.lockoutExpiresAt && (
                          <span>
                            {" "}
                            ({t("expires", "expire")}:{" "}
                            {formatDate(details.lockoutStatus.lockoutExpiresAt)}
                            )
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handleResetPassword}
                      disabled={actionLoading}
                    >
                      {t("Reset Password", "Réinitialiser le mot de passe")}
                    </Button>
                    {details.lockoutStatus.isLocked ? (
                      <Button
                        variant="outline"
                        onClick={handleUnlockAccount}
                        disabled={actionLoading}
                      >
                        {t("Unlock Account", "Déverrouiller le compte")}
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={handleLockAccount}
                        disabled={actionLoading}
                      >
                        {t("Lock Account", "Verrouiller le compte")}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={handleRevokeSessions}
                      disabled={actionLoading}
                    >
                      {t("Revoke All Sessions", "Révoquer toutes les sessions")}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "sessions" && (
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      {t("No active sessions", "Aucune session active")}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                              {t("IP Address", "Adresse IP")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                              {t("User Agent", "Agent utilisateur")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                              {t("Created", "Créé")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                              {t("Expires", "Expire")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {sessions.map((session) => (
                            <tr key={session.id} className="group">
                              <td className="px-4 py-3 text-sm text-foreground rounded-l-md group-hover:bg-accent transition-colors">
                                {session.ipAddress || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-foreground group-hover:bg-accent transition-colors">
                                {session.userAgent || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground group-hover:bg-accent transition-colors">
                                {formatDate(session.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground rounded-r-md group-hover:bg-accent transition-colors">
                                {formatDate(session.expiresAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "audit" && (
                <div className="space-y-2">
                  {auditLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      {t("No audit logs", "Aucun journal d'audit")}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                              {t("Event", "Événement")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                              {t("Success", "Succès")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                              {t("IP Address", "Adresse IP")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                              {t("Date", "Date")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="group">
                              <td className="px-4 py-3 text-sm text-foreground rounded-l-md group-hover:bg-accent transition-colors">
                                {log.eventType}
                              </td>
                              <td className="px-4 py-3 text-sm group-hover:bg-accent transition-colors">
                                <span
                                  className={`px-2 py-1 rounded ${
                                    log.success
                                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                      : "bg-destructive/20 text-destructive"
                                  }`}
                                >
                                  {log.success ? t("Success", "Succès") : t("Failed", "Échec")}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground group-hover:bg-accent transition-colors">
                                {log.ipAddress || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground rounded-r-md group-hover:bg-accent transition-colors">
                                {formatDate(log.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
