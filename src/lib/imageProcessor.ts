// src/lib/imageProcessor.ts
// Image processing using Sharp

import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { ProcessedImage } from '@/types'
import { getConfig, generateRandomString, sanitizeFileName } from './utils'

interface ProcessOptions {
  buffer: Buffer
  originalName: string
  uploadDir: string
}

// Process uploaded image and create thumbnails
export async function processImage(options: ProcessOptions): Promise<ProcessedImage> {
  const config = getConfig()
  const { buffer, originalName, uploadDir } = options
  
  // Get original image metadata
  const metadata = await sharp(buffer).metadata()
  const originalWidth = metadata.width || 0
  const originalHeight = metadata.height || 0
  
  // ============================================
  // สร้างชื่อไฟล์ใหม่ที่ปลอดภัย (ไม่ใช้ชื่อเดิม)
  // ============================================
  const timestamp = Date.now()
  const randomStr = generateRandomString(8)
  
  // Get extension from original name or detect from buffer
  let ext = path.extname(originalName).toLowerCase()
  if (!ext || ext === '.') {
    // Detect from metadata
    const formatMap: Record<string, string> = {
      'jpeg': '.jpg',
      'png': '.png',
      'gif': '.gif',
      'webp': '.webp',
      'svg': '.svg',
      'bmp': '.bmp',
    }
    ext = formatMap[metadata.format || 'jpeg'] || '.jpg'
  }
  
  // สร้างชื่อไฟล์ใหม่ที่เป็น ASCII เท่านั้น
  const baseName = `${timestamp}_${randomStr}`
  const originalFileName = `${baseName}${ext}`
  
  // Ensure upload directory exists
  await fs.mkdir(uploadDir, { recursive: true })
  
  // Save original image
  const originalPath = path.join(uploadDir, originalFileName)
  await fs.writeFile(originalPath, buffer)
  
  const result: ProcessedImage = {
    original: {
      path: originalFileName,
      width: originalWidth,
      height: originalHeight,
    },
    thumbnail: null,
    medium: null,
  }
  
  // Create thumbnail
  if (originalWidth > config.thumbnailWidth || originalHeight > config.thumbnailHeight) {
    const thumbnailFileName = `${baseName}_thumb${ext}`
    const thumbnailPath = path.join(uploadDir, thumbnailFileName)
    
    const thumbnailBuffer = await sharp(buffer)
      .resize(config.thumbnailWidth, config.thumbnailHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer()
    
    await fs.writeFile(thumbnailPath, thumbnailBuffer)
    
    const thumbMeta = await sharp(thumbnailBuffer).metadata()
    result.thumbnail = {
      path: thumbnailFileName,
      width: thumbMeta.width || config.thumbnailWidth,
      height: thumbMeta.height || config.thumbnailHeight,
    }
  } else {
    result.thumbnail = {
      path: originalFileName,
      width: originalWidth,
      height: originalHeight,
    }
  }
  
  // Create medium size
  if (originalWidth > config.mediumWidth || originalHeight > config.mediumHeight) {
    const mediumFileName = `${baseName}_medium${ext}`
    const mediumPath = path.join(uploadDir, mediumFileName)
    
    const mediumBuffer = await sharp(buffer)
      .resize(config.mediumWidth, config.mediumHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer()
    
    await fs.writeFile(mediumPath, mediumBuffer)
    
    const mediumMeta = await sharp(mediumBuffer).metadata()
    result.medium = {
      path: mediumFileName,
      width: mediumMeta.width || config.mediumWidth,
      height: mediumMeta.height || config.mediumHeight,
    }
  } else {
    result.medium = {
      path: originalFileName,
      width: originalWidth,
      height: originalHeight,
    }
  }
  
  return result
}

// Get image dimensions without processing
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata()
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  }
}

// Validate image format
export async function validateImageFormat(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata()
    const validFormats = ['jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
    return validFormats.includes(metadata.format || '')
  } catch {
    return false
  }
}

// Delete image files
export async function deleteImageFiles(
  uploadDir: string,
  originalPath: string,
  thumbnailPath?: string | null,
  mediumPath?: string | null
): Promise<void> {
  const filesToDelete = [originalPath]
  
  if (thumbnailPath && thumbnailPath !== originalPath) {
    filesToDelete.push(thumbnailPath)
  }
  
  if (mediumPath && mediumPath !== originalPath) {
    filesToDelete.push(mediumPath)
  }
  
  for (const filePath of filesToDelete) {
    try {
      await fs.unlink(path.join(uploadDir, filePath))
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error)
    }
  }
}

// Get image info from file
export async function getImageInfo(filePath: string): Promise<{
  format: string
  width: number
  height: number
  size: number
}> {
  const buffer = await fs.readFile(filePath)
  const metadata = await sharp(buffer).metadata()
  const stats = await fs.stat(filePath)
  
  return {
    format: metadata.format || 'unknown',
    width: metadata.width || 0,
    height: metadata.height || 0,
    size: stats.size,
  }
}