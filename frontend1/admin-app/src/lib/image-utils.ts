import { getApiUrl } from "./utils/api-url";

/**
 * Helper to get image URL from file service
 * @param imageName - The name of the image file
 * @returns The full URL to the image
 */
export function getImageUrl(imageName: string): string {
  if (!imageName) return "";
  if (imageName.startsWith("http")) return imageName;

  // Use public endpoint for product images
  // Use centralized helper for normalized API URL
  const apiUrl = getApiUrl();
  return `${apiUrl}/files/products/${imageName}`;
}
