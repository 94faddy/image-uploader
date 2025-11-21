// src/app/api/stats/route.ts
// API endpoint สำหรับดึงสถิติ

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addCorsHeaders, handlePreflight } from '@/lib/cors'

export const runtime = 'nodejs'

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request)
}

export async function GET(request: NextRequest) {
  try {
    // Get total counts
    const [totalImages, totalStats] = await Promise.all([
      prisma.image.count(),
      prisma.image.aggregate({
        _sum: {
          size: true,
          viewCount: true,
          downloadCount: true,
        },
      }),
    ])

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStats = await prisma.uploadStats.findUnique({
      where: { date: today },
    })

    // Get recent uploads
    const recentUploads = await prisma.image.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        size: true,
        width: true,
        height: true,
        createdAt: true,
        viewCount: true,
      },
    })

    const successResponse = NextResponse.json({
      success: true,
      stats: {
        totalImages,
        totalSize: totalStats._sum.size || 0,
        totalViews: totalStats._sum.viewCount || 0,
        totalDownloads: totalStats._sum.downloadCount || 0,
        todayUploads: todayStats?.totalUploads || 0,
        todayViews: todayStats?.totalViews || 0,
        recentUploads,
      },
    })

    return addCorsHeaders(successResponse, request)

  } catch (error) {
    console.error('Error fetching stats:', error)
    const errorResponse = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse, request)
  }
}