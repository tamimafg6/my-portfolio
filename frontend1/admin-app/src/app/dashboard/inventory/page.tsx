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
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// Mock data - NO API calls
const mockInventory = [
  {
    id: 1,
    product: "Soccer Jersey - Team A",
    variant: "Size M - Red",
    location: "Warehouse A",
    quantity: 150,
    reserved: 10,
    available: 140,
  },
  {
    id: 2,
    product: "Basketball Jersey - Team B",
    variant: "Size L - Blue",
    location: "Warehouse B",
    quantity: 89,
    reserved: 5,
    available: 84,
  },
  {
    id: 3,
    product: "Football Jersey - Team C",
    variant: "Size XL - Green",
    location: "Warehouse A",
    quantity: 0,
    reserved: 0,
    available: 0,
  },
  {
    id: 4,
    product: "Hockey Jersey - Team D",
    variant: "Size M - Black",
    location: "Warehouse C",
    quantity: 45,
    reserved: 2,
    available: 43,
  },
  {
    id: 5,
    product: "Baseball Jersey - Team E",
    variant: "Size S - White",
    location: "Warehouse B",
    quantity: 200,
    reserved: 15,
    available: 185,
  },
];

export default function InventoryPage() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Inventory", "Inventaire")}</h1>
          <p className="text-muted-foreground">
            {t("Manage stock levels and warehouse locations", "Gérer les niveaux de stock et les emplacements d'entrepôt")}
          </p>
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
                  {t("Inventory management is currently under development. This page displays mock data for preview purposes only.", "La gestion de l'inventaire est actuellement en développement. Cette page affiche des données fictives à des fins de prévisualisation uniquement.")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Inventory Items", "Articles d'inventaire")}</CardTitle>
            <CardDescription>
              {mockInventory.length} {t("inventory items across all warehouses", "articles d'inventaire dans tous les entrepôts")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Product", "Produit")}</TableHead>
                  <TableHead>{t("Variant", "Variante")}</TableHead>
                  <TableHead>{t("Location", "Emplacement")}</TableHead>
                  <TableHead>{t("Total Quantity", "Quantité totale")}</TableHead>
                  <TableHead>{t("Reserved", "Réservé")}</TableHead>
                  <TableHead>{t("Available", "Disponible")}</TableHead>
                  <TableHead className="text-right">{t("Actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product}
                    </TableCell>
                    <TableCell>{item.variant}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.reserved}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.available === 0
                            ? "destructive"
                            : item.available < 50
                            ? "secondary"
                            : "default"
                        }
                      >
                        {item.available}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>
                        {t("Adjust", "Ajuster")}
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

