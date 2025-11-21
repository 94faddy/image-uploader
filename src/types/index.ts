// src/types/index.ts
// TypeScript types สำหรับทั้งโปรเจค

export interface ImageData {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  originalPath: string;
  thumbnailPath: string | null;
  mediumPath: string | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  mediumWidth: number | null;
  mediumHeight: number | null;
  deleteToken: string;
  viewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  images?: ImageData[];
  errors?: UploadError[];
}

export interface UploadError {
  fileName: string;
  error: string;
}

export interface ImageLinks {
  viewer: string;
  direct: string;
  thumbnail: string;
  medium: string;
}

export interface ImageCodes {
  html: {
    embed: string;
    fullLinked: string;
    mediumLinked: string;
    thumbnailLinked: string;
  };
  markdown: {
    full: string;
    fullLinked: string;
    mediumLinked: string;
    thumbnailLinked: string;
  };
  bbcode: {
    full: string;
    fullLinked: string;
    mediumLinked: string;
    thumbnailLinked: string;
  };
}

export interface Config {
  appName: string;
  appUrl: string;
  appDescription: string;
  maxFileSizeMB: number;
  allowedExtensions: string[];
  uploadDir: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  mediumWidth: number;
  mediumHeight: number;
  enableRateLimit: boolean;
  rateLimitMaxRequests: number;
  rateLimitWindowMs: number;
  imageLinkExpiryDays: number;
  enableMultipleUpload: boolean;
  enableDragDrop: boolean;
  enableClipboardPaste: boolean;
}

export interface UploadStats {
  totalImages: number;
  totalSize: number;
  totalViews: number;
  todayUploads: number;
}

export type ImageSize = 'original' | 'thumbnail' | 'medium';

export interface ProcessedImage {
  original: {
    path: string;
    width: number;
    height: number;
  };
  thumbnail: {
    path: string;
    width: number;
    height: number;
  } | null;
  medium: {
    path: string;
    width: number;
    height: number;
  } | null;
}