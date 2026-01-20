"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, X, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  getProductById,
  updateProduct,
  uploadProductImage,
  getProductImageUrl,
  updateProductVariant,
  getStockByVariantId,
  adjustStock,
  updateStockItem,
  UpdateProductRequest,
  UpdateProductVariantRequest,
  StockAdjustmentRequest,
  StockItem,
} from "@/lib/api";

// Sport options
const SPORTS = [
  "SOCCER",
  "HOCKEY",
  "BASKETBALL",
  "FOOTBALL",
  "BASEBALL",
  "FORMULA1",
];

// Product Type options
const PRODUCT_TYPES = [
  "DEFAULT",
  "HOME",
  "AWAY",
  "ALTERNATE",
  "RETRO",
  "SPECIAL_EDITION",
];

// Product Status options
const PRODUCT_STATUS = ["DRAFT", "ACTIVE", "DISCONTINUED", "PRE_ORDER"];

// Size and Color options
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  "RED",
  "BLUE",
  "WHITE",
  "BLACK",
  "GREEN",
  "YELLOW",
  "NAVY",
  "GRAY",
  "ORANGE",
  "PURPLE",
  "PRIMARY",
];

interface VariantWithStock {
  id: number;
  variantId: string;
  size: string;
  color: string;
  price: string;
  currency: string;
  stockId?: number;
  stockQuantity: number;
  reorderPoint: number;
}

