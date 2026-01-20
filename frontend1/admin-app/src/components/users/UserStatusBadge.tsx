"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";

interface UserStatusBadgeProps {
  emailVerified: boolean;
  isLocked?: boolean;
  isDeleted?: boolean;
}

export function UserStatusBadge({
  emailVerified,
  isLocked,
  isDeleted,
}: UserStatusBadgeProps) {
  const { t } = useLanguage();

  if (isDeleted) {
    return (
      <Badge
        variant="destructive"
        className="bg-orange-600 hover:bg-orange-700"
      >
        {t("Deleted", "Supprimé")}
      </Badge>
    );
  }

  if (isLocked) {
    return <Badge variant="destructive">{t("Locked", "Verrouillé")}</Badge>;
  }

  if (!emailVerified) {
    return <Badge variant="secondary">{t("Unverified", "Non vérifié")}</Badge>;
  }

  return <Badge variant="default">{t("Active", "Actif")}</Badge>;
}
