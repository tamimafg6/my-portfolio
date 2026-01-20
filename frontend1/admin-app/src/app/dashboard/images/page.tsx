"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Download,
  Eye,
  Grid3X3,
  List,
  ImageIcon,
  Search,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  uploadProductImage,
  uploadInvoicePdf,
  getProductImageUrl,
  getInvoiceUrl,
  listProductImages,
  listInvoices,
  deleteProductImageFromMinIO,
  deleteInvoiceFromMinIO,
  FileUploadResponse,
  apiFetch,
} from "@/lib/api";
import { FileMetadata } from "@/types/file";
import { useLanguage } from "@/lib/i18n";
import { useEffect } from "react";

// Validation constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_PDF_TYPES = ["application/pdf"];

interface UploadedFile {
  objectName: string;
  url: string;
  size: number;
  contentType: string;
  originalFilename: string;
  directUrl: string;
  bucket: string;
  uploadedAt: Date;
}

// Convert FileMetadata to UploadedFile format
function fileMetadataToUploadedFile(metadata: FileMetadata): UploadedFile {
  // Determine if it's an image or invoice based on bucket or content type
  const isImage = metadata.bucket === "passion-jerseys-products" || 
    metadata.contentType.startsWith("image/");
  
  // Use API proxy URLs instead of internal MinIO URLs
  const directUrl = isImage 
    ? getProductImageUrl(metadata.objectName)
    : getInvoiceUrl(metadata.objectName);
  
  return {
    objectName: metadata.objectName,
    url: directUrl, // Use proxied URL
    size: metadata.size,
    contentType: metadata.contentType,
    originalFilename: metadata.objectName,
    directUrl: directUrl, // Use proxied URL
    bucket: metadata.bucket,
    uploadedAt: metadata.lastModified 
      ? new Date(metadata.lastModified) 
      : new Date(),
  };
}

type UploadType = "images" | "invoices";
type ViewMode = "grid" | "list";

interface ValidationOptions {
  allowedTypes: readonly string[];
  maxSize: number;
  allowedTypesLabel: string;
  maxSizeLabel: string;
}

function validateFileType(
  file: File,
  options: ValidationOptions,
  t: (en: string, fr: string) => string
): string | null {
  if (!options.allowedTypes.includes(file.type)) {
    return t(
      `Invalid file type: ${file.type}. Allowed types: ${options.allowedTypesLabel}`,
      `Type de fichier invalide : ${file.type}. Types autorisés : ${options.allowedTypesLabel}`
    );
  }
  if (file.size > options.maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return t(
      `File too large: ${sizeMB}MB. Maximum size is ${options.maxSizeLabel}`,
      `Fichier trop volumineux : ${sizeMB} Mo. La taille maximale est ${options.maxSizeLabel}`
    );
  }
  return null;
}

function validateImageFile(file: File, t: (en: string, fr: string) => string): string | null {
  return validateFileType(file, {
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE,
    allowedTypesLabel: "JPEG, PNG, WebP",
    maxSizeLabel: "5MB",
  }, t);
}

function validatePdfFile(file: File, t: (en: string, fr: string) => string): string | null {
  return validateFileType(file, {
    allowedTypes: ALLOWED_PDF_TYPES,
    maxSize: MAX_PDF_SIZE,
    allowedTypesLabel: "PDF",
    maxSizeLabel: "10MB",
  }, t);
}