export default function EditProductPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    sku: "",
    sport: "",
    team: "",
    season: "",
    productType: "",
    productStatus: "ACTIVE",
    titleEN: "",
    titleFR: "",
    descriptionEN: "",
    descriptionFR: "",
    isCustomizable: false,
    primaryImageUrl: "",
  });

  const [variants, setVariants] = useState<VariantWithStock[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch existing product data and variants with stock
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetchingProduct(true);
        setError(null);
        const product = await getProductById(productId);

        setFormData({
          sku: product.sku,
          sport: product.sport,
          team: product.team,
          season: product.season || "",
          productType: product.productType,
          productStatus: product.productStatus,
          titleEN: product.bilingualContent.titleEN,
          titleFR: product.bilingualContent.titleFR,
          descriptionEN: product.bilingualContent.descriptionEN || "",
          descriptionFR: product.bilingualContent.descriptionFR || "",
          isCustomizable: product.isCustomizable || false,
          primaryImageUrl: product.productImages?.primaryImageUrl || "",
        });

        if (product.productImages?.primaryImageUrl) {
          const imageUrl = getProductImageUrl(
            product.productImages.primaryImageUrl
          );
          console.log("Setting image preview:", imageUrl);
          setImagePreview(imageUrl);
        } else {
          console.log("No primary image URL found");
        }

        // Fetch stock for each variant
        const variantsWithStock = await Promise.all(
          product.variants.map(async (variant) => {
            try {
              const stock: StockItem = await getStockByVariantId(
                variant.variantId
              );
              return {
                id: variant.id,
                variantId: variant.variantId,
                size: variant.size,
                color: variant.color,
                price: variant.basePrice.amount.toString(),
                currency: variant.basePrice.currency,
                stockId: stock.id,
                stockQuantity: stock.availableQuantity,
                reorderPoint: stock.reorderPoint,
              };
            } catch (err) {
              // If stock doesn't exist, return variant without stock
              return {
                id: variant.id,
                variantId: variant.variantId,
                size: variant.size,
                color: variant.color,
                price: variant.basePrice.amount.toString(),
                currency: variant.basePrice.currency,
                stockQuantity: 0,
                reorderPoint: 5,
              };
            }
          })
        );

        setVariants(variantsWithStock);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(
          err instanceof Error
            ? err.message
            : t("Failed to load product", "Échec du chargement du produit")
        );
      } finally {
        setFetchingProduct(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, t]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        t(
          "Please upload an image file",
          "Veuillez télécharger un fichier image"
        )
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        t(
          "Image size must be less than 5MB",
          "La taille de l'image doit être inférieure à 5 Mo"
        )
      );
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, primaryImageUrl: "" }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantWithStock,
    value: string | number
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let primaryImageUrl = formData.primaryImageUrl;

      // Upload new image if selected
      if (imageFile) {
        setImageUploading(true);
        const uploadResult = await uploadProductImage(imageFile);
        primaryImageUrl = uploadResult.objectName;
        setImageUploading(false);
      }

      // Update basic product info
      const productRequest: UpdateProductRequest = {
        sku: formData.sku,
        sport: formData.sport,
        team: formData.team,
        season: formData.season || undefined,
        productType: formData.productType,
        productStatus: formData.productStatus,
        bilingualContent: {
          titleEN: formData.titleEN,
          titleFR: formData.titleFR,
          descriptionEN: formData.descriptionEN || undefined,
          descriptionFR: formData.descriptionFR || undefined,
        },
        isCustomizable: formData.isCustomizable,
      };

      if (primaryImageUrl) {
        productRequest.productImages = {
          primaryImageUrl,
          imageUrls: [primaryImageUrl],
        };
      }

      await updateProduct(productId, productRequest);

      // Update each variant's price, size, and color with error isolation
      const variantResults = await Promise.allSettled(
        variants.map(async (variant) => {
          const variantRequest: UpdateProductVariantRequest = {
            size: variant.size,
            color: variant.color,
            basePrice: {
              amount: parseFloat(variant.price),
              currency: variant.currency,
            },
          };
          await updateProductVariant(variant.id, variantRequest);

          // Adjust stock if needed
          if (variant.stockId) {
            const currentStock = await getStockByVariantId(variant.variantId);
            const stockDifference =
              variant.stockQuantity - currentStock.availableQuantity;

            if (stockDifference !== 0) {
              const adjustRequest: StockAdjustmentRequest = {
                quantity: stockDifference,
                reason: "Admin manual adjustment from edit page",
              };
              await adjustStock(variant.stockId, adjustRequest);
            }

            // Update reorder point if changed
            if (variant.reorderPoint !== currentStock.reorderPoint) {
              await updateStockItem(variant.stockId, {
                reorderPoint: variant.reorderPoint,
              });
            }
          }
        })
      );

      // Log any variant update failures
      const failedVariants = variantResults
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === "rejected");

      if (failedVariants.length > 0) {
        console.error(
          `Failed to update ${failedVariants.length} variant(s):`,
          failedVariants.map(({ index, result }) => ({
            index,
            error: result.status === "rejected" ? result.reason : null,
          }))
        );
        // Still show success but warn about partial failures
        if (failedVariants.length === variants.length) {
          throw new Error(
            t(
              "Failed to update all variants",
              "Échec de la mise à jour de toutes les variantes"
            )
          );
        }
      }

      router.push("/dashboard/products");
    } catch (err) {
      console.error("Failed to update product:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("Failed to update product", "Échec de la mise à jour du produit")
      );
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  // Validate product ID (after all hooks are declared)
  if (isNaN(productId) || productId <= 0) {
    return (
      <PageLayout>
        <Card className="border-destructive">
          <CardContent className="py-10">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <p>{t("Invalid product ID", "ID de produit invalide")}</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (fetchingProduct) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (error && !loading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/products")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("Back", "Retour")}
            </Button>
          </div>
          <Card className="border-destructive">
            <CardContent className="py-10">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/products")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Back", "Retour")}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {t("Edit Product", "Modifier le produit")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "Update product information, variants, and stock",
                "Mettre à jour les informations du produit, variantes et stock"
              )}
            </p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("Basic Information", "Informations de base")}
              </CardTitle>
              <CardDescription>
                {t(
                  "Update the basic details of the product",
                  "Mettre à jour les détails de base du produit"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">
                    SKU <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team">
                    {t("Team", "Équipe")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="team"
                    value={formData.team}
                    onChange={(e) => handleInputChange("team", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sport">
                    {t("Sport", "Sport")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="sport"
                    value={formData.sport}
                    onChange={(e) => handleInputChange("sport", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">
                      {t("Select Sport", "Sélectionner le sport")}
                    </option>
                    {SPORTS.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">
                    {t("Product Type", "Type de produit")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="productType"
                    value={formData.productType}
                    onChange={(e) =>
                      handleInputChange("productType", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">
                      {t("Select Type", "Sélectionner le type")}
                    </option>
                    {PRODUCT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season">
                    {t("Season", "Saison")} ({t("Optional", "Optionnel")})
                  </Label>
                  <Input
                    id="season"
                    value={formData.season}
                    onChange={(e) =>
                      handleInputChange("season", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productStatus">
                    {t("Status", "Statut")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="productStatus"
                    value={formData.productStatus}
                    onChange={(e) =>
                      handleInputChange("productStatus", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    {PRODUCT_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCustomizable"
                  checked={formData.isCustomizable}
                  onChange={(e) =>
                    handleInputChange("isCustomizable", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isCustomizable" className="cursor-pointer">
                  {t(
                    "This product can be customized with name and number",
                    "Ce produit peut être personnalisé avec un nom et un numéro"
                  )}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Bilingual Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("Product Titles & Descriptions", "Titres et descriptions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titleEN">
                    {t("English Title", "Titre anglais")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="titleEN"
                    value={formData.titleEN}
                    onChange={(e) =>
                      handleInputChange("titleEN", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titleFR">
                    {t("French Title", "Titre français")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="titleFR"
                    value={formData.titleFR}
                    onChange={(e) =>
                      handleInputChange("titleFR", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionEN">
                    {t(
                      "English Description (Optional)",
                      "Description anglaise (Optionnel)"
                    )}
                  </Label>
                  <textarea
                    id="descriptionEN"
                    value={formData.descriptionEN}
                    onChange={(e) =>
                      handleInputChange("descriptionEN", e.target.value)
                    }
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionFR">
                    {t(
                      "French Description (Optional)",
                      "Description française (Optionnel)"
                    )}
                  </Label>
                  <textarea
                    id="descriptionFR"
                    value={formData.descriptionFR}
                    onChange={(e) =>
                      handleInputChange("descriptionFR", e.target.value)
                    }
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Product Image", "Image du produit")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="relative w-48 h-48 rounded-lg border overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="max-w-xs mx-auto"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {t(
                      "Accepted formats: JPG, PNG, WebP",
                      "Formats acceptés : JPG, PNG, WebP"
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variants and Stock */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("Product Variants & Stock", "Variantes du produit et stock")}
              </CardTitle>
              <CardDescription>
                {t(
                  "Update size, color, price, and stock for each variant",
                  "Mettre à jour la taille, couleur, prix et stock pour chaque variante"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <h4 className="font-medium">
                    {t("Variant", "Variante")} {index + 1}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`size-${index}`}>
                        {t("Size", "Taille")}
                      </Label>
                      <select
                        id={`size-${index}`}
                        value={variant.size}
                        onChange={(e) =>
                          handleVariantChange(index, "size", e.target.value)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`color-${index}`}>
                        {t("Color", "Couleur")}
                      </Label>
                      <select
                        id={`color-${index}`}
                        value={variant.color}
                        onChange={(e) =>
                          handleVariantChange(index, "color", e.target.value)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {COLORS.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`price-${index}`}>
                        {t("Price", "Prix")} ({variant.currency})
                      </Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(index, "price", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`stock-${index}`}>
                        {t("Stock Quantity", "Quantité en stock")}
                      </Label>
                      <Input
                        id={`stock-${index}`}
                        type="number"
                        min="0"
                        value={variant.stockQuantity}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "stockQuantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`reorder-${index}`}>
                        {t("Reorder Point", "Point de réapprovisionnement")}
                      </Label>
                      <Input
                        id={`reorder-${index}`}
                        type="number"
                        min="0"
                        value={variant.reorderPoint}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "reorderPoint",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
              disabled={loading}
            >
              {t("Cancel", "Annuler")}
            </Button>
            <Button type="submit" disabled={loading || imageUploading}>
              {loading || imageUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {imageUploading
                    ? t("Uploading...", "Téléchargement...")
                    : t("Updating...", "Mise à jour...")}
                </>
              ) : (
                t("Update Product", "Mettre à jour le produit")
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
