"use client";

import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types/user";
import { useLanguage } from "@/lib/i18n";

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const { t } = useLanguage();

  const getRoleStyles = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-primary text-primary-foreground border-primary hover:bg-primary-hover";
      case "TEAM_BUYER":
        return "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80";
      case "CUSTOMER":
      default:
        return "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30";
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case "ADMIN":
        return t("Admin", "Administrateur");
      case "TEAM_BUYER":
        return t("Team Buyer", "Acheteur d'équipe");
      case "CUSTOMER":
      default:
        return t("Customer", "Client");
    }
  };

  return (
    <Badge variant="outline" className={getRoleStyles(role)}>
      {getRoleLabel(role)}
    </Badge>
  );
}