function validateFile(file: File, type: UploadType, t: (en: string, fr: string) => string): string | null {
  return type === "images" ? validateImageFile(file, t) : validatePdfFile(file, t);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ImagesPage() {
  const { t } = useLanguage();
  const [uploadType, setUploadType] = useState<UploadType>("images");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch existing files from MinIO
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [images, invoices] = await Promise.all([
        listProductImages(),
        listInvoices(),
      ]);

      const allFiles = [
        ...images.map(fileMetadataToUploadedFile),
        ...invoices.map(fileMetadataToUploadedFile),
      ];

      // Deduplicate by objectName to prevent showing the same file multiple times
      // Use a Map to keep only the first occurrence of each objectName
      const uniqueFilesMap = new Map<string, UploadedFile>();
      for (const file of allFiles) {
        if (!uniqueFilesMap.has(file.objectName)) {
          uniqueFilesMap.set(file.objectName, file);
        }
      }

      setUploadedFiles(Array.from(uniqueFilesMap.values()));
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("Failed to load files", "Échec du chargement des fichiers")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch files on page load
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      setSuccessMessage(null);

      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      for (const file of fileArray) {
        const validationError = validateFile(file, uploadType, t);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setUploading(true);

      try {
        const uploadPromises = fileArray.map(
          async (file): Promise<UploadedFile> => {
            let response: FileUploadResponse;
            if (uploadType === "images") {
              response = await uploadProductImage(file);
            } else {
              response = await uploadInvoicePdf(file);
            }

            return {
              ...response,
              directUrl:
                uploadType === "images"
                  ? getProductImageUrl(response.objectName)
                  : getInvoiceUrl(response.objectName),
              uploadedAt: new Date(),
            };
          }
        );

        const settled = await Promise.allSettled(uploadPromises);
        const succeeded = settled
          .filter(
            (r): r is PromiseFulfilledResult<UploadedFile> =>
              r.status === "fulfilled"
          )
          .map((r) => r.value);
        const failed = settled.filter((r) => r.status === "rejected");

        // Optimistically update the UI with successful uploads for immediate feedback
        if (succeeded.length > 0) {
          setUploadedFiles((prev) => [...succeeded, ...prev]);
          // Then, trigger a background refetch to ensure data is fully consistent
          fetchFiles();
        }

        const fileTypeLabel = uploadType === "images" 
          ? t("image(s)", "image(s)")
          : t("PDF(s)", "PDF(s)");
        if (failed.length > 0 && succeeded.length > 0) {
          setError(
            t(
              `${failed.length} of ${fileArray.length} ${fileTypeLabel} failed to upload`,
              `${failed.length} sur ${fileArray.length} ${fileTypeLabel} n'ont pas pu être téléchargés`
            )
          );
          setSuccessMessage(
            t(
              `Successfully uploaded ${succeeded.length} ${fileTypeLabel}`,
              `${succeeded.length} ${fileTypeLabel} téléchargés avec succès`
            )
          );
        } else if (failed.length > 0) {
          setError(t(
            `Failed to upload ${failed.length} ${fileTypeLabel}`,
            `Échec du téléchargement de ${failed.length} ${fileTypeLabel}`
          ));
        } else {
          setSuccessMessage(
            t(
              `Successfully uploaded ${succeeded.length} ${fileTypeLabel}`,
              `${succeeded.length} ${fileTypeLabel} téléchargés avec succès`
            )
          );
        }
      } catch {
        setError(t("Unexpected error during upload", "Erreur inattendue lors du téléchargement"));
      } finally {
        setUploading(false);
      }
    },
    [uploadType, t, fetchFiles]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
      e.target.value = "";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage(t("Copied to clipboard!", "Copié dans le presse-papiers !"));
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch {
      setError(t("Failed to copy to clipboard", "Échec de la copie dans le presse-papiers"));
    }
  };

  const removeFile = async (objectName: string, isImage: boolean) => {
    // Show confirmation dialog
    if (!confirm(
      t(
        "Are you sure you want to delete this file? This action cannot be undone.",
        "Êtes-vous sûr de vouloir supprimer ce fichier? Cette action ne peut pas être annulée."
      )
    )) {
      return;
    }

    setDeleting(objectName);
    setError(null);

    try {
      if (isImage) {
        await deleteProductImageFromMinIO(objectName);
      } else {
        await deleteInvoiceFromMinIO(objectName);
      }

      // Refresh file list from MinIO to ensure consistency
      await fetchFiles();
      
      if (selectedFile?.objectName === objectName) {
        setSelectedFile(null);
      }

      setSuccessMessage(
        t("File deleted successfully", "Fichier supprimé avec succès")
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to delete file:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("Failed to delete file", "Échec de la suppression du fichier")
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenFile = async (file: UploadedFile) => {
    try {
      // For images, we can try to open directly first (might work if public), 
      // but for PDFs (invoices) we ALWAYS need to fetch via API with auth headers
      // because MinIO buckets are private
      
      // Extract the path from the URL
      // The directUrl we construct in fileMetadataToUploadedFile is like: http://localhost:8080/api/files/invoices/invoice-123.pdf
      // We need to extract just the path part without /api since API_URL already includes it
      let path = new URL(file.directUrl).pathname;
      // Remove /api prefix if present (API_URL already includes /api)
      path = path.replace(/^\/api/, "");
      
      const response = await apiFetch(path);
      
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }
      
      const blob = await response.blob();
      
      // Wrap in File object to preserve filename in browser viewer
      const fileObj = new File([blob], file.originalFilename, { 
        type: file.contentType || "application/octet-stream" 
      });
      
      const blobUrl = window.URL.createObjectURL(fileObj);
      window.open(blobUrl, "_blank");
      
      // Setup cleanup (optional, browsers eventually handle this on page unload, 
      // but strictly we should revoke. For a new tab, it's tricky to revoke at the right time)
      // We'll rely on the browser's session cleanup for the new tab
    } catch (err) {
      console.error("Failed to open file:", err);
      setError(t("Failed to open file. Please try downloading it.", "Impossible d'ouvrir le fichier. Veuillez essayer de le télécharger."));
    }
  };

  const filteredFiles = uploadedFiles.filter(
    (file) =>
      file.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.objectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTypeFiles = filteredFiles.filter((file) =>
    uploadType === "images"
      ? file.contentType.startsWith("image/")
      : file.contentType === "application/pdf"
  );

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("File Manager", "Gestionnaire de fichiers")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("Upload and manage product images and invoice documents", "Télécharger et gérer les images de produits et les documents de facturation")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFiles}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {t("Refresh", "Actualiser")}
            </Button>
            <Badge variant="outline" className="text-xs">
              {uploadedFiles.length} {t("files", "fichiers")}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t("Images", "Images")}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {
                      uploadedFiles.filter((f) =>
                        f.contentType.startsWith("image/")
                      ).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t("Documents", "Documents")}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {
                      uploadedFiles.filter(
                        (f) => f.contentType === "application/pdf"
                      ).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t("Total Size", "Taille totale")}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatFileSize(
                      uploadedFiles.reduce((acc, f) => acc + f.size, 0)
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t("Storage", "Stockage")}
                  </p>
                  <p className="text-2xl font-bold mt-1">MinIO</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload & File List */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs
              value={uploadType}
              onValueChange={(value) => {
                setUploadType(value as UploadType);
                setError(null);
                setSuccessMessage(null);
              }}
            >
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="images" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {t("Images", "Images")}
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="gap-2">
                    <FileText className="h-4 w-4" />
                    {t("Invoices", "Factures")}
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("Search files...", "Rechercher des fichiers...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-48 h-9"
                    />
                  </div>
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-9 px-2 rounded-r-none"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-9 px-2 rounded-l-none"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <TabsContent value="images" className="space-y-4 mt-4">
                {/* Upload Zone */}
                <Card>
                  <CardContent className="p-4">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                      } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <input
                        type="file"
                        id="file-upload-images"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />

                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>

                        {uploading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span className="text-primary text-sm font-medium">
                              {t("Uploading...", "Téléchargement...")}
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">
                              <span className="font-medium text-primary">
                                {t("Drop images here", "Déposez les images ici")}
                              </span>{" "}
                              {t("or click to browse", "ou cliquez pour parcourir")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              JPEG, PNG, WebP • {t("Max", "Max")} 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Messages */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-green-700 dark:text-green-400 text-sm">
                      {successMessage}
                    </p>
                  </div>
                )}

                {/* File Grid/List */}
                {currentTypeFiles.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {t("Uploaded Images", "Images téléchargées")} ({currentTypeFiles.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {currentTypeFiles.map((file) => (
                            <div
                              key={file.objectName}
                              className={`group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer border-2 transition-all ${
                                selectedFile?.objectName === file.objectName
                                  ? "border-primary ring-2 ring-primary/20"
                                  : "border-transparent hover:border-primary/50"
                              }`}
                              onClick={() => setSelectedFile(file)}
                            >
                              <Image
                                src={file.directUrl}
                                alt={file.originalFilename}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenFile(file);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(file.objectName);
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                <p className="text-white text-xs truncate">
                                  {file.originalFilename}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {currentTypeFiles.map((file) => (
                            <div
                              key={file.objectName}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedFile?.objectName === file.objectName
                                  ? "bg-primary/10 border border-primary/30"
                                  : "bg-muted/50 hover:bg-muted border border-transparent"
                              }`}
                              onClick={() => setSelectedFile(file)}
                            >
                              <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0 relative">
                                <Image
                                  src={file.directUrl}
                                  alt={file.originalFilename}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {file.originalFilename}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)} •{" "}
                                  {formatDate(file.uploadedAt)}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(file.objectName);
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(
                                      file.objectName,
                                      file.contentType.startsWith("image/")
                                    );
                                  }}
                                  disabled={deleting === file.objectName}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {currentTypeFiles.length === 0 && uploadedFiles.length > 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t("No images match your search", "Aucune image ne correspond à votre recherche")}</p>
                  </div>
                )}

                {uploadedFiles.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">
                      {t("No images uploaded yet", "Aucune image téléchargée pour le moment")}
                    </p>
                    <p className="text-sm">
                      {t("Upload images to see them in the gallery", "Téléchargez des images pour les voir dans la galerie")}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invoices" className="space-y-4 mt-4">
                {/* Upload Zone */}
                <Card>
                  <CardContent className="p-4">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                      } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <input
                        type="file"
                        id="file-upload-invoices"
                        multiple
                        accept="application/pdf"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />

                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-500" />
                        </div>

                        {uploading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span className="text-primary text-sm font-medium">
                              {t("Uploading...", "Téléchargement...")}
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">
                              <span className="font-medium text-primary">
                                {t("Drop PDFs here", "Déposez les PDF ici")}
                              </span>{" "}
                              {t("or click to browse", "ou cliquez pour parcourir")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t("PDF files", "Fichiers PDF")} • {t("Max", "Max")} 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Messages */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-green-700 dark:text-green-400 text-sm">
                      {successMessage}
                    </p>
                  </div>
                )}

                {/* PDF List */}
                {currentTypeFiles.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {t("Uploaded Documents", "Documents téléchargés")} ({currentTypeFiles.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentTypeFiles.map((file) => (
                          <div
                            key={file.objectName}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedFile?.objectName === file.objectName
                                ? "bg-primary/10 border border-primary/30"
                                : "bg-muted/50 hover:bg-muted border border-transparent"
                            }`}
                            onClick={() => setSelectedFile(file)}
                          >
                            <div className="h-12 w-12 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.originalFilename}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)} •{" "}
                                {formatDate(file.uploadedAt)}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenFile(file);
                                }}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(file.objectName);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(
                                    file.objectName,
                                    file.contentType.startsWith("image/")
                                  );
                                }}
                                disabled={deleting === file.objectName}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentTypeFiles.length === 0 &&
                  uploadedFiles.filter(
                    (f) => f.contentType === "application/pdf"
                  ).length > 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>
                        {t("No invoices match your search", "Aucune facture ne correspond à votre recherche")}
                      </p>
                    </div>
                  )}

                {uploadedFiles.filter(
                  (f) => f.contentType === "application/pdf"
                ).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">
                      {t("No documents uploaded yet", "Aucun document téléchargé pour le moment")}
                    </p>
                    <p className="text-sm">
                      {t("Upload invoice PDFs to manage them here", "Téléchargez des PDF de factures pour les gérer ici")}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: File Details Panel */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("File Details", "Détails du fichier")}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFile ? (
                  <div className="space-y-4">
                    {/* Preview */}
                    {selectedFile.contentType.startsWith("image/") ? (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                        <Image
                          src={selectedFile.directUrl}
                          alt={selectedFile.originalFilename}
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-16 w-16 text-red-500" />
                      </div>
                    )}

                    {/* File Info */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {t("Filename", "Nom du fichier")}
                        </p>
                        <p className="text-sm font-medium truncate">
                          {selectedFile.originalFilename}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {t("Size", "Taille")}
                          </p>
                          <p className="text-sm font-medium">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {t("Type", "Type")}
                          </p>
                          <p className="text-sm font-medium">
                            {selectedFile.contentType
                              .split("/")[1]
                              .toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {t("Object ID", "ID d'objet")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded truncate">
                            {selectedFile.objectName}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              copyToClipboard(selectedFile.objectName)
                            }
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {t("Bucket", "Bucket")}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {selectedFile.bucket}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          handleOpenFile(selectedFile)
                        }
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        {t("Open", "Ouvrir")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => copyToClipboard(selectedFile.directUrl)}
                      >
                        <Copy className="h-4 w-4 mr-1.5" />
                        {t("Copy URL", "Copier l'URL")}
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        removeFile(
                          selectedFile.objectName,
                          selectedFile.contentType.startsWith("image/")
                        )
                      }
                      disabled={deleting === selectedFile.objectName}
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      {deleting === selectedFile.objectName
                        ? t("Deleting...", "Suppression...")
                        : t("Delete from MinIO", "Supprimer de MinIO")}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("Select a file to view details", "Sélectionnez un fichier pour voir les détails")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("Quick Reference", "Référence rapide")}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  {t(
                    "Use the Object ID to reference files in product listings or invoice records.",
                    "Utilisez l'ID d'objet pour référencer les fichiers dans les listes de produits ou les enregistrements de factures."
                  )}
                </p>
                <p>
                  {t(
                    "Files are stored in MinIO and served through the file service API.",
                    "Les fichiers sont stockés dans MinIO et servis via l'API du service de fichiers."
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
