import { authClient } from "./auth-client";
import { FileMetadata } from "@/types/file";
import { getApiUrl } from "./utils/api-url";
import { getAuthServiceBaseUrl } from "./utils/auth-url";

// Use centralized helpers for normalized URLs
const API_URL = getApiUrl();
const AUTH_SERVICE_URL = getAuthServiceBaseUrl(); // Use base URL without /api/auth for manual fetch calls

export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const tokenResult = await authClient.token();
  const jwt = tokenResult.data?.token;

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
  });
}

// File upload types
export interface FileUploadResponse {
  objectName: string;
  url: string;
  bucket: string;
  size: number;
  contentType: string;
  originalFilename: string;
}

// Upload a file to the file service (for product images)
export async function uploadProductImage(
  file: File,
  filename?: string
): Promise<FileUploadResponse> {
  const tokenResult = await authClient.token();
  const jwt = tokenResult.data?.token;

  if (!jwt) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);
  if (filename) {
    formData.append("filename", filename);
  }

  const response = await fetch(`${API_URL}/files/products/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Upload failed" }));
    throw new Error(
      errorData.detail ||
        errorData.title ||
        `Upload failed with status ${response.status}`
    );
  }

  return response.json();
}

// Upload an invoice PDF to the file service
export async function uploadInvoicePdf(
  file: File,
  filename?: string
): Promise<FileUploadResponse> {
  const tokenResult = await authClient.token();
  const jwt = tokenResult.data?.token;

  if (!jwt) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);
  if (filename) {
    formData.append("filename", filename);
  }

  const response = await fetch(`${API_URL}/files/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Upload failed" }));
    throw new Error(
      errorData.detail ||
        errorData.title ||
        `Upload failed with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetch from auth-service with session cookie authentication
 * Used for admin endpoints that require Better Auth session cookies
 */
export async function authServiceFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  return fetch(`${AUTH_SERVICE_URL}${path}`, {
    ...options,
    credentials: "include", // Include cookies for session authentication
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
}

// Get direct URL for a product image
export function getProductImageUrl(objectName: string): string {
  if (!objectName) return "";
  // If it's already a full URL, return it as is
  if (objectName.startsWith("http")) return objectName;
  // Construct the full URL using normalized API_URL
  return `${API_URL}/files/products/${objectName}`;
}

// Get direct URL for an invoice PDF
export function getInvoiceUrl(objectName: string): string {
  return `${API_URL}/files/invoices/${objectName}`;
}

// ============== Error Handling Helper ==============

/**
 * Centralized error handling for API responses.
 * Handles authentication errors and extracts error messages from response.
 * This function should only be called when response.ok is false.
 *
 * @param response the fetch Response object (must not be ok)
 * @param errorMessage the default error message to use if extraction fails
 * @throws Error with appropriate message based on response status and content
 */
async function handleApiError(
  response: Response,
  errorMessage: string
): Promise<never> {
  if (response.status === 401 || response.status === 403) {
    throw new Error("Unauthorized: Admin access required");
  }
  if (response.status === 409) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "A product with this SKU already exists" }));
    throw new Error(
      errorData.detail ||
        errorData.title ||
        "A product with this SKU already exists"
    );
  }
  const errorData = await response
    .json()
    .catch(() => ({ detail: errorMessage }));
  throw new Error(
    errorData.detail || errorData.title || `${errorMessage}: ${response.status}`
  );
}

// ============== File Listing API helpers ==============

/**
 * List all product images from MinIO
 */
export async function listProductImages(): Promise<FileMetadata[]> {
  const response = await apiFetch("/files/products");

  if (!response.ok) {
    await handleApiError(response, "Failed to list product images");
  }

  return response.json();
}

/**
 * List all invoices from MinIO
 */
export async function listInvoices(): Promise<FileMetadata[]> {
  const response = await apiFetch("/files/invoices");

  if (!response.ok) {
    await handleApiError(response, "Failed to list invoices");
  }

  return response.json();
}

/**
 * Delete a product image from MinIO
 */
export async function deleteProductImageFromMinIO(
  objectName: string
): Promise<void> {
  const response = await apiFetch(`/files/products/${objectName}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to delete product image");
  }
}

/**
 * Delete an invoice from MinIO
 */
