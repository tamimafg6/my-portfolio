"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "@/components/ui/search";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  fetchProducts,
  getProductImageUrl,
  deleteProduct,
  Product,
} from "@/lib/api";

export default function ProductsPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchProducts({ page: 0, size: 100 });
        setProducts(response.content);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(
          err instanceof Error
            ? err.message
            : t("Failed to load products", "Échec du chargement des produits")
        );
        // Keep empty array on error - will show empty state
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [t]);

  const translateStatus = (status: string): string => {
    if (status === "ACTIVE") return t("Active", "Actif");
    if (status === "DISCONTINUED") return t("Discontinued", "Discontinué");
    if (status === "PRE_ORDER") return t("Pre-Order", "Précommande");
    return status;
  };

  const getProductName = (product: Product): string => {
    return language === "en"
      ? product.bilingualContent.titleEN
      : product.bilingualContent.titleFR;
  };

  const getProductPrice = (product: Product): number => {
    if (product.minPrice) return product.minPrice;
    if (product.variants && product.variants.length > 0) {
      return Math.min(...product.variants.map((v) => v.basePrice.amount));
    }
    return 0;
  };

  const getProductCurrency = (product: Product): string => {
    if (product.currency) return product.currency;
    if (product.variants && product.variants.length > 0) {
      return product.variants[0].basePrice.currency;
    }
    return "CAD";
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await deleteProduct(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      // Reload products to update the list
      const response = await fetchProducts({ page: 0, size: 100 });
      setProducts(response.content);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("Failed to delete product", "Échec de la suppression du produit")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const productName = getProductName(product).toLowerCase();
    const sku = product.sku.toLowerCase();
    
    return productName.includes(query) || sku.includes(query);
  });

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("Products", "Produits")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "Manage your product catalog",
                "Gérez votre catalogue de produits"
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/products/review")}
            >
              {t("Review Drafts", "Réviser les brouillons")}
            </Button>
            <Button onClick={() => router.push("/dashboard/products/new")}>
              <Plus className="h-4 w-4 mr-2" />
              {t("Create Product", "Créer un produit")}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    {t("Error", "Erreur")}
                  </p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("Products", "Produits")}</CardTitle>
                <CardDescription>
                  {filteredProducts.length}{" "}
                  {searchQuery.trim() 
                    ? t("products found", "produits trouvés")
                    : t("products in catalog", "produits dans le catalogue")}
                </CardDescription>
              </div>
              <div className="w-64">
                <Search
                  placeholder={t(
                    "Search products...",
                    "Rechercher des produits..."
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>
                  {searchQuery.trim()
                    ? t(
                        "No products match your search",
                        "Aucun produit ne correspond à votre recherche"
                      )
                    : t("No products found", "Aucun produit trouvé")}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">
                      {t("Image", "Image")}
                    </TableHead>
                    <TableHead>{t("Name", "Nom")}</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>{t("Price", "Prix")}</TableHead>
                    <TableHead>{t("Status", "Statut")}</TableHead>
                    <TableHead className="text-right">
                      {t("Actions", "Actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.productImages?.primaryImageUrl ? (
                          <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                            <Image
                              src={getProductImageUrl(
                                product.productImages.primaryImageUrl
                              )}
                              alt={getProductName(product)}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getProductName(product)}
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        {getProductCurrency(product)}{" "}
                        {getProductPrice(product).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.productStatus === "ACTIVE"
                              ? "default"
                              : product.productStatus === "DISCONTINUED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {translateStatus(product.productStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/products/${product.id}/edit`)
                            }
                          >
                            {t("View", "Voir")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("Delete Product", "Supprimer le produit")}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "Are you sure you want to delete this product? This action cannot be undone. The product will be removed from the catalog.",
                  "Êtes-vous sûr de vouloir supprimer ce produit? Cette action ne peut pas être annulée. Le produit sera retiré du catalogue."
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setProductToDelete(null);
                }}
                disabled={isDeleting}
              >
                {t("Cancel", "Annuler")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Deleting...", "Suppression...")}
                  </>
                ) : (
                  t("Delete", "Supprimer")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
