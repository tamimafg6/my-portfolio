"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductStatistics } from "@/components/ProductStatistics";
import { AreaLineChart } from "@/components/charts/AreaLineChart";
import { useLanguage } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  AlertTriangle,
  BarChart3,
  Loader2,
  Copy,
} from "lucide-react";
import { fetchAdminOrders, fetchLowStockItems, getProductImageUrl } from "@/lib/api";
import type { AdminOrder } from "@/types/order";
import type { LowStockItem } from "@/lib/api";
import Image from "next/image";

// Removed mock data - using real API calls

// Low Stock Item Component with image error handling
function LowStockItemRow({ item, t }: { item: LowStockItem; t: (en: string, fr: string) => string }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md border border-amber-500/20 bg-amber-500/5">
      {item.productImageUrl && !imageError ? (
        <div className="flex-shrink-0 w-12 h-12 relative rounded-md overflow-hidden bg-muted">
          <Image
            src={getProductImageUrl(item.productImageUrl)}
            alt={item.productName || "Product"}
            fill
            className="object-cover"
            sizes="48px"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-12 h-12 rounded-md bg-muted flex items-center justify-center">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {item.productName || t("Unknown Product", "Produit inconnu")}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {item.variantSize && item.variantColor
            ? `${item.variantSize} - ${item.variantColor}`
            : item.variantId.substring(0, 8) + "..."}
        </p>
      </div>
      <div className="text-right ml-3 flex-shrink-0">
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          {item.availableQuantity} {t("left", "restants")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("Threshold", "Seuil")}: {item.reorderPoint}
        </p>
      </div>
    </div>
  );
}

const mockMostBought = [
  { name: "Soccer Jersey - Team A", sales: 45, revenue: 2249.55 },
  { name: "Basketball Jersey - Team B", sales: 32, revenue: 1759.68 },
  { name: "Hockey Jersey - Team D", sales: 28, revenue: 1819.72 },
  { name: "Football Jersey - Team C", sales: 22, revenue: 1319.78 },
  { name: "Baseball Jersey - Team E", sales: 18, revenue: 809.82 },
];

// Removed mock data - using real API calls

// Mock sales data for chart (last 7 days)
const mockSalesData = [
  { day: "Mon", value: 1200 },
  { day: "Tue", value: 1900 },
  { day: "Wed", value: 1500 },
  { day: "Thu", value: 2100 },
  { day: "Fri", value: 2800 },
  { day: "Sat", value: 3200 },
  { day: "Sun", value: 1850 },
];

// Mock data for area line chart (Revenue vs Sales)
const mockRevenueSalesData = [
  { month: "Sep", revenue: 20, sales: 35 },
  { month: "Oct", revenue: 25, sales: 40 },
  { month: "Nov", revenue: 30, sales: 45 },
  { month: "Dec", revenue: 35, sales: 50 },
  { month: "Jan", revenue: 28, sales: 42 },
  { month: "Feb", revenue: 32, sales: 48 },
  { month: "Mar", revenue: 40, sales: 65 },
  { month: "Apr", revenue: 38, sales: 60 },
  { month: "May", revenue: 42, sales: 68 },
  { month: "Jun", revenue: 45, sales: 70 },
  { month: "Jul", revenue: 43, sales: 67 },
  { month: "Aug", revenue: 45, sales: 72 },
];

// Mock data for stacked bar chart (Profit this week)
const _mockWeeklyProfitData = [
  { day: "M", sales: 35, revenue: 25 },
  { day: "T", sales: 45, revenue: 30 },
  { day: "W", sales: 40, revenue: 28 },
  { day: "T", sales: 50, revenue: 35 },
  { day: "F", sales: 30, revenue: 20 },
  { day: "S", sales: 55, revenue: 40 },
  { day: "S", sales: 48, revenue: 32 },
];

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

// Status translation helper
function translateStatus(status: string, t: (en: string, fr: string) => string): string {
  const statusMap: Record<string, { en: string; fr: string }> = {
    PENDING: { en: "Pending", fr: "En attente" },
    CONFIRMED: { en: "Confirmed", fr: "Confirmé" },
    PROCESSING: { en: "Processing", fr: "En traitement" },
    SHIPPED: { en: "Shipped", fr: "Expédié" },
    DELIVERED: { en: "Delivered", fr: "Livré" },
    CANCELLED: { en: "Cancelled", fr: "Annulé" },
  };
  const translation = statusMap[status];
  return translation ? t(translation.en, translation.fr) : status;
}

