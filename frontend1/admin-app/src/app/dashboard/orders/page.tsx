"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Select } from "@/components/ui/select";
import { Search } from "@/components/ui/search";
import { Loader2, Copy } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { fetchAdminOrders, type Page } from "@/lib/api";
import type { AdminOrder, OrderStatus } from "@/types/order";

// Removed mock data - using real API calls

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

export default function OrdersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);
  const [includeArchived, setIncludeArchived] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const ordersData: Page<AdminOrder> = await fetchAdminOrders({
          page,
          size: 20,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          includeDeleted: includeDeleted ? true : undefined,
          includeArchived: includeArchived ? true : undefined,
        });
        setOrders(ordersData.content);
        setTotalPages(ordersData.totalPages);
        setTotalElements(ordersData.totalElements);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, statusFilter, includeDeleted, includeArchived]);

  // Filter orders by search query (client-side filtering)
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      (order.customerName && order.customerName.toLowerCase().includes(query)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(query))
    );
  });

  const translateStatus = (status: string): string => {
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
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatPrice = (amount: number, currency: string = "CAD"): string => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Orders", "Commandes")}</h1>
          <p className="text-muted-foreground">
            {t("View and manage customer orders", "Voir et gérer les commandes clients")}
          </p>
        </div>


        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("Orders", "Commandes")}</CardTitle>
                <CardDescription>
                  {totalElements} {t("orders total", "commandes au total")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Search
                  placeholder={t("Search orders...", "Rechercher des commandes...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as OrderStatus | "ALL");
                    setPage(0); // Reset to first page when filter changes
                  }}
                  className="w-48"
                >
                  <option value="ALL">{t("All Statuses", "Tous les statuts")}</option>
                  <option value="PENDING">{t("Pending", "En attente")}</option>
                  <option value="CONFIRMED">{t("Confirmed", "Confirmé")}</option>
                  <option value="PROCESSING">{t("Processing", "En traitement")}</option>
                  <option value="SHIPPED">{t("Shipped", "Expédié")}</option>
                  <option value="DELIVERED">{t("Delivered", "Livré")}</option>
                  <option value="CANCELLED">{t("Cancelled", "Annulé")}</option>
                </Select>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDeleted}
                      onChange={(e) => {
                        setIncludeDeleted(e.target.checked);
                        setIncludeArchived(false); // Can't show both at once
                        setPage(0);
                      }}
                      className="rounded"
                    />
                    <span>{t("Show Deleted", "Afficher supprimés")}</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeArchived}
                      onChange={(e) => {
                        setIncludeArchived(e.target.checked);
                        setIncludeDeleted(false); // Can't show both at once
                        setPage(0);
                      }}
                      className="rounded"
                    />
                    <span>{t("Show Archived", "Afficher archivés")}</span>
                  </label>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? t("No orders match your search", "Aucune commande ne correspond à votre recherche")
                    : t("No orders found", "Aucune commande trouvée")}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("Order Number", "Numéro de commande")}</TableHead>
                      <TableHead>{t("Customer", "Client")}</TableHead>
                      <TableHead>{t("Date", "Date")}</TableHead>
                      <TableHead>{t("Total", "Total")}</TableHead>
                      <TableHead>{t("Status", "Statut")}</TableHead>
                      <TableHead className="text-right">{t("Actions", "Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium font-mono text-sm">
                              {order.orderNumber.length > 12
                                ? `${order.orderNumber.substring(0, Math.floor(order.orderNumber.length / 2))}...`
                                : order.orderNumber}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.orderNumber);
                              }}
                              className="inline-flex items-center justify-center p-1 rounded-md hover:bg-muted transition-colors"
                              title={t("Copy", "Copier")}
                            >
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.customerName || order.customerEmail || t("Unknown", "Inconnu")}
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{formatPrice(order.totalAmount, order.currency)}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[order.orderStatus] || "outline"}>
                            {translateStatus(order.orderStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                          >
                            {t("View", "Voir")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {t("Page", "Page")} {page + 1} {t("of", "sur")} {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        {t("Previous", "Précédent")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                      >
                        {t("Next", "Suivant")}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

