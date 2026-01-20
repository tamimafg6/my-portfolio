"use client";

import { useState, useEffect } from "react";
import { fetchUsers } from "@/lib/api/users";
import type { User, UserListParams, UserRole } from "@/types/user";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserActionsMenu } from "./UserActionsMenu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

interface UserListProps {
  onViewDetails: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onLockAccount: (userId: string) => void;
  onUnlockAccount: (userId: string) => void;
  onRevokeSessions: (userId: string) => void;
  onRoleChange: (userId: string, role: string) => void;
  onDeleteUser: (user: User) => void;
  onRestoreUser: (userId: string) => void;
}

export function UserList({
  onViewDetails,
  onResetPassword,
  onLockAccount,
  onUnlockAccount,
  onRevokeSessions,
  onRoleChange,
  onDeleteUser,
  onRestoreUser,
}: UserListProps) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortDirection: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>("");
  const [lockedFilter, setLockedFilter] = useState<string>("");
  const [showDeleted, setShowDeleted] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUsers({
        ...params,
        search: search || undefined,
        role: (roleFilter || undefined) as UserRole | undefined,
        emailVerified:
          emailVerifiedFilter === ""
            ? undefined
            : emailVerifiedFilter === "true",
        locked: lockedFilter === "" ? undefined : lockedFilter === "true",
        includeDeleted: showDeleted,
      });
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to load users", "Échec du chargement des utilisateurs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.limit,
    params.sortBy,
    params.sortDirection,
    search,
    roleFilter,
    emailVerifiedFilter,
    lockedFilter,
    showDeleted,
  ]);

  const handlePageChange = (newPage: number) => {
    setParams({ ...params, page: newPage });
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">{t("Loading users...", "Chargement des utilisateurs...")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded">
        <p className="text-destructive">{t("Error", "Erreur")}: {error}</p>
        <Button onClick={loadUsers} className="mt-2">
          {t("Retry", "Réessayer")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={t("Search by email, username, or name...", "Rechercher par e-mail, nom d'utilisateur ou nom...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
          className="px-3 py-2 border border-input bg-background text-foreground rounded-md"
        >
          <option value="">{t("All Roles", "Tous les rôles")}</option>
          <option value="CUSTOMER">{t("Customer", "Client")}</option>
          <option value="TEAM_BUYER">{t("Team Buyer", "Acheteur d'équipe")}</option>
          <option value="ADMIN">{t("Admin", "Administrateur")}</option>
        </select>
        <select
          value={emailVerifiedFilter}
          onChange={(e) => setEmailVerifiedFilter(e.target.value)}
          className="px-3 py-2 border border-input bg-background text-foreground rounded-md"
        >
          <option value="">{t("All Verification Status", "Tous les statuts de vérification")}</option>
          <option value="true">{t("Verified", "Vérifié")}</option>
          <option value="false">{t("Unverified", "Non vérifié")}</option>
        </select>
        <select
          value={lockedFilter}
          onChange={(e) => setLockedFilter(e.target.value)}
          className="px-3 py-2 border border-input bg-background text-foreground rounded-md"
        >
          <option value="">{t("All Account Status", "Tous les statuts de compte")}</option>
          <option value="true">{t("Locked", "Verrouillé")}</option>
          <option value="false">{t("Unlocked", "Déverrouillé")}</option>
        </select>
        <label className="flex items-center gap-2 px-3 py-2 border border-input rounded-md bg-card cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="w-4 h-4 text-primary focus:ring-primary border-input rounded accent-primary"
          />
          <span className="text-sm text-foreground">{t("Show deleted users", "Afficher les utilisateurs supprimés")}</span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-card border border-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Email", "E-mail")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Username", "Nom d'utilisateur")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Name", "Nom")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Role", "Rôle")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Status", "Statut")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Created", "Créé")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {users.map((user) => (
              <tr
                key={user.id}
                className={user.isDeleted ? "bg-destructive/10 opacity-75" : ""}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                  {user.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                  {user.username || user.displayUsername || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                  {user.name || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <UserStatusBadge
                    emailVerified={user.emailVerified}
                    isLocked={user.isLocked}
                    isDeleted={user.isDeleted}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm relative">
                  <UserActionsMenu
                    user={user}
                    onViewDetails={onViewDetails}
                    onResetPassword={onResetPassword}
                    onLockAccount={onLockAccount}
                    onUnlockAccount={onUnlockAccount}
                    onRevokeSessions={onRevokeSessions}
                    onRoleChange={onRoleChange}
                    onDeleteUser={onDeleteUser}
                    onRestoreUser={onRestoreUser}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-muted-foreground">
          {t("Showing", "Affichage")}{" "}
          {users.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}{" "}
          {t("to", "à")} {Math.min(pagination.page * pagination.limit, pagination.total)} {t("of", "sur")}{" "}
          {pagination.total} {t("users", "utilisateurs")}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            {t("Previous", "Précédent")}
          </Button>
          <span className="px-4 py-2 text-sm">
            {t("Page", "Page")} {pagination.page} {t("of", "sur")} {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            {t("Next", "Suivant")}
          </Button>
        </div>
      </div>
    </div>
  );
}
