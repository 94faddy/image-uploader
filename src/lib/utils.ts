// src/lib/utils.ts
// Utility functions

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Config, ImageLinks, ImageCodes } from '@/types'

// Combine class names with Tailwind merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get config from environment variables
export function getConfig(): Config {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'ImageHost',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    appDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Free Image Hosting',
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),
    allowedExtensions: (process.env.ALLOWED_EXTENSIONS || '.jpg,.jpeg,.png,.gif,.webp').split(','),
    uploadDir: process.env.UPLOAD_DIR || './public/uploads',
    thumbnailWidth: parseInt(process.env.THUMBNAIL_WIDTH || '150'),
    thumbnailHeight: parseInt(process.env.THUMBNAIL_HEIGHT || '150'),
    mediumWidth: parseInt(process.env.MEDIUM_WIDTH || '500'),
    mediumHeight: parseInt(process.env.MEDIUM_HEIGHT || '500'),
    enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    imageLinkExpiryDays: parseInt(process.env.IMAGE_LINK_EXPIRY_DAYS || '0'),
    enableMultipleUpload: process.env.ENABLE_MULTIPLE_UPLOAD !== 'false',
    enableDragDrop: process.env.ENABLE_DRAG_DROP !== 'false',
    enableClipboardPaste: process.env.ENABLE_CLIPBOARD_PASTE !== 'false',
  }
}

// Format file size to human readable
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format date to Thai locale
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Generate random string for file names
export function generateRandomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Validate file extension
export function isValidExtension(fileName: string, allowedExtensions: string[]): boolean {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase()
  return allowedExtensions.some(allowed => allowed.toLowerCase() === ext)
}

// Validate file size
export function isValidFileSize(size: number, maxSizeMB: number): boolean {
  return size <= maxSizeMB * 1024 * 1024
}

// Generate image links
export function generateImageLinks(baseUrl: string, imageId: string, fileName: string): ImageLinks {
  const baseName = fileName.split('.')[0]
  const ext = fileName.split('.').pop()
  
  return {
    viewer: `${baseUrl}/view/${imageId}`,
    direct: `${baseUrl}/uploads/${fileName}`,
    thumbnail: `${baseUrl}/uploads/${baseName}_thumb.${ext}`,
    medium: `${baseUrl}/uploads/${baseName}_medium.${ext}`,
  }
}

// Generate all embed codes
export function generateImageCodes(links: ImageLinks, altText: string = 'Image'): ImageCodes {
  return {
    html: {
      embed: `<img src="${links.direct}" alt="${altText}" />`,
      fullLinked: `<a href="${links.viewer}" target="_blank"><img src="${links.direct}" alt="${altText}" /></a>`,
      mediumLinked: `<a href="${links.viewer}" target="_blank"><img src="${links.medium}" alt="${altText}" /></a>`,
      thumbnailLinked: `<a href="${links.viewer}" target="_blank"><img src="${links.thumbnail}" alt="${altText}" /></a>`,
    },
    markdown: {
      full: `![${altText}](${links.direct})`,
      fullLinked: `[![${altText}](${links.direct})](${links.viewer})`,
      mediumLinked: `[![${altText}](${links.medium})](${links.viewer})`,
      thumbnailLinked: `[![${altText}](${links.thumbnail})](${links.viewer})`,
    },
    bbcode: {
      full: `[img]${links.direct}[/img]`,
      fullLinked: `[url=${links.viewer}][img]${links.direct}[/img][/url]`,
      mediumLinked: `[url=${links.viewer}][img]${links.medium}[/img][/url]`,
      thumbnailLinked: `[url=${links.viewer}][img]${links.thumbnail}[/img][/url]`,
    },
  }
}

// Get file extension from MIME type
export function getExtensionFromMime(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg',
  }
  return mimeToExt[mimeType] || 'jpg'
}

// Sanitize filename
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 100)
}

// Get client IP address from headers
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

// Calculate expiry date
export function calculateExpiryDate(days: number): Date | null {
  if (days === 0) return null
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

// Copy text to clipboard (client-side only)
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}