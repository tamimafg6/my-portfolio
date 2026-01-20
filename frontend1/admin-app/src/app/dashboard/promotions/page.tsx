"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// Mock data - NO API calls
const mockPromotions = [
  {
    id: 1,
    name: "Summer Sale",
    code: "SUMMER2024",
    discount: "20%",
    status: "Active",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
  },
  {
    id: 2,
    name: "New Year Special",
    code: "NY2024",
    discount: "15%",
    status: "Active",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  },
  {
    id: 3,
    name: "Black Friday",
    code: "BF2023",
    discount: "30%",
    status: "Expired",
    startDate: "2023-11-24",
    endDate: "2023-11-27",
  },
  {
    id: 4,
    name: "Holiday Discount",
    code: "HOLIDAY2023",
    discount: "25%",
    status: "Expired",
    startDate: "2023-12-01",
    endDate: "2023-12-25",
  },
];

export default function PromotionsPage() {
  const { t } = useLanguage();

  const translateStatus = (status: string): string => {
    if (status === "Active") return t("Active", "Actif");
    if (status === "Expired") return t("Expired", "Expiré");
    return status;
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("Promotions", "Promotions")}</h1>
            <p className="text-muted-foreground">
              {t("Manage discounts and promotional codes", "Gérer les remises et codes promotionnels")}
            </p>
          </div>
          <Button
            disabled
            title={t("Coming soon - Promotion creation will be available in a future update", "Bientôt disponible - La création de promotions sera disponible dans une mise à jour future")}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("Create Promotion", "Créer une promotion")}
          </Button>
        </div>

        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  {t("Coming Soon", "Bientôt disponible")}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  {t("Promotion management is currently under development. This page displays mock data for preview purposes only.", "La gestion des promotions est actuellement en développement. Cette page affiche des données fictives à des fins de prévisualisation uniquement.")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Promotions", "Promotions")}</CardTitle>
            <CardDescription>
              {mockPromotions.length} {t("promotional codes", "codes promotionnels")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Name", "Nom")}</TableHead>
                  <TableHead>{t("Code", "Code")}</TableHead>
                  <TableHead>{t("Discount", "Remise")}</TableHead>
                  <TableHead>{t("Start Date", "Date de début")}</TableHead>
                  <TableHead>{t("End Date", "Date de fin")}</TableHead>
                  <TableHead>{t("Status", "Statut")}</TableHead>
                  <TableHead className="text-right">{t("Actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPromotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.name}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {promo.code}
                      </code>
                    </TableCell>
                    <TableCell>{promo.discount}</TableCell>
                    <TableCell>{promo.startDate}</TableCell>
                    <TableCell>{promo.endDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          promo.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {translateStatus(promo.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>
                        {t("Edit", "Modifier")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

