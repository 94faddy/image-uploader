// src/app/api/image/[id]/route.ts
// API endpoint สำหรับดึงข้อมูลรูปภาพ และลบรูปภาพ

import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { prisma } from '@/lib/db'
import { deleteImageFiles } from '@/lib/imageProcessor'
import { getConfig } from '@/lib/utils'

export const runtime = 'nodejs'

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
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      )
    }

    // Check if image has expired
    if (image.expiresAt && image.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Image has expired' },
        { status: 410 }
      )
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

    return NextResponse.json({
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

  } catch (error) {
    console.error('Error fetching image:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { success: false, message: 'Delete token is required' },
        { status: 400 }
      )
    }

    const image = await prisma.image.findUnique({
      where: { id },
    })

    if (!image) {
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      )
    }

    // Verify delete token
    if (image.deleteToken !== deleteToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid delete token' },
        { status: 403 }
      )
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

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}