export async function deleteInvoiceFromMinIO(
  objectName: string
): Promise<void> {
  const response = await apiFetch(`/files/invoices/${objectName}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to delete invoice");
  }
}

// Product Statistics types
export interface ProductStatistics {
  totalProducts: number;
  productsBySport: Record<string, number>;
  productsByType: Record<string, number>;
  customizableCount: number;
  totalVariants: number;
  priceRange: {
    min: number | null;
    max: number | null;
  };
}

// Product types (simplified for admin)
export interface Product {
  id: number;
  sku: string;
  sport: string;
  team: string;
  season: string;
  productType: string;
  productStatus: string;
  bilingualContent: {
    titleEN: string;
    titleFR: string;
    descriptionEN?: string;
    descriptionFR?: string;
  };
  productImages: {
    primaryImageUrl: string | null;
    imageUrls: string[];
  };
  variants: Array<{
    id: number;
    variantId: string;
    size: string;
    color: string;
    basePrice: {
      amount: number;
      currency: string;
    };
  }>;
  minPrice?: number;
  currency?: string;
  isCustomizable?: boolean;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Fetch products (admin only)
export async function fetchProducts(params?: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}): Promise<Page<Product>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.size) searchParams.append("size", params.size.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status) searchParams.append("status", params.status);

  const queryString = searchParams.toString();
  const url = `/products${queryString ? `?${queryString}` : ""}`;

  const response = await apiFetch(url);

  if (!response.ok) {
    await handleApiError(response, "Failed to fetch products");
  }

  return response.json();
}

// Get product by ID
export async function getProductById(productId: number): Promise<Product> {
  const response = await apiFetch(`/products/${productId}`);

  if (!response.ok) {
    await handleApiError(response, "Failed to fetch product");
  }

  return response.json();
}

// Delete a product (admin only)
// This performs a soft delete - sets deleted=true and status=DISCONTINUED
export async function deleteProduct(productId: number): Promise<void> {
  const response = await apiFetch(`/products/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Access denied - Admin role required");
    }
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    await handleApiError(response, "Failed to delete product");
  }
}

// Fetch product statistics (admin only)
export async function fetchProductStatistics(): Promise<ProductStatistics> {
  const response = await apiFetch("/products/statistics");

  if (!response.ok) {
    await handleApiError(response, "Failed to fetch statistics");
  }

  return response.json();
}

// Create product request types
export interface CreateProductRequest {
  sku: string;
  sport: string;
  team: string;
  season?: string;
  productType: string;
  productStatus?: string;
  bilingualContent: {
    titleEN: string;
    titleFR: string;
    descriptionEN?: string;
    descriptionFR?: string;
  };
  productImages?: {
    imageUrls?: string[];
    primaryImageUrl?: string;
  };
  isCustomizable?: boolean;
}

// Create a new product (admin only)
export async function createProduct(
  request: CreateProductRequest
): Promise<Product> {
  const response = await apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to create product");
  }

  return response.json();
}

// Update product request type (same as Create)
export type UpdateProductRequest = CreateProductRequest;

// Update an existing product (admin only)
export async function updateProduct(
  productId: number,
  request: UpdateProductRequest
): Promise<Product> {
  const response = await apiFetch(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to update product");
  }

  return response.json();
}

// Update product status (admin only)
// Note: This performs a non-atomic read-then-write operation that can overwrite concurrent changes.
// The function fetches the current product, then sends a full PUT request. If another admin modifies
// the product between these operations, their changes will be lost. This pattern is necessary because
// the backend PUT endpoint requires a complete product payload rather than supporting partial updates.
// For DRAFT products (the primary use case), concurrent edits are unlikely as they're typically owned
// by a single creator. For production-grade safety, consider adding a PATCH endpoint to the backend
// or implementing optimistic concurrency control with ETags.
export async function updateProductStatus(
  productId: number,
  status: string
): Promise<Product> {
  // First, get the current product data
  const currentProduct = await getProductById(productId);

  // Update only the status
  const response = await apiFetch(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify({
      sku: currentProduct.sku,
      sport: currentProduct.sport,
      team: currentProduct.team,
      season: currentProduct.season,
      productType: currentProduct.productType,
      productStatus: status,
      bilingualContent: {
        titleEN: currentProduct.bilingualContent.titleEN,
        titleFR: currentProduct.bilingualContent.titleFR,
        descriptionEN: currentProduct.bilingualContent.descriptionEN,
        descriptionFR: currentProduct.bilingualContent.descriptionFR,
      },
      productImages: {
        imageUrls: currentProduct.productImages.imageUrls || [],
        primaryImageUrl: currentProduct.productImages.primaryImageUrl,
      },
      isCustomizable: currentProduct.isCustomizable,
    }),
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to update product status");
  }

  return response.json();
}

// Create product variant request types
export interface CreateProductVariantRequest {
  size: string;
  color: string;
  basePrice: {
    amount: number;
    currency: string;
  };
}

// Update product variant request types
export interface UpdateProductVariantRequest {
  size?: string;
  color?: string;
  basePrice?: {
    amount: number;
    currency: string;
  };
}

// Create stock item request types
export interface CreateStockItemRequest {
  variantId: string;
  initialQuantity: number;
  reorderPoint?: number;
}

// Update stock item request types
export interface UpdateStockItemRequest {
  reorderPoint?: number;
}

// Stock adjustment request types
export interface StockAdjustmentRequest {
  quantity: number;
  reason: string;
}

