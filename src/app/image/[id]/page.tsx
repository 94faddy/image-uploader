// src/app/image/[id]/page.tsx
// หน้าจัดการ links ของรูปภาพที่ upload แล้ว

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Calendar, 
  Eye, 
  Download,
  FileType,
  Ruler,
  HardDrive,
  Trash2,
  ExternalLink,
  Share2,
  CheckCircle
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { getConfig, formatFileSize, formatDate } from '@/lib/utils'
import Header from '@/components/Header'
import LinkManager from '@/components/LinkManager'

interface PageProps {
  params: { id: string }
}

async function getImage(id: string) {
  const image = await prisma.image.findUnique({
    where: { id },
  })
  return image
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const image = await getImage(params.id)
  const config = getConfig()
  
  if (!image) {
    return {
      title: 'Image Not Found',
    }
  }
  
  return {
    title: `${image.originalName} - ${config.appName}`,
    description: `View and share ${image.originalName} on ${config.appName}`,
    openGraph: {
      title: image.originalName,
      images: [`${config.appUrl}/uploads/${image.originalPath}`],
    },
  }
}

export default async function ImagePage({ params }: PageProps) {
  const config = getConfig()
  const image = await getImage(params.id)

  if (!image) {
    notFound()
  }

  // Check if expired
  if (image.expiresAt && image.expiresAt < new Date()) {
    notFound()
  }

  const links = {
    viewer: `${config.appUrl}/view/${image.id}`,
    direct: `${config.appUrl}/uploads/${image.originalPath}`,
    thumbnail: image.thumbnailPath 
      ? `${config.appUrl}/uploads/${image.thumbnailPath}`
      : `${config.appUrl}/uploads/${image.originalPath}`,
    medium: image.mediumPath 
      ? `${config.appUrl}/uploads/${image.mediumPath}`
      : `${config.appUrl}/uploads/${image.originalPath}`,
  }

  const imageInfo = [
    { 
      icon: <FileType className="w-4 h-4" />, 
      label: 'Type', 
      value: image.mimeType.split('/')[1].toUpperCase() 
    },
    { 
      icon: <Ruler className="w-4 h-4" />, 
      label: 'Dimensions', 
      value: `${image.width} × ${image.height} px` 
    },
    { 
      icon: <HardDrive className="w-4 h-4" />, 
      label: 'Size', 
      value: formatFileSize(image.size) 
    },
    { 
      icon: <Eye className="w-4 h-4" />, 
      label: 'Views', 
      value: image.viewCount.toLocaleString() 
    },
    { 
      icon: <Calendar className="w-4 h-4" />, 
      label: 'Uploaded', 
      value: formatDate(image.createdAt) 
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header appName={config.appName} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload more images</span>
        </Link>

        {/* Success Banner */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-green-800">Upload Successful!</h2>
              <p className="text-green-700 text-sm">
                Your image has been uploaded and is ready to share.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Preview */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="card-premium-lg overflow-hidden">
              <div className="relative bg-gray-100">
                <img
                  src={links.direct}
                  alt={image.originalName}
                  className="w-full h-auto"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                />
              </div>
              
              {/* Image Info */}
              <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900 mb-4 break-all">
                  {image.originalName}
                </h1>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {imageInfo.map((info, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400">{info.icon}</span>
                      <div>
                        <div className="text-xs text-gray-500">{info.label}</div>
                        <div className="text-sm font-medium">{info.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Thumbnail & Medium Previews */}
            <div className="grid grid-cols-2 gap-4">
              {/* Thumbnail */}
              <div className="card-premium p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Thumbnail
                </h3>
                <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center">
                  <img
                    src={links.thumbnail}
                    alt="Thumbnail"
                    className="max-w-full h-auto rounded"
                    style={{ maxHeight: '150px' }}
                  />
                </div>
                {image.thumbnailWidth && image.thumbnailHeight && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {image.thumbnailWidth} × {image.thumbnailHeight} px
                  </p>
                )}
              </div>

              {/* Medium */}
              <div className="card-premium p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Medium
                </h3>
                <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center">
                  <img
                    src={links.medium}
                    alt="Medium"
                    className="max-w-full h-auto rounded"
                    style={{ maxHeight: '150px' }}
                  />
                </div>
                {image.mediumWidth && image.mediumHeight && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {image.mediumWidth} × {image.mediumHeight} px
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Link Manager */}
          <div className="space-y-6">
            <div className="card-premium-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary-500" />
                Share Your Image
              </h2>
              
              <LinkManager links={links} imageName={image.originalName} />
            </div>

            {/* Delete Section */}
            <div className="card-premium p-6 border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Delete Image
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                To delete this image, use the following link. This action cannot be undone.
              </p>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <code className="text-xs text-red-700 break-all">
                  {`${config.appUrl}/api/image/${image.id}?token=${image.deleteToken}`}
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Keep this delete link safe. Anyone with this link can delete your image.
              </p>
            </div>
          </div>
        </div>

        {/* Upload More CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ImageIcon className="w-5 h-5" />
            <span>Upload More Images</span>
          </Link>
        </div>
      </main>
    </div>
  )
}