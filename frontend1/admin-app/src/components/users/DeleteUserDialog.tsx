"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { useLanguage } from "@/lib/i18n";

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: string, isPermanent: boolean) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onClose,
  onConfirm,
}: DeleteUserDialogProps) {
  const { t } = useLanguage();
  const [deleteType, setDeleteType] = useState<"soft" | "permanent">("soft");

  if (!user) return null;

  const handleConfirm = () => {
    onConfirm(user.id, deleteType === "permanent");
  };

  const handleClose = () => {
    setDeleteType("soft");
    onClose();
  };

  const userName = user.name || user.email;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold">
              {t("Are you sure?", "Êtes-vous sûr ?")}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-3 text-base">
            <span className="font-semibold">{userName}</span> {t("will be deleted.", "sera supprimé.")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <label
            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              deleteType === "soft"
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-accent"
            }`}
          >
            <input
              type="radio"
              name="deleteType"
              value="soft"
              checked={deleteType === "soft"}
              onChange={() => setDeleteType("soft")}
              className="mt-1 w-4 h-4 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-medium text-foreground">{t("Soft delete", "Suppression douce")}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("You will be able to recover the user's account later if you choose this option.", "Vous pourrez récupérer le compte de l'utilisateur plus tard si vous choisissez cette option.")}
              </div>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              deleteType === "permanent"
                ? "border-destructive bg-destructive/10"
                : "border-border hover:bg-accent"
            }`}
          >
            <input
              type="radio"
              name="deleteType"
              value="permanent"
              checked={deleteType === "permanent"}
              onChange={() => setDeleteType("permanent")}
              className="mt-1 w-4 h-4 text-destructive focus:ring-destructive"
            />
            <div className="flex-1">
              <div className="font-medium text-foreground">
                {t("Permanent delete", "Suppression définitive")}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("The user will be deleted permanently if you choose this option.", "L'utilisateur sera définitivement supprimé si vous choisissez cette option.")}
              </div>
            </div>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("Cancel", "Annuler")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {t("Delete", "Supprimer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
