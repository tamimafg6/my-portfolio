// File metadata types matching backend FileMetadata DTO

export interface FileMetadata {
  objectName: string;
  bucket: string;
  size: number;
  contentType: string;
  url: string;
  lastModified: string; // ISO date string from backend
}
