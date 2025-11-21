// src/app/api/upload/route.ts
// API endpoint สำหรับ upload รูปภาพ

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { prisma } from '@/lib/db'
import { processImage, validateImageFormat } from '@/lib/imageProcessor'
import { 
  getConfig, 
  isValidExtension, 
  isValidFileSize, 
  getClientIp,
  calculateExpiryDate,
  generateRandomString
} from '@/lib/utils'
import { addCorsHeaders, handlePreflight, validateOrigin } from '@/lib/cors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request)
}

export async function POST(request: NextRequest) {
  try {
    const config = getConfig()
    const clientIp = getClientIp(request.headers)

    // Validate origin for security
    const originCheck = validateOrigin(request)
    if (!originCheck.valid) {
      const errorResponse = NextResponse.json(
        { success: false, message: 'Origin not allowed' },
        { status: 403 }
      )
      return addCorsHeaders(errorResponse, request)
    }

    // Rate limiting check
    if (config.enableRateLimit) {
      const rateLimitResult = await checkRateLimit(clientIp, config)
      if (!rateLimitResult.allowed) {
        const errorResponse = NextResponse.json(
          { success: false, message: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
        return addCorsHeaders(errorResponse, request)
      }
    }

    // Get form data
    const formData = await request.formData()
    const files = formData.getAll('file') as File[]

    if (files.length === 0) {
      const errorResponse = NextResponse.json(
        { success: false, message: 'No files uploaded' },
        { status: 400 }
      )
      return addCorsHeaders(errorResponse, request)
    }

    const uploadedImages = []
    const errors = []

    for (const file of files) {
      try {
        // Validate file
        if (!file.name || file.size === 0) {
          errors.push({ fileName: file.name || 'unknown', error: 'Invalid file' })
          continue
        }

        // Check file extension
        if (!isValidExtension(file.name, config.allowedExtensions)) {
          errors.push({ 
            fileName: file.name, 
            error: `Invalid file type. Allowed: ${config.allowedExtensions.join(', ')}` 
          })
          continue
        }

        // Check file size
        if (!isValidFileSize(file.size, config.maxFileSizeMB)) {
          errors.push({ 
            fileName: file.name, 
            error: `File too large. Maximum size: ${config.maxFileSizeMB}MB` 
          })
          continue
        }

        // Convert to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Validate image format
        const isValidFormat = await validateImageFormat(buffer)
        if (!isValidFormat) {
          errors.push({ fileName: file.name, error: 'Invalid image format' })
          continue
        }

        // Process image
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        const processedImage = await processImage({
          buffer,
          originalName: file.name,
          uploadDir,
        })

        // Generate unique ID and delete token
        const imageId = uuidv4()
        const deleteToken = generateRandomString(32)

        // Calculate expiry date
        const expiresAt = calculateExpiryDate(config.imageLinkExpiryDays)

        // Save to database
        const image = await prisma.image.create({
          data: {
            id: imageId,
            originalName: file.name,
            fileName: processedImage.original.path,
            mimeType: file.type,
            size: file.size,
            width: processedImage.original.width,
            height: processedImage.original.height,
            originalPath: processedImage.original.path,
            thumbnailPath: processedImage.thumbnail?.path || null,
            mediumPath: processedImage.medium?.path || null,
            thumbnailWidth: processedImage.thumbnail?.width || null,
            thumbnailHeight: processedImage.thumbnail?.height || null,
            mediumWidth: processedImage.medium?.width || null,
            mediumHeight: processedImage.medium?.height || null,
            deleteToken,
            uploaderIp: clientIp,
            expiresAt,
          },
        })

        // Update daily stats
        await updateDailyStats(file.size)

        uploadedImages.push({
          id: image.id,
          originalName: image.originalName,
          fileName: image.fileName,
          size: image.size,
          width: image.width,
          height: image.height,
          thumbnailPath: image.thumbnailPath,
          mediumPath: image.mediumPath,
          deleteToken: image.deleteToken,
          createdAt: image.createdAt,
        })

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        errors.push({ 
          fileName: file.name, 
          error: 'Failed to process image' 
        })
      }
    }

    if (uploadedImages.length === 0) {
      const errorResponse = NextResponse.json(
        { 
          success: false, 
          message: 'No images were uploaded successfully',
          errors 
        },
        { status: 400 }
      )
      return addCorsHeaders(errorResponse, request)
    }

    const successResponse = NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} image(s)`,
      images: uploadedImages,
      errors: errors.length > 0 ? errors : undefined,
    })
    
    return addCorsHeaders(successResponse, request)

  } catch (error) {
    console.error('Upload error:', error)
    const errorResponse = NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, request)
  }
}

// Rate limiting function
async function checkRateLimit(
  ip: string, 
  config: ReturnType<typeof getConfig>
): Promise<{ allowed: boolean }> {
  try {
    const windowStart = new Date(Date.now() - config.rateLimitWindowMs)

    const rateLimit = await prisma.rateLimit.findUnique({
      where: { ipAddress: ip },
    })

    if (!rateLimit) {
      await prisma.rateLimit.create({
        data: {
          ipAddress: ip,
          requestCount: 1,
          windowStart: new Date(),
        },
      })
      return { allowed: true }
    }

    if (rateLimit.windowStart < windowStart) {
      await prisma.rateLimit.update({
        where: { ipAddress: ip },
        data: {
          requestCount: 1,
          windowStart: new Date(),
        },
      })
      return { allowed: true }
    }

    if (rateLimit.requestCount >= config.rateLimitMaxRequests) {
      return { allowed: false }
    }

    await prisma.rateLimit.update({
      where: { ipAddress: ip },
      data: {
        requestCount: { increment: 1 },
      },
    })

    return { allowed: true }
  } catch (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true }
  }
}

// Update daily statistics
async function updateDailyStats(fileSize: number): Promise<void> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.uploadStats.upsert({
      where: { date: today },
      update: {
        totalUploads: { increment: 1 },
        totalSize: { increment: BigInt(fileSize) },
      },
      create: {
        date: today,
        totalUploads: 1,
        totalSize: BigInt(fileSize),
      },
    })
  } catch (error) {
    console.error('Failed to update stats:', error)
  }
}