// Simple Bar Chart Component
function SimpleBarChart({ data }: { data: typeof mockSalesData }) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="h-48 flex items-end justify-between gap-2">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="relative w-full flex items-end justify-center"
              style={{ height: "160px" }}
            >
              <div
                className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                style={{ height: `${height}%` }}
              />
              <div className="absolute -bottom-5 text-xs text-muted-foreground">
                ${(item.value / 1000).toFixed(1)}k
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-6">{item.day}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);
  const [errorStock, setErrorStock] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch recent orders (last 5)
      try {
        setLoadingOrders(true);
        const ordersData = await fetchAdminOrders({ size: 5, page: 0 });
        setRecentOrders(ordersData.content);
        setErrorOrders(null);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setErrorOrders(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoadingOrders(false);
      }

      // Fetch low stock items
      try {
        setLoadingStock(true);
        const stockData = await fetchLowStockItems();
        setLowStockItems(stockData);
        setErrorStock(null);
      } catch (err) {
        console.error("Failed to fetch low stock items:", err);
        setErrorStock(err instanceof Error ? err.message : "Failed to load stock data");
      } finally {
        setLoadingStock(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Dashboard", "Tableau de bord")}</h1>
          <p className="text-muted-foreground">
            {t("Overview of your admin console", "Aperçu de votre console d'administration")}
          </p>
        </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="min-h-[140px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base font-medium">
                    {t("Total Revenue", "Revenu total")}
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$12,450.00</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("+20.1% from last month", "+20,1% par rapport au mois dernier")}
                  </p>
                </CardContent>
              </Card>
          <Card className="min-h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium">
                {t("Total Orders", "Commandes totales")}
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">234</div>
              <p className="text-sm text-muted-foreground mt-2">
                {t("+12.5% from last month", "+12,5% par rapport au mois dernier")}
              </p>
            </CardContent>
          </Card>
          <Card className="min-h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium">
                {t("Active Products", "Produits actifs")}
              </CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">17</div>
              <p className="text-sm text-muted-foreground mt-2">{t("3 customizable", "3 personnalisables")}</p>
            </CardContent>
          </Card>
          <Card className="min-h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium">
                {t("Total Customers", "Clients totaux")}
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,234</div>
              <p className="text-sm text-muted-foreground mt-2">
                {t("+8.2% from last month", "+8,2% par rapport au mois dernier")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Sales Overview Chart */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>{t("Revenue & Sales Overview", "Aperçu des revenus et ventes")}</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-2">
            <AreaLineChart data={mockRevenueSalesData} />
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Statistics */}
          <div className="lg:col-span-1">
            <ProductStatistics />
          </div>

          {/* Middle Column - Recent Orders */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{t("Recent Orders", "Commandes récentes")}</CardTitle>
                    <CardDescription className="text-xs">
                      {t("Latest 5 orders", "5 dernières commandes")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : errorOrders ? (
                  <p className="text-xs text-destructive text-center py-4">
                    {errorOrders}
                  </p>
                ) : recentOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t("No orders found", "Aucune commande trouvée")}
                  </p>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium font-mono truncate">
                            {order.orderNumber.length > 12
                              ? `${order.orderNumber.substring(0, Math.floor(order.orderNumber.length / 2))}...`
                              : order.orderNumber}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.orderNumber);
                            }}
                            className="inline-flex items-center justify-center p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0"
                            title={t("Copy", "Copier")}
                          >
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.customerName || order.customerEmail || t("Unknown", "Inconnu")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <p className="text-sm font-semibold">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <Badge
                          variant={statusColors[order.orderStatus] || "outline"}
                          className="text-xs"
                        >
                          {translateStatus(order.orderStatus, t)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Most Bought Items */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{t("Most Bought Items", "Articles les plus achetés")}</CardTitle>
                    <CardDescription className="text-xs">
                      {t("Top 5 products by sales", "Top 5 produits par ventes")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockMostBought.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.sales} {t("sales", "ventes")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-semibold">
                        ${item.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border mt-2">
                  {t("Sales analytics coming soon", "Analyses des ventes bientôt disponibles")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row - Low Stock Alerts & Sales Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{t("Low Stock Alerts", "Alertes de stock faible")}</CardTitle>
                  <CardDescription className="text-xs">
                    {t("Items below threshold", "Articles en dessous du seuil")}
                  </CardDescription>
                </div>
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingStock ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : errorStock ? (
                <p className="text-xs text-destructive text-center py-4">
                  {errorStock}
                </p>
              ) : lowStockItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {t("No low stock items", "Aucun article en stock faible")}
                </p>
              ) : (
                lowStockItems.slice(0, 5).map((item) => (
                  <LowStockItemRow key={item.id} item={item} t={t} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Sales Chart */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{t("Sales Overview", "Aperçu des ventes")}</CardTitle>
                  <CardDescription className="text-xs">
                    {t("Last 7 days revenue", "Revenus des 7 derniers jours")}
                  </CardDescription>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={mockSalesData} />
              <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border mt-4">
                {t("Revenue trends and analytics coming soon", "Tendances et analyses des revenus bientôt disponibles")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
