'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  ImagePlus, 
  CloudUpload, 
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import ImagePreview from './ImagePreview'

interface UploadedImage {
  id: string
  originalName: string
  fileName: string
  size: number
  width: number
  height: number
}

interface UploadZoneProps {
  maxFileSizeMB?: number
  allowedExtensions?: string[]
  enableMultiple?: boolean
  onUploadComplete?: (images: UploadedImage[]) => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function UploadZone({
  maxFileSizeMB = 10,
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  enableMultiple = true,
  onUploadComplete,
}: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const maxSizeBytes = maxFileSizeMB * 1024 * 1024

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    rejectedFiles.forEach((rejection) => {
      const errors = rejection.errors.map((e: any) => e.message).join(', ')
      toast.error(`${rejection.file.name}: ${errors}`)
    })

    if (acceptedFiles.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp'],
      'image/svg+xml': ['.svg'],
    },
    maxSize: maxSizeBytes,
    multiple: enableMultiple,
    noClick: files.length > 0,
    noKeyboard: files.length > 0,
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setFiles([])
    setUploadProgress({})
    setUploadedImages([])
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image')
      return
    }

    setIsUploading(true)
    const uploaded: UploadedImage[] = []

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Upload failed')
        }

        const result = await response.json()
        
        if (result.success && result.images?.[0]) {
          uploaded.push(result.images[0])
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        }
      }

      setUploadedImages(uploaded)
      toast.success(`Successfully uploaded ${uploaded.length} image(s)`)
      
      if (onUploadComplete) {
        onUploadComplete(uploaded)
      }

      if (uploaded.length === 1) {
        window.location.href = `/image/${uploaded[0].id}`
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const imageFiles: File[] = []
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          imageFiles.push(file)
        }
      }
    }

    if (imageFiles.length > 0) {
      setFiles(prev => [...prev, ...imageFiles])
      toast.success(`Pasted ${imageFiles.length} image(s)`)
    }
  }, [])

  return (
    <div className="w-full" onPaste={handlePaste} tabIndex={0}>
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/20' 
            : files.length > 0 
              ? 'border-blue-400 bg-blue-50/50' 
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
            isDragActive 
              ? 'bg-blue-500 text-white scale-110' 
              : 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600'
          }`}>
            {isDragActive ? (
              <CloudUpload className="w-10 h-10 animate-bounce" />
            ) : (
              <ImagePlus className="w-10 h-10" />
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
          </h3>
          <p className="text-gray-500 mb-4">
            or click to browse from your device
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              Max {maxFileSizeMB}MB per file
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {allowedExtensions.join(', ')}
            </span>
            {enableMultiple && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                Multiple files supported
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Tip: You can also paste images from clipboard (Ctrl+V)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Selected Images ({files.length})
            </h4>
            <button
              onClick={clearAll}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file, index) => (
              <ImagePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removeFile(index)}
                isUploading={isUploading}
                uploadProgress={uploadProgress[file.name] || 0}
              />
            ))}
            
            <button
              onClick={open}
              disabled={isUploading}
              className={`aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-all duration-200 ${
                isUploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-medium">Add More</span>
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className={`flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-xl transition-all duration-300 ${
                isUploading || files.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/30 hover:shadow-xl'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span>Upload {files.length} Image{files.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h4 className="text-lg font-semibold text-green-800">
              Upload Complete!
            </h4>
          </div>
          
          <div className="space-y-3">
            {uploadedImages.map((image) => (
              <a
                key={image.id}
                href={`/image/${image.id}`}
                className="block p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{image.originalName}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(image.size)} - {image.width} x {image.height}
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}