"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { UserList } from "@/components/users/UserList";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import type { User, UserRole } from "@/types/user";
import { useLanguage } from "@/lib/i18n";
import {
  resetUserPassword,
  unlockUserAccount,
  lockUserAccount,
  revokeUserSessions,
  updateUserRole,
  deleteUser,
  permanentlyDeleteUser,
  restoreUser,
} from "@/lib/api/users";

export default function UsersPage() {
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await resetUserPassword(userId);
      alert(t("Password reset email sent successfully", "E-mail de réinitialisation du mot de passe envoyé avec succès"));
    } catch (error) {
      alert(
        error instanceof Error ? error.message : t("Failed to reset password", "Échec de la réinitialisation du mot de passe")
      );
    }
  };

  const handleLockAccount = async (userId: string) => {
    try {
      await lockUserAccount(userId);
      setRefreshKey((k) => k + 1);
      alert(t("Account locked successfully", "Compte verrouillé avec succès"));
    } catch (error) {
      alert(error instanceof Error ? error.message : t("Failed to lock account", "Échec du verrouillage du compte"));
    }
  };

  const handleUnlockAccount = async (userId: string) => {
    try {
      await unlockUserAccount(userId);
      setRefreshKey((k) => k + 1);
      alert(t("Account unlocked successfully", "Compte déverrouillé avec succès"));
    } catch (error) {
      alert(
        error instanceof Error ? error.message : t("Failed to unlock account", "Échec du déverrouillage du compte")
      );
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    try {
      await revokeUserSessions(userId);
      setRefreshKey((k) => k + 1);
      alert(t("All sessions revoked successfully", "Toutes les sessions révoquées avec succès"));
    } catch (error) {
      alert(
        error instanceof Error ? error.message : t("Failed to revoke sessions", "Échec de la révocation des sessions")
      );
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role as UserRole);
      setRefreshKey((k) => k + 1);
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: role as UserRole });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : t("Failed to update role", "Échec de la mise à jour du rôle"));
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (userId: string, isPermanent: boolean) => {
    if (!userToDelete) return;

    try {
      if (isPermanent) {
        const userEmail = userToDelete.email;
        const confirmMessage = t(
          `WARNING: This will PERMANENTLY delete the account for ${userEmail}.\n\nThis action CANNOT be undone. All user data will be permanently removed.\n\nType "${userEmail}" to confirm:`,
          `ATTENTION : Cela supprimera DÉFINITIVEMENT le compte pour ${userEmail}.\n\nCette action NE PEUT PAS être annulée. Toutes les données utilisateur seront définitivement supprimées.\n\nTapez "${userEmail}" pour confirmer :`
        );
        const userInput = prompt(confirmMessage);

        if (userInput !== userEmail) {
          alert(t("Deletion cancelled. Email did not match.", "Suppression annulée. L'e-mail ne correspond pas."));
          return;
        }

        await permanentlyDeleteUser(userId);
        alert(t("Account permanently deleted", "Compte définitivement supprimé"));
      } else {
        await deleteUser(userId);
        alert(t("Account deleted successfully", "Compte supprimé avec succès"));
      }
      setRefreshKey((k) => k + 1);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : isPermanent
          ? t("Failed to permanently delete account", "Échec de la suppression définitive du compte")
          : t("Failed to delete account", "Échec de la suppression du compte")
      );
    }
  };

  const handleRestoreUser = async (userId: string) => {
    if (
      !confirm(t("Restore this account? The user will be able to log in again.", "Restaurer ce compte ? L'utilisateur pourra se connecter à nouveau."))
    ) {
      return;
    }
    try {
      await restoreUser(userId);
      setRefreshKey((k) => k + 1);
      alert(t("Account restored successfully", "Compte restauré avec succès"));
    } catch (error) {
      alert(
        error instanceof Error ? error.message : t("Failed to restore account", "Échec de la restauration du compte")
      );
    }
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("User Management", "Gestion des utilisateurs")}</h1>
          <p className="text-muted-foreground">
            {t("Manage users, roles, and access permissions", "Gérer les utilisateurs, les rôles et les permissions d'accès")}
          </p>
        </div>

        <UserList
          key={refreshKey}
          onViewDetails={handleViewDetails}
          onResetPassword={handleResetPassword}
          onLockAccount={handleLockAccount}
          onUnlockAccount={handleUnlockAccount}
          onRevokeSessions={handleRevokeSessions}
          onRoleChange={handleRoleChange}
          onDeleteUser={handleDeleteUser}
          onRestoreUser={handleRestoreUser}
        />

        <UserDetailsDialog
          user={selectedUser}
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedUser(null);
          }}
          onRefresh={handleRefresh}
        />

        <DeleteUserDialog
          user={userToDelete}
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </PageLayout>
  );
}
