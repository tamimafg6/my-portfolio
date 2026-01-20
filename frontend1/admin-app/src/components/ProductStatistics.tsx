"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProductStatistics } from "@/lib/api";
import {
  Package,
  Sparkles,
  Layers,
  DollarSign,
  Trophy,
  Shirt,
  BarChart3,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n";

export function ProductStatistics() {
  const { t } = useLanguage();
  const [showSports, setShowSports] = useState(false);
  const [showTypes, setShowTypes] = useState(false);
  const {
    data: statistics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["productStatistics"],
    queryFn: fetchProductStatistics,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("Product Statistics", "Statistiques des produits")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("Product Statistics", "Statistiques des produits")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("Failed to load statistics", "Échec du chargement des statistiques")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/50">
        <div>
          <CardTitle className="text-lg font-semibold">{t("Product Statistics", "Statistiques des produits")}</CardTitle>
          <CardDescription className="text-xs mt-1">
            {t("Inventory overview", "Aperçu de l'inventaire")}
          </CardDescription>
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Main Statistics List */}
        <div className="space-y-2">
          <div className="group flex items-center justify-between py-3 px-3 rounded-lg hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("Total Products", "Produits totaux")}</p>
                <p className="text-xs text-muted-foreground">{t("Active items in catalog", "Articles actifs dans le catalogue")}</p>
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">{statistics.totalProducts}</span>
          </div>

          <div className="group flex items-center justify-between py-3 px-3 rounded-lg hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("Customizable", "Personnalisables")}</p>
                <p className="text-xs text-muted-foreground">{t("Products with customization", "Produits avec personnalisation")}</p>
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">{statistics.customizableCount}</span>
          </div>

          <div className="group flex items-center justify-between py-3 px-3 rounded-lg hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("Total Variants", "Variantes totales")}</p>
                <p className="text-xs text-muted-foreground">{t("All product variations", "Toutes les variations de produits")}</p>
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">{statistics.totalVariants}</span>
          </div>

          <div className="group flex items-center justify-between py-3 px-3 rounded-lg hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("Price Range", "Gamme de prix")}</p>
                <p className="text-xs text-muted-foreground">{t("Minimum to maximum", "Du minimum au maximum")}</p>
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">
              {statistics.priceRange.min != null && statistics.priceRange.max != null
                ? `$${statistics.priceRange.min.toFixed(0)}-$${statistics.priceRange.max.toFixed(0)}`
                : t("N/A", "N/D")}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 my-4" />

        {/* Categories Section */}
        <div className="space-y-3 pt-2">
          {/* By Sport */}
          <div>
            <button
              onClick={() => setShowSports(!showSports)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t("By Sport", "Par sport")}</span>
                <span className="text-xs text-muted-foreground">
                  ({Object.keys(statistics.productsBySport).length})
                </span>
              </div>
              {showSports ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {showSports && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(statistics.productsBySport)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([sport, count]) => (
                    <div
                      key={sport}
                      className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 text-sm"
                    >
                      <span className="text-foreground">{sport}</span>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* By Type */}
          <div>
            <button
              onClick={() => setShowTypes(!showTypes)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shirt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t("By Type", "Par type")}</span>
                <span className="text-xs text-muted-foreground">
                  ({Object.keys(statistics.productsByType).length})
                </span>
              </div>
              {showTypes ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {showTypes && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(statistics.productsByType)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 text-sm"
                    >
                      <span className="text-foreground">{type}</span>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
