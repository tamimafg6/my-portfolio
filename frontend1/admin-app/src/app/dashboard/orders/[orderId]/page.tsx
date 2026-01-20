"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Loader2, Copy, Check, Package, Trash2, Archive, ArchiveRestore, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { fetchAdminOrderById, updateOrderStatus, getProductById, getProductImageUrl, softDeleteOrder, hardDeleteOrder, restoreOrder, archiveOrder, unarchiveOrder } from "@/lib/api";
import { DeleteOrderDialog } from "@/components/orders/DeleteOrderDialog";
import { DeliveredStatusDialog } from "@/components/orders/DeliveredStatusDialog";
import { CancelOrderDialog } from "@/components/orders/CancelOrderDialog";
import type { AdminOrder, OrderStatus, OrderItem } from "@/types/order";
import type { Product } from "@/lib/api";
import Image from "next/image";

// Personalization interface for type safety
interface Personalization {
  playerName?: string | number;
  playerNumber?: string | number;
}

// Order Item Card Component with image error handling
function OrderItemCard({
  item,
  productName,
  variant,
  imageUrl,
  order,
  formatPrice,
  t,
}: {
  item: OrderItem;
  productName: string;
  variant: Product["variants"][0] | undefined;
  imageUrl: string | undefined;
  order: AdminOrder;
  formatPrice: (amount: number, currency?: string) => string;
  t: (en: string, fr: string) => string;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex gap-4 items-start">
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        {imageUrl && !imageError ? (
          <Image
            src={getProductImageUrl(imageUrl)}
            alt={productName}
            fill
            className="object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package className="h-8 w-8" />
          </div>
        )}
      </div>
      
      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base mb-1">
          {productName}
        </p>
        {variant && (
          <p className="text-sm text-muted-foreground mb-1">
            {variant.color} - {t("Size", "Taille")} {variant.size}
          </p>
        )}
        {(() => {
          const personalization = item.personalization as Personalization | undefined;
          if (personalization && (personalization.playerName || personalization.playerNumber)) {
            const name = personalization.playerName;
            const num = personalization.playerNumber;
            return (
              <p className="text-sm text-muted-foreground mb-2">
                {t("Personalization", "Personnalisation")}: {`${name ? String(name) : ""}${num ? ` #${String(num)}` : ""}`.trim()}
              </p>
            );
          }
          return null;
        })()}
        <p className="text-xs text-muted-foreground">
          {t("ID", "ID")}: {item.productId}
        </p>
      </div>
      
      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-lg">
          {formatPrice(
            item.unitPrice * item.quantity,
            order.currency
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.unitPrice, order.currency)} x{item.quantity}
        </p>
      </div>
    </div>
  );
}


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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const orderId = Number(params.orderId);

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deliveredDialogOpen, setDeliveredDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<OrderStatus | null>(null);

  useEffect(() => {
    // Validate orderId before any operations
    if (!params.orderId || isNaN(orderId) || orderId <= 0) {
      setLoading(false);
      setError(t("Invalid order ID", "ID de commande invalide"));
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData = await fetchAdminOrderById(orderId);
        setOrder(orderData);

        // Fetch product details for all unique product IDs
        const uniqueProductIds = [
          ...new Set(orderData.items.map((item) => item.productId)),
        ];
        const productPromises = uniqueProductIds.map((productId) =>
          getProductById(productId).catch((err) => {
            console.error(`Failed to fetch product ${productId}:`, err);
            return null;
          })
        );
        const productResults = await Promise.all(productPromises);
        const productsMap = new Map<number, Product>();
        productResults.forEach((product) => {
          if (product) {
            productsMap.set(product.id, product);
          }
        });
        setProducts(productsMap);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, params.orderId, t]);

  // Get valid next statuses based on current status
  const getValidNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case "PENDING":
        return ["CONFIRMED", "CANCELLED"];
      case "CONFIRMED":
        return ["PROCESSING", "CANCELLED"];
      case "PROCESSING":
        return ["SHIPPED", "CANCELLED"];
      case "SHIPPED":
        return ["DELIVERED"];
      case "DELIVERED":
      case "CANCELLED":
        return []; // Cannot change from these statuses
      default:
        return [];
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || newStatus === order.orderStatus) return;

    // Validate transition on frontend
    const validNextStatuses = getValidNextStatuses(order.orderStatus);
    if (!validNextStatuses.includes(newStatus)) {
      alert(
        t(
          `Cannot change status from ${order.orderStatus} to ${newStatus}. Valid next statuses: ${validNextStatuses.join(", ")}`,
          `Impossible de changer le statut de ${order.orderStatus} à ${newStatus}. Statuts valides suivants: ${validNextStatuses.join(", ")}`
        )
      );
      return;
    }

    // Show confirmation dialog for DELIVERED or CANCELLED status (irreversible)
    if (newStatus === "DELIVERED") {
      setPendingStatusUpdate(newStatus);
      setDeliveredDialogOpen(true);
      return;
    }

    if (newStatus === "CANCELLED") {
      setPendingStatusUpdate(newStatus);
      setCancelDialogOpen(true);
      return;
    }

    // For other statuses, update directly
    await performStatusUpdate(newStatus);
  };

  const performStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      setUpdatingStatus(true);
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Failed to update order status:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("Failed to update status", "Échec de la mise à jour du statut");
      alert(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmDelivered = async () => {
    if (pendingStatusUpdate) {
      await performStatusUpdate(pendingStatusUpdate);
      setDeliveredDialogOpen(false);
      setPendingStatusUpdate(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (pendingStatusUpdate) {
      await performStatusUpdate(pendingStatusUpdate);
      setCancelDialogOpen(false);
      setPendingStatusUpdate(null);
    }
  };

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (orderId: number, isPermanent: boolean) => {
    if (!order) return;

    try {
      if (isPermanent) {
        const orderNumber = order.orderNumber;
        const confirmMessage = t(
          `WARNING: This will PERMANENTLY delete order ${orderNumber}.\n\nThis action CANNOT be undone. All order data will be permanently removed.\n\nType "${orderNumber}" to confirm:`,
          `ATTENTION : Cela supprimera DÉFINITIVEMENT la commande ${orderNumber}.\n\nCette action NE PEUT PAS être annulée. Toutes les données de la commande seront définitivement supprimées.\n\nTapez "${orderNumber}" pour confirmer :`
        );
        const userInput = prompt(confirmMessage);

        if (userInput !== orderNumber) {
          alert(t("Deletion cancelled. Order number did not match.", "Suppression annulée. Le numéro de commande ne correspond pas."));
          return;
        }

        setDeleting(true);
        await hardDeleteOrder(orderId);
        alert(t("Order permanently deleted", "Commande définitivement supprimée"));
        router.push("/dashboard/orders");
      } else {
        setDeleting(true);
        await softDeleteOrder(orderId);
        alert(t("Order deleted successfully", "Commande supprimée avec succès"));
        router.push("/dashboard/orders");
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert(
        error instanceof Error
          ? error.message
          : isPermanent
          ? t("Failed to permanently delete order", "Échec de la suppression définitive de la commande")
          : t("Failed to delete order", "Échec de la suppression de la commande")
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!order) return;

    try {
      setDeleting(true);
      const updatedOrder = await restoreOrder(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Failed to restore order:", err);
      alert(err instanceof Error ? err.message : t("Failed to restore order", "Échec de la restauration de la commande"));
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!order) return;

    try {
      setArchiving(true);
      const updatedOrder = await archiveOrder(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Failed to archive order:", err);
      alert(err instanceof Error ? err.message : t("Failed to archive order", "Échec de l'archivage de la commande"));
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    if (!order) return;

    try {
      setArchiving(true);
      const updatedOrder = await unarchiveOrder(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Failed to unarchive order:", err);
      alert(err instanceof Error ? err.message : t("Failed to unarchive order", "Échec du désarchivage de la commande"));
    } finally {
      setArchiving(false);
    }
  };

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
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (error || !order) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/orders")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("Back to Orders", "Retour aux commandes")}
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive text-center">
                {error || t("Order not found", "Commande introuvable")}
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/orders")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("Back to Orders", "Retour aux commandes")}
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("Order Details", "Détails de la commande")}
          </h1>
        </div>

        {/* Main Order Details Card - Two Column Layout */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Order Summary (1/3 width) */}
              <div className="space-y-5 lg:border-r lg:border-gray-200 lg:pr-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("Order ID", "ID de commande")}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">#{order.orderNumber}</p>
                    <button
                      onClick={copyOrderNumber}
                      className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      title={copied ? t("Copied!", "Copié!") : t("Copy order number", "Copier le numéro de commande")}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("Date", "Date")}
                  </p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("Total Amount", "Montant total")}
                  </p>
                  <p className="font-semibold text-2xl">
                    {formatPrice(order.totalAmount, order.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("Order Status", "Statut de la commande")}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={statusColors[order.orderStatus] || "outline"}>
                      {translateStatus(order.orderStatus)}
                    </Badge>
                    {!updatingStatus && (() => {
                      const validNextStatuses = getValidNextStatuses(order.orderStatus);
                      const canChangeStatus = validNextStatuses.length > 0;
                      
                      // If DELIVERED is the only option, show a button instead of dropdown
                      if (canChangeStatus && validNextStatuses.length === 1 && validNextStatuses[0] === "DELIVERED") {
                        return (
                          <Button
                            onClick={() => handleStatusUpdate("DELIVERED")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            {t("Mark as Delivered", "Marquer comme livré")}
                          </Button>
                        );
                      }
                      
                      // If CANCELLED is the only option, show a button instead of dropdown
                      if (canChangeStatus && validNextStatuses.length === 1 && validNextStatuses[0] === "CANCELLED") {
                        return (
                          <Button
                            onClick={() => handleStatusUpdate("CANCELLED")}
                            variant="destructive"
                            size="sm"
                          >
                            {t("Cancel Order", "Annuler la commande")}
                          </Button>
                        );
                      }
                      
                      return canChangeStatus ? (
                        <Select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(e.target.value as OrderStatus)}
                          className="w-40 text-sm"
                        >
                          <option value={order.orderStatus} disabled>
                            {translateStatus(order.orderStatus)}
                          </option>
                          {validNextStatuses.map((status) => (
                            <option key={status} value={status}>
                              {translateStatus(status)}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {t("Status cannot be changed", "Le statut ne peut pas être modifié")}
                        </span>
                      );
                    })()}
                    {updatingStatus && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                {order.deliveryMethod && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("Delivery Method", "Méthode de livraison")}
                    </p>
                    <p className="font-medium">
                      {order.deliveryMethod === "DELIVERY"
                        ? t("Delivery", "Livraison")
                        : t("Pickup", "Ramassage")}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Order Items (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">

                {order.items.map((item, index) => {
                  const product = products.get(item.productId);
                  const variant = product?.variants.find(
                    (v) => v.variantId === item.variantId
                  );
                  const productName = product?.bilingualContent?.titleEN || 
                                     product?.bilingualContent?.titleFR || 
                                     t("Product", "Produit") + " #" + item.productId;
                  const imageUrl = product?.productImages?.primaryImageUrl;

                  return (
                    <OrderItemCard
                      key={item.id || index}
                      item={item}
                      productName={productName}
                      variant={variant}
                      imageUrl={imageUrl || undefined}
                      order={order}
                      formatPrice={formatPrice}
                      t={t}
                    />
                  );
                })}
                
                {/* Total */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">
                      {t("Total", "Total")}:
                    </p>
                    <p className="font-semibold text-xl">
                      {formatPrice(order.totalAmount, order.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer and Shipping Information - Full Width at Bottom */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="lg:border-r lg:border-gray-200 lg:pr-6">
                  <p className="font-semibold text-sm mb-3">
                    {t("Customer Information", "Informations client")}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {t("Name", "Nom")}
                      </p>
                      <p className="text-sm font-medium">
                        {order.customerName || t("Unknown", "Inconnu")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {t("Email", "Courriel")}
                      </p>
                      <p className="text-sm font-medium">{order.customerEmail || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {t("Customer ID", "ID client")}
                      </p>
                      <p className="text-sm font-medium">{order.customerId}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping/Pickup Information */}
                <div className="lg:pl-6">
                  {order.deliveryMethod === "DELIVERY" && order.shippingAddress && (
                    <>
                      <p className="font-semibold text-sm mb-3">
                        {t("Shipping Information", "Informations de livraison")}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-xs text-muted-foreground mb-1">
                            {t("Delivery Address", "Adresse de livraison")}
                          </p>
                          <p className="text-xs leading-snug">
                            {order.shippingAddress.street}
                            {order.shippingAddress.apartment && (
                              <>, {order.shippingAddress.apartment}</>
                            )}
                            <br />
                            {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                            {order.shippingAddress.postalCode}
                            <br />
                            {order.shippingAddress.country}
                          </p>
                        </div>
                        {order.billingAddress && (
                          <div>
                            <p className="font-medium text-xs text-muted-foreground mb-1">
                              {t("Billing Address", "Adresse de facturation")}
                            </p>
                            <p className="text-xs leading-snug">
                              {order.billingAddress.street}
                              {order.billingAddress.apartment && (
                                <>, {order.billingAddress.apartment}</>
                              )}
                              <br />
                              {order.billingAddress.city}, {order.billingAddress.province}{" "}
                              {order.billingAddress.postalCode}
                              <br />
                              {order.billingAddress.country}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {order.deliveryMethod === "PICKUP" && (
                    <>
                      <p className="font-semibold text-sm mb-3">
                        {t("Pickup Information", "Informations de ramassage")}
                      </p>
                      <div className="space-y-2">
                        {order.pickupDate && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {t("Pickup Date", "Date de ramassage")}
                            </p>
                            <p className="text-sm font-medium">{order.pickupDate}</p>
                          </div>
                        )}
                        {order.pickupTimeRange && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {t("Time Range", "Plage horaire")}
                            </p>
                            <p className="text-sm font-medium">{order.pickupTimeRange}</p>
                          </div>
                        )}
                        {order.pickupContactEmail && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {t("Contact Email", "Courriel de contact")}
                            </p>
                            <p className="text-sm font-medium">{order.pickupContactEmail}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              {order && order.deleted ? (
                <Button
                  variant="outline"
                  onClick={handleRestore}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  {t("Restore Order", "Restaurer la commande")}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {t("Delete Order", "Supprimer la commande")}
                </Button>
              )}
              {order && order.archived === true ? (
                <Button
                  variant="outline"
                  onClick={handleUnarchive}
                  disabled={archiving}
                >
                  {archiving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                  )}
                  {t("Unarchive Order", "Désarchiver la commande")}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleArchive}
                  disabled={archiving || !order}
                >
                  {archiving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4 mr-2" />
                  )}
                  {t("Archive Order", "Archiver la commande")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Order Dialog */}
        <DeleteOrderDialog
          order={order}
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
        />

        {/* Delivered Status Confirmation Dialog */}
        <DeliveredStatusDialog
          open={deliveredDialogOpen}
          onClose={() => {
            setDeliveredDialogOpen(false);
            setPendingStatusUpdate(null);
          }}
          onConfirm={handleConfirmDelivered}
          orderNumber={order?.orderNumber}
        />

        {/* Cancel Order Confirmation Dialog */}
        <CancelOrderDialog
          open={cancelDialogOpen}
          onClose={() => {
            setCancelDialogOpen(false);
            setPendingStatusUpdate(null);
          }}
          onConfirm={handleConfirmCancel}
          orderNumber={order?.orderNumber}
        />
      </div>
    </PageLayout>
  );
}
