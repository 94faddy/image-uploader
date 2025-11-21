'use client'

import { useState } from 'react'
import { 
  X, 
  Eye, 
  Trash2, 
  ImageIcon,
  Loader2
} from 'lucide-react'

interface ImagePreviewProps {
  file?: File
  imageUrl?: string
  fileName?: string
  fileSize?: number
  width?: number
  height?: number
  onRemove?: () => void
  isUploading?: boolean
  uploadProgress?: number
  showActions?: boolean
  className?: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function ImagePreview({
  file,
  imageUrl,
  fileName,
  fileSize,
  width,
  height,
  onRemove,
  isUploading = false,
  uploadProgress = 0,
  showActions = true,
  className = '',
}: ImagePreviewProps) {
  const [previewUrl] = useState(() => {
    if (imageUrl) return imageUrl
    if (file) return URL.createObjectURL(file)
    return ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const displayName = fileName || file?.name || 'Image'
  const displaySize = fileSize || file?.size || 0

  return (
    <div className={`relative group rounded-xl overflow-hidden bg-gray-100 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-200 ${className}`}>
      <div className="relative aspect-square">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span className="text-sm">Failed to load</span>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt={displayName}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
            }}
          />
        )}

        {showActions && !isUploading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button 
              className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
              onClick={() => window.open(previewUrl, '_blank')}
              title="View Full Size"
            >
              <Eye className="w-5 h-5 text-gray-700" />
            </button>
            {onRemove && (
              <button 
                className="p-2 bg-red-500/90 rounded-lg hover:bg-red-500 transition-colors"
                onClick={onRemove}
                title="Remove"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
            <div className="w-3/4 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-white text-sm mt-2">{uploadProgress}%</span>
          </div>
        )}

        {onRemove && !isUploading && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-3 bg-white">
        <p className="text-sm font-medium text-gray-800 truncate" title={displayName}>
          {displayName}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {formatFileSize(displaySize)}
          </span>
          {width && height && (
            <span className="text-xs text-gray-500">
              {width} x {height}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}