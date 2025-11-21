// src/app/view/[id]/page.tsx
// หน้า Viewer สำหรับดูรูปภาพ

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  Image as ImageIcon,
  Share2,
  Eye,
  Calendar,
  FileType,
  Ruler,
  HardDrive,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { getConfig, formatFileSize, formatDate } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

async function getImage(id: string) {
  const image = await prisma.image.findUnique({
    where: { id },
  })
  
  if (image) {
    // Increment view count
    await prisma.image.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
  }
  
  return image
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const config = getConfig()
  const image = await prisma.image.findUnique({
    where: { id: params.id },
  })
  
  if (!image) {
    return {
      title: 'Image Not Found',
    }
  }
  
  return {
    title: `${image.originalName} - ${config.appName}`,
    description: `View ${image.originalName} on ${config.appName}`,
    openGraph: {
      title: image.originalName,
      description: `${image.width} × ${image.height} - ${formatFileSize(image.size)}`,
      images: [
        {
          url: `${config.appUrl}/uploads/${image.originalPath}`,
          width: image.width,
          height: image.height,
          alt: image.originalName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: image.originalName,
      images: [`${config.appUrl}/uploads/${image.originalPath}`],
    },
  }
}

export default async function ViewPage({ params }: PageProps) {
  const config = getConfig()
  const image = await getImage(params.id)

  if (!image) {
    notFound()
  }

  // Check if expired
  if (image.expiresAt && image.expiresAt < new Date()) {
    notFound()
  }

  const directLink = `${config.appUrl}/uploads/${image.originalPath}`

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">{config.appName}</span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <a
                href={directLink}
                download={image.originalName}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
              <a
                href={directLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open Original</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Image Section */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="relative max-w-full max-h-[80vh]">
            <img
              src={directLink}
              alt={image.originalName}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-96 bg-gray-800 p-6 lg:border-l border-gray-700">
          <div className="space-y-6">
            {/* Image Title */}
            <div>
              <h1 className="text-xl font-bold text-white break-all mb-2">
                {image.originalName}
              </h1>
              <p className="text-sm text-gray-400">
                Uploaded {formatDate(image.createdAt)}
              </p>
            </div>

            {/* Image Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Ruler className="w-4 h-4" />
                  <span className="text-xs">Dimensions</span>
                </div>
                <p className="text-white font-semibold">
                  {image.width} × {image.height}
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-xs">Size</span>
                </div>
                <p className="text-white font-semibold">
                  {formatFileSize(image.size)}
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <FileType className="w-4 h-4" />
                  <span className="text-xs">Type</span>
                </div>
                <p className="text-white font-semibold">
                  {image.mimeType.split('/')[1].toUpperCase()}
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Views</span>
                </div>
                <p className="text-white font-semibold">
                  {(image.viewCount + 1).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Direct Link */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Direct Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={directLink}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
            </div>

            {/* Share Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Share
              </label>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(directLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#4267B2] hover:bg-[#375695] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(directLink)}&media=${encodeURIComponent(directLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#E60023] hover:bg-[#c5001f] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Pinterest
                </a>
              </div>
            </div>

            {/* Get Embed Codes Link */}
            <div className="pt-4 border-t border-gray-700">
              <Link
                href={`/image/${image.id}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white rounded-xl font-medium transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span>Get Embed Codes</span>
              </Link>
            </div>

            {/* Upload More */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Upload More Images</span>
            </Link>
          </div>
        </aside>
      </main>
    </div>
  )
}