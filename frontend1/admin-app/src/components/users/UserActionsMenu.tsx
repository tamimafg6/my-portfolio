"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { useLanguage } from "@/lib/i18n";

interface UserActionsMenuProps {
  user: User;
  onViewDetails: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onLockAccount: (userId: string) => void;
  onUnlockAccount: (userId: string) => void;
  onRevokeSessions: (userId: string) => void;
  onRoleChange: (userId: string, role: string) => void;
  onDeleteUser: (user: User) => void;
  onRestoreUser: (userId: string) => void;
}

export function UserActionsMenu({
  user,
  onViewDetails,
  onResetPassword,
  onLockAccount,
  onUnlockAccount,
  onRevokeSessions,
  onRoleChange: _onRoleChange,
  onDeleteUser,
  onRestoreUser,
}: UserActionsMenuProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [_showAbove, setShowAbove] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        const menuHeight = 250; // Approximate menu height
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const minSpaceRequired = menuHeight + 20;

        // Calculate if we should show above
        const shouldShowAbove =
          spaceBelow < minSpaceRequired && spaceAbove > spaceBelow + 100;

        setShowAbove(shouldShowAbove);

        // Calculate position
        const left = rect.right - 192; // 192px = w-48 (12rem)
        const top = shouldShowAbove
          ? rect.top - menuHeight - 8 // 8px = mb-2
          : rect.bottom + 8; // 8px = mt-2

        setPosition({ top, left });
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed w-48 rounded-md shadow-lg bg-popover border border-border z-[9999]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="py-1">
        <button
          className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent rounded-t-md"
          onClick={() => {
            onViewDetails(user);
            setIsOpen(false);
          }}
        >
          {t("View Details", "Voir les détails")}
        </button>
        <button
          className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
          onClick={() => {
            onResetPassword(user.id);
            setIsOpen(false);
          }}
        >
          {t("Reset Password", "Réinitialiser le mot de passe")}
        </button>
        {user.isLocked ? (
          <button
            className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
            onClick={() => {
              onUnlockAccount(user.id);
              setIsOpen(false);
            }}
          >
            {t("Unlock Account", "Déverrouiller le compte")}
          </button>
        ) : (
          <button
            className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (
                confirm(
                  t(
                    `Lock account for ${user.email}? This will prevent them from logging in.`,
                    `Verrouiller le compte pour ${user.email} ? Cela les empêchera de se connecter.`
                  )
                )
              ) {
                onLockAccount(user.id);
                setIsOpen(false);
              }
            }}
          >
            {t("Lock Account", "Verrouiller le compte")}
          </button>
        )}
        <button
          className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
          onClick={() => {
            onRevokeSessions(user.id);
            setIsOpen(false);
          }}
        >
          {t("Revoke Sessions", "Révoquer les sessions")}
        </button>
        {user.isDeleted ? (
          <button
            className="block w-full text-left px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-500/10 rounded-b-md"
            onClick={() => {
              onRestoreUser(user.id);
              setIsOpen(false);
            }}
          >
            {t("Restore Account", "Restaurer le compte")}
          </button>
        ) : (
          <>
            <div className="border-t border-border my-1" />
            <button
              className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-b-md"
              onClick={() => {
                onDeleteUser(user);
                setIsOpen(false);
              }}
            >
              {t("Delete Account", "Supprimer le compte")}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {t("Actions", "Actions")}
      </Button>
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(menuContent, document.body)}
    </div>
  );
}
