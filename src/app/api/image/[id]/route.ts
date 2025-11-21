// src/app/api/image/[id]/route.ts
// API endpoint สำหรับดึงข้อมูลรูปภาพ และลบรูปภาพ

import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { prisma } from '@/lib/db'
import { deleteImageFiles } from '@/lib/imageProcessor'
import { getConfig } from '@/lib/utils'
import { addCorsHeaders, handlePreflight } from '@/lib/cors'

export const runtime = 'nodejs'

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request)
}

// GET - ดึงข้อมูลรูปภาพ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const image = await prisma.image.findUnique({
      where: { id },
    })

    if (!image) {
      const errorResponse = NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      )
      return addCorsHeaders(errorResponse, request)
    }

    // Check if image has expired
    if (image.expiresAt && image.expiresAt < new Date()) {
      const errorResponse = NextResponse.json(
        { success: false, message: 'Image has expired' },
        { status: 410 }
      )
      return addCorsHeaders(errorResponse, request)
    }

    // Increment view count
    await prisma.image.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // Update daily stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    await prisma.uploadStats.upsert({
      where: { date: today },
      update: { totalViews: { increment: 1 } },
      create: {
        date: today,
        totalViews: 1,
      },
    })

    const config = getConfig()
    const baseUrl = config.appUrl

    const successResponse = NextResponse.json({
      success: true,
      image: {
        id: image.id,
        originalName: image.originalName,
        fileName: image.fileName,
        mimeType: image.mimeType,
        size: image.size,
        width: image.width,
        height: image.height,
        thumbnailWidth: image.thumbnailWidth,
        thumbnailHeight: image.thumbnailHeight,
        mediumWidth: image.mediumWidth,
        mediumHeight: image.mediumHeight,
        viewCount: image.viewCount + 1,
        downloadCount: image.downloadCount,
        createdAt: image.createdAt,
        expiresAt: image.expiresAt,
        links: {
          viewer: `${baseUrl}/view/${image.id}`,
          direct: `${baseUrl}/uploads/${image.originalPath}`,
          thumbnail: image.thumbnailPath 
            ? `${baseUrl}/uploads/${image.thumbnailPath}`
            : `${baseUrl}/uploads/${image.originalPath}`,
          medium: image.mediumPath 
            ? `${baseUrl}/uploads/${image.mediumPath}`
            : `${baseUrl}/uploads/${image.originalPath}`,
        },
      },
    })

    return addCorsHeaders(successResponse, request)

  } catch (error) {
    console.error('Error fetching image:', error)
    const errorResponse = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, request)
  }
}

// DELETE - ลบรูปภาพ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const deleteToken = searchParams.get('token')

    if (!deleteToken) {
      const errorResponse = NextResponse.json(
        { success: false, message: 'Delete token is required' },
        { status: 400 }
      )
      return addCorsHeaders(errorResponse, request)
    }

    const image = await prisma.image.findUnique({
      where: { id },
    })

    if (!image) {
      const errorResponse = NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      )
      return addCorsHeaders(errorResponse, request)
    }

    // Verify delete token
    if (image.deleteToken !== deleteToken) {
      const errorResponse = NextResponse.json(
        { success: false, message: 'Invalid delete token' },
        { status: 403 }
      )
      return addCorsHeaders(errorResponse, request)
    }

    // Delete image files
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await deleteImageFiles(
      uploadDir,
      image.originalPath,
      image.thumbnailPath,
      image.mediumPath
    )

    // Delete from database
    await prisma.image.delete({
      where: { id },
    })

    const successResponse = NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })

    return addCorsHeaders(successResponse, request)

  } catch (error) {
    console.error('Error deleting image:', error)
    const errorResponse = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, request)
  }
}