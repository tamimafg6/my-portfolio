"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  fetchProducts,
  getProductImageUrl,
  updateProductStatus,
} from "@/lib/api";

export default function ReviewProductsPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch draft products
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { status: "DRAFT" }],
    queryFn: () => fetchProducts({ page: 0, size: 100, status: "DRAFT" }),
  });

  const products = data?.content || [];

  // Mutation to publish a product
  const publishMutation = useMutation({
    mutationFn: (productId: number) => updateProductStatus(productId, "ACTIVE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Mutation to reject a product
  const rejectMutation = useMutation({
    mutationFn: (productId: number) =>
      updateProductStatus(productId, "DISCONTINUED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handlePublish = (productId: number) => {
    publishMutation.mutate(productId);
  };

  const handleReject = (productId: number) => {
    rejectMutation.mutate(productId);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
              {t("Review Products", "Réviser les produits")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "Review and publish draft products to the catalog",
                "Révisez et publiez les produits brouillons dans le catalogue"
              )}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
          >
            {t("Back to Products", "Retour aux produits")}
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {isError ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-lg font-semibold">
                  {t(
                    "Failed to load products",
                    "Échec du chargement des produits"
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold">
                  {t("No products to review", "Aucun produit à réviser")}
                </p>
                <p className="text-muted-foreground mt-2">
                  {t(
                    "All products have been reviewed",
                    "Tous les produits ont été révisés"
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {t("Draft Products", "Produits brouillons")}
              </CardTitle>
              <CardDescription>
                {t(
                  `${products.length} product(s) awaiting review`,
                  `${products.length} produit(s) en attente de révision`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Image", "Image")}</TableHead>
                    <TableHead>{t("Product", "Produit")}</TableHead>
                    <TableHead>{t("Sport", "Sport")}</TableHead>
                    <TableHead>{t("Team", "Équipe")}</TableHead>
                    <TableHead>{t("Variants", "Variantes")}</TableHead>
                    <TableHead className="text-right">
                      {t("Actions", "Actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.productImages?.primaryImageUrl ? (
                          <div className="relative w-16 h-16 bg-gray-50 rounded-md overflow-hidden">
                            <Image
                              src={getProductImageUrl(
                                product.productImages.primaryImageUrl
                              )}
                              alt={product.bilingualContent.titleEN}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                            {t("No image", "Pas d'image")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {language === "en"
                              ? product.bilingualContent.titleEN
                              : product.bilingualContent.titleFR}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {product.sku}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.sport}</Badge>
                      </TableCell>
                      <TableCell>{product.team}</TableCell>
                      <TableCell>
                        {product.variants?.length || 0}{" "}
                        {t("variant(s)", "variante(s)")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handlePublish(product.id)}
                            disabled={publishMutation.isPending}
                          >
                            {publishMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t("Publish", "Publier")
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(product.id)}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t("Reject", "Rejeter")
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