// Stock item response type
export interface StockItem {
  id: number;
  inventoryId: number;
  variantId: string;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create a new product variant (admin only)
export async function createProductVariant(
  productId: number,
  request: CreateProductVariantRequest
): Promise<{ variantId: string; id: number }> {
  const response = await apiFetch(`/products/${productId}/variants`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to create product variant");
  }

  return response.json();
}

// Update an existing product variant (admin only)
export async function updateProductVariant(
  variantId: number,
  request: UpdateProductVariantRequest
): Promise<unknown> {
  const response = await apiFetch(`/products/variants/${variantId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to update product variant");
  }

  return response.json();
}

// Create stock item for a variant (admin only)
export async function createStockItem(
  inventoryId: number,
  request: CreateStockItemRequest
): Promise<unknown> {
  const response = await apiFetch(`/admin/inventory/${inventoryId}/stock`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to create stock item");
  }

  return response.json();
}

// Get stock item by variant ID
export async function getStockByVariantId(
  variantId: string
): Promise<StockItem> {
  const response = await apiFetch(`/inventory/stock/variant/${variantId}`);

  if (!response.ok) {
    await handleApiError(response, "Failed to fetch stock item");
  }

  return response.json();
}

// Update stock item (admin only)
export async function updateStockItem(
  stockId: number,
  request: UpdateStockItemRequest
): Promise<StockItem> {
  const response = await apiFetch(`/admin/inventory/stock/${stockId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to update stock item");
  }

  return response.json();
}

// Adjust stock quantity (admin only)
export async function adjustStock(
  stockId: number,
  request: StockAdjustmentRequest
): Promise<StockItem> {
  const response = await apiFetch(
    `/admin/inventory/stock/${stockId}/adjust`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    await handleApiError(response, "Failed to adjust stock");
  }

  return response.json();
}

// ============== Admin Order API ==============

import type { AdminOrder, OrderStatus } from "@/types/order";

// Fetch admin orders with pagination and optional status filter
export async function fetchAdminOrders(params?: {
  page?: number;
  size?: number;
  status?: OrderStatus;
  includeDeleted?: boolean;
  includeArchived?: boolean;
}): Promise<Page<AdminOrder>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.append("page", params.page.toString());
  if (params?.size !== undefined) searchParams.append("size", params.size.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.includeDeleted !== undefined && params.includeDeleted) {
    searchParams.append("includeDeleted", "true");
  }
  if (params?.includeArchived !== undefined && params.includeArchived) {
    searchParams.append("includeArchived", "true");
  }

  const queryString = searchParams.toString();
  const url = `/admin/orders${queryString ? `?${queryString}` : ""}`;

  const response = await apiFetch(url);

  if (!response.ok) {
    await handleApiError(response, "Failed to fetch orders");
  }

  return response.json();
}

// Fetch single order by ID for admin
export async function fetchAdminOrderById(orderId: number): Promise<AdminOrder> {
  const response = await apiFetch(`/admin/orders/${orderId}`);

  if (!response.ok) {
    await handleApiError(response, "Failed to fetch order");
  }

  return response.json();
}

// Update order status (admin only)
export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<AdminOrder> {
  const response = await apiFetch(`/admin/orders/${orderId}/status?status=${status}`, {
    method: "PUT",
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to update order status");
  }

  return response.json();
}

// Soft delete an order
export async function softDeleteOrder(orderId: number): Promise<void> {
  const response = await apiFetch(`/admin/orders/${orderId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to delete order");
  }
}

// Hard delete an order (permanent)
export async function hardDeleteOrder(orderId: number): Promise<void> {
  const response = await apiFetch(`/admin/orders/${orderId}/permanent`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to permanently delete order");
  }
}

// Restore a soft-deleted order
export async function restoreOrder(orderId: number): Promise<AdminOrder> {
  const response = await apiFetch(`/admin/orders/${orderId}/restore`, {
    method: "POST",
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to restore order");
  }

  return response.json();
}

// Archive an order
export async function archiveOrder(orderId: number): Promise<AdminOrder> {
  const response = await apiFetch(`/admin/orders/${orderId}/archive`, {
    method: "POST",
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to archive order");
  }

  return response.json();
}

// Unarchive an order
export async function unarchiveOrder(orderId: number): Promise<AdminOrder> {
  const response = await apiFetch(`/admin/orders/${orderId}/unarchive`, {
    method: "POST",
  });

  if (!response.ok) {
    await handleApiError(response, "Failed to unarchive order");
  }

  return response.json();
}

// ============== Low Stock API ==============

// Low stock item with product/variant info
export interface LowStockItem {
  id: number;
  inventoryId: number;
  variantId: string;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  createdAt: string;
  updatedAt: string;
  // Product and variant information
  productId?: number;
  productName?: string;
  productImageUrl?: string;
  variantSize?: string;
  variantColor?: string;
}

// Fetch low stock items with product information (admin only)
export async function fetchLowStockItems(): Promise<LowStockItem[]> {
  const response = await apiFetch("/admin/inventory/stock/low/with-product-info");

  if (!response.ok) {
    await handleApiError(response, "Failed to fetch low stock items");
  }

  return response.json();
}
