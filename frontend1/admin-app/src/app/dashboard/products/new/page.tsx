"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, X, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  createProduct,
  createProductVariant,
  createStockItem,
  uploadProductImage,
  getProductImageUrl,
  CreateProductRequest,
  CreateProductVariantRequest,
  CreateStockItemRequest,
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

// Size options
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Configuration constants
// MAIN_WAREHOUSE_ID relies on backend migration V9__create_inventory_tables.sql creating
// a default warehouse at ID 1. If warehouse is deleted or migrations are corrupted,
// stock creation will fail with foreign key constraint errors.
const MAIN_WAREHOUSE_ID = 1; // Default warehouse from backend seed data
const DEFAULT_CURRENCY = "CAD";
const DEFAULT_REORDER_POINT = 5;

// Color options
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

interface Variant {
  size: string;
  color: string;
  price: string;
  stockQuantity: string;
}

export default function AddJerseyPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    sku: "",
    sport: "",
    team: "",
    season: "",
    productType: "",
    productStatus: "DRAFT",
    titleEN: "",
    titleFR: "",
    descriptionEN: "",
    descriptionFR: "",
    primaryImageUrl: "",
    isCustomizable: false,
  });

  // Variant state - at least one variant required
  const [variants, setVariants] = useState<Variant[]>([
    { size: "", color: "", price: "", stockQuantity: "" },
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(
        t(
          "Please upload an image file",
          "Veuillez télécharger un fichier image"
        )
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(
        t(
          "Image size must be less than 5MB",
          "La taille de l'image doit être inférieure à 5 Mo"
        )
      );
      return;
    }

    try {
      setImageUploading(true);
      setError(null);
      const result = await uploadProductImage(file);
      setFormData((prev) => ({
        ...prev,
        primaryImageUrl: result.objectName,
      }));
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("Failed to upload image", "Échec du téléchargement de l'image")
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, primaryImageUrl: "" }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { size: "", color: "", price: "", stockQuantity: "" },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.sku.trim()) {
      setError(t("SKU is required", "Le SKU est requis"));
      return;
    }
    if (!formData.sport) {
      setError(t("Sport is required", "Le sport est requis"));
      return;
    }
    if (!formData.team.trim()) {
      setError(t("Team is required", "L'équipe est requise"));
      return;
    }
    if (!formData.productType) {
      setError(t("Product type is required", "Le type de produit est requis"));
      return;
    }
    if (!formData.titleEN.trim()) {
      setError(t("English title is required", "Le titre anglais est requis"));
      return;
    }
    if (!formData.titleFR.trim()) {
      setError(t("French title is required", "Le titre français est requis"));
      return;
    }

    // Validate at least one variant
    if (variants.length === 0) {
      setError(
        t(
          "At least one variant is required",
          "Au moins une variante est requise"
        )
      );
      return;
    }

    // Validate all variants
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (!variant.size) {
        setError(
          t(
            `Variant ${i + 1}: Size is required`,
            `Variante ${i + 1}: La taille est requise`
          )
        );
        return;
      }
      if (!variant.color) {
        setError(
          t(
            `Variant ${i + 1}: Color is required`,
            `Variante ${i + 1}: La couleur est requise`
          )
        );
        return;
      }
      if (!variant.price || parseFloat(variant.price) <= 0) {
        setError(
          t(
            `Variant ${i + 1}: Valid price is required`,
            `Variante ${i + 1}: Un prix valide est requis`
          )
        );
        return;
      }
      if (!variant.stockQuantity || parseInt(variant.stockQuantity) < 0) {
        setError(
          t(
            `Variant ${i + 1}: Valid stock quantity is required`,
            `Variante ${i + 1}: Une quantité de stock valide est requise`
          )
        );
        return;
      }
    }

    try {
      setLoading(true);

      const request: CreateProductRequest = {
        sku: formData.sku.trim(),
        sport: formData.sport,
        team: formData.team.trim(),
        season: formData.season.trim() || undefined,
        productType: formData.productType,
        productStatus: formData.productStatus || "ACTIVE",
        bilingualContent: {
          titleEN: formData.titleEN.trim(),
          titleFR: formData.titleFR.trim(),
          descriptionEN: formData.descriptionEN.trim() || undefined,
          descriptionFR: formData.descriptionFR.trim() || undefined,
        },
        isCustomizable: formData.isCustomizable,
      };

      // Add image if uploaded
      if (formData.primaryImageUrl) {
        request.productImages = {
          primaryImageUrl: formData.primaryImageUrl,
          imageUrls: [formData.primaryImageUrl],
        };
      }

      const createdProduct = await createProduct(request);

      // Create variants and stock items for the product in parallel
      // Note: If variant/stock creation fails, the product will exist without variants.
      // This is acceptable for DRAFT products - admin can delete and retry or manually add variants.
      // For production-grade atomicity, consider a backend endpoint that creates product+variants+stock in a single transaction.
      const variantPromises = variants.map(async (variant) => {
        const variantRequest: CreateProductVariantRequest = {
          size: variant.size,
          color: variant.color,
          basePrice: {
            amount: parseFloat(variant.price),
            currency: DEFAULT_CURRENCY,
          },
        };
        const createdVariant = await createProductVariant(
          createdProduct.id,
          variantRequest
        );

        // Create stock item for this variant
        const stockRequest: CreateStockItemRequest = {
          variantId: createdVariant.variantId,
          initialQuantity: parseInt(variant.stockQuantity),
          reorderPoint: DEFAULT_REORDER_POINT,
        };
        await createStockItem(MAIN_WAREHOUSE_ID, stockRequest);
      });

      await Promise.all(variantPromises);

      // Redirect to products page on success
      router.push("/dashboard/products");
    } catch (err) {
      console.error("Failed to create product:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("Failed to create product", "Échec de la création du produit")
      );
    } finally {
      setLoading(false);
    }
  };

  const translateSport = (sport: string): string => {
    const translations: Record<string, { en: string; fr: string }> = {
      SOCCER: { en: "Soccer", fr: "Soccer" },
      HOCKEY: { en: "Hockey", fr: "Hockey" },
      BASKETBALL: { en: "Basketball", fr: "Basketball" },
      FOOTBALL: { en: "Football", fr: "Football américain" },
      BASEBALL: { en: "Baseball", fr: "Baseball" },
      FORMULA1: { en: "Formula 1", fr: "Formule 1" },
    };
    return language === "en"
      ? translations[sport]?.en || sport
      : translations[sport]?.fr || sport;
  };

  const translateProductType = (type: string): string => {
    const translations: Record<string, { en: string; fr: string }> = {
      DEFAULT: { en: "Default", fr: "Par défaut" },
      HOME: { en: "Home", fr: "Domicile" },
      AWAY: { en: "Away", fr: "Extérieur" },
      ALTERNATE: { en: "Alternate", fr: "Alternatif" },
      RETRO: { en: "Retro", fr: "Rétro" },
      SPECIAL_EDITION: { en: "Special Edition", fr: "Édition spéciale" },
    };
    return language === "en"
      ? translations[type]?.en || type
      : translations[type]?.fr || type;
  };

  const translateStatus = (status: string): string => {
    const translations: Record<string, { en: string; fr: string }> = {
      DRAFT: { en: "Draft", fr: "Brouillon" },
      ACTIVE: { en: "Active", fr: "Actif" },
      DISCONTINUED: { en: "Discontinued", fr: "Discontinué" },
      PRE_ORDER: { en: "Pre-Order", fr: "Précommande" },
    };
    return language === "en"
      ? translations[status]?.en || status
      : translations[status]?.fr || status;
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/products")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("Back", "Retour")}
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("Add New Jersey", "Ajouter un nouveau maillot")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "Create a new jersey product for your catalog",
                "Créez un nouveau produit de maillot pour votre catalogue"
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

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("Basic Information", "Informations de base")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "Enter the basic details for the jersey",
                    "Entrez les détails de base du maillot"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">
                      SKU <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder={t(
                        "e.g., MTL-HABS-2024-HOME",
                        "p. ex., MTL-HABS-2024-HOME"
                      )}
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
                      name="team"
                      value={formData.team}
                      onChange={handleChange}
                      placeholder={t(
                        "e.g., Montreal Canadiens",
                        "p. ex., Canadiens de Montréal"
                      )}
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
                      name="sport"
                      value={formData.sport}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">
                        {t("Select a sport", "Sélectionnez un sport")}
                      </option>
                      {SPORTS.map((sport) => (
                        <option key={sport} value={sport}>
                          {translateSport(sport)}
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
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">
                        {t("Select a type", "Sélectionnez un type")}
                      </option>
                      {PRODUCT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {translateProductType(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">
                      {t("Season", "Saison")}{" "}
                      <span className="text-muted-foreground text-xs">
                        ({t("Optional", "Optionnel")})
                      </span>
                    </Label>
                    <Input
                      id="season"
                      name="season"
                      value={formData.season}
                      onChange={handleChange}
                      placeholder={t("e.g., 2024-2025", "p. ex., 2024-2025")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productStatus">
                      {t("Status", "Statut")}
                    </Label>
                    <select
                      id="productStatus"
                      name="productStatus"
                      value={formData.productStatus}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {PRODUCT_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {translateStatus(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isCustomizable"
                    name="isCustomizable"
                    checked={formData.isCustomizable}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isCustomizable" className="font-normal">
                    {t(
                      "This jersey can be customized with name and number",
                      "Ce maillot peut être personnalisé avec nom et numéro"
                    )}
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Bilingual Content */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("Product Names & Descriptions", "Noms et descriptions")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "Provide bilingual names and descriptions",
                    "Fournissez des noms et descriptions bilingues"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="titleEN">
                      {t("Name (English)", "Nom (Anglais)")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="titleEN"
                      name="titleEN"
                      value={formData.titleEN}
                      onChange={handleChange}
                      placeholder={t(
                        "e.g., Montreal Canadiens Home Jersey",
                        "p. ex., Montreal Canadiens Home Jersey"
                      )}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titleFR">
                      {t("Name (French)", "Nom (Français)")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="titleFR"
                      name="titleFR"
                      value={formData.titleFR}
                      onChange={handleChange}
                      placeholder={t(
                        "e.g., Maillot Domicile des Canadiens",
                        "p. ex., Maillot Domicile des Canadiens"
                      )}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="descriptionEN">
                      {t("Description (English)", "Description (Anglais)")}{" "}
                      <span className="text-muted-foreground text-xs">
                        ({t("Optional", "Optionnel")})
                      </span>
                    </Label>
                    <textarea
                      id="descriptionEN"
                      name="descriptionEN"
                      value={formData.descriptionEN}
                      onChange={handleChange}
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder={t(
                        "Describe the jersey in English...",
                        "Décrivez le maillot en anglais..."
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionFR">
                      {t("Description (French)", "Description (Français)")}{" "}
                      <span className="text-muted-foreground text-xs">
                        ({t("Optional", "Optionnel")})
                      </span>
                    </Label>
                    <textarea
                      id="descriptionFR"
                      name="descriptionFR"
                      value={formData.descriptionFR}
                      onChange={handleChange}
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder={t(
                        "Describe the jersey in French...",
                        "Décrivez le maillot en français..."
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Image */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Product Image", "Image du produit")}</CardTitle>
                <CardDescription>
                  {t(
                    "Upload a primary image for the jersey (optional)",
                    "Téléchargez une image principale pour le maillot (optionnel)"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.primaryImageUrl ? (
                  <div className="relative inline-block">
                    <div className="relative h-48 w-48 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={getProductImageUrl(formData.primaryImageUrl)}
                        alt={t("Product image", "Image du produit")}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="max-w-xs"
                    />
                    {imageUploading && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Accepted formats: JPG, PNG, GIF. Max size: 5MB",
                    "Formats acceptés : JPG, PNG, GIF. Taille max : 5 Mo"
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Product Variants */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "Product Variants (Size, Color, Price)",
                    "Variantes du produit (Taille, Couleur, Prix)"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "Add at least one variant with size, color, and price",
                    "Ajoutez au moins une variante avec taille, couleur et prix"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-4 relative"
                  >
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={() => handleRemoveVariant(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <h4 className="font-medium">
                      {t("Variant", "Variante")} {index + 1}
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`size-${index}`}>
                          {t("Size", "Taille")}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <select
                          id={`size-${index}`}
                          value={variant.size}
                          onChange={(e) =>
                            handleVariantChange(index, "size", e.target.value)
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          required
                        >
                          <option value="">
                            {t("Select size", "Sélectionner la taille")}
                          </option>
                          {SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`color-${index}`}>
                          {t("Color", "Couleur")}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <select
                          id={`color-${index}`}
                          value={variant.color}
                          onChange={(e) =>
                            handleVariantChange(index, "color", e.target.value)
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          required
                        >
                          <option value="">
                            {t("Select color", "Sélectionner la couleur")}
                          </option>
                          {COLORS.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`price-${index}`}>
                          {t("Price (CAD)", "Prix (CAD)")}{" "}
                          <span className="text-destructive">*</span>
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
                          placeholder="99.99"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`stockQuantity-${index}`}>
                          {t("Stock Quantity", "Quantité en stock")}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`stockQuantity-${index}`}
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "stockQuantity",
                              e.target.value
                            )
                          }
                          placeholder="50"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddVariant}
                >
                  {t("+ Add Another Variant", "+ Ajouter une autre variante")}
                </Button>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                disabled={loading}
              >
                {t("Cancel", "Annuler")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("Create Jersey", "Créer le maillot")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
