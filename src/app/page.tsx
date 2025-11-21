// src/app/page.tsx
// หน้าหลักสำหรับ upload รูปภาพ

import { 
  Sparkles, 
  Zap, 
  Shield, 
  Globe, 
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Share2,
  Clock,
  Infinity,
  Upload,
  CheckCircle
} from 'lucide-react'
import Header from '@/components/Header'
import UploadZone from '@/components/UploadZone'
import { getConfig } from '@/lib/utils'

export default function HomePage() {
  const config = getConfig()

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Upload and share images instantly with our optimized servers',
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'No Login Required',
      description: 'Start uploading immediately without creating an account',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Global CDN',
      description: 'Your images are served from multiple locations worldwide',
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      icon: <LinkIcon className="w-6 h-6" />,
      title: 'Multiple Link Formats',
      description: 'Get direct links, HTML, Markdown, and BBCode formats',
      gradient: 'from-purple-400 to-pink-500',
    },
    {
      icon: <ImageIcon className="w-6 h-6" />,
      title: 'Multiple Sizes',
      description: 'Automatic thumbnail and medium size generation',
      gradient: 'from-red-400 to-rose-500',
    },
    {
      icon: <Infinity className="w-6 h-6" />,
      title: 'Permanent Storage',
      description: 'Your images are stored permanently without expiration',
      gradient: 'from-indigo-400 to-violet-500',
    },
  ]

  const supportedFormats = [
    { name: 'JPEG', color: 'bg-orange-100 text-orange-700' },
    { name: 'PNG', color: 'bg-blue-100 text-blue-700' },
    { name: 'GIF', color: 'bg-green-100 text-green-700' },
    { name: 'WebP', color: 'bg-purple-100 text-purple-700' },
    { name: 'BMP', color: 'bg-red-100 text-red-700' },
    { name: 'SVG', color: 'bg-teal-100 text-teal-700' },
  ]

  return (
    <div className="min-h-screen">
      <Header appName={config.appName} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow animation-delay-2000" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-4000" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Free Premium Image Hosting</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Upload & Share Images
              <span className="block mt-2 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent">
                In Seconds
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {config.appDescription}. Upload up to {config.maxFileSizeMB}MB per file, 
              get instant shareable links in multiple formats.
            </p>

            {/* Supported Formats */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {supportedFormats.map((format) => (
                <span 
                  key={format.name}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${format.color}`}
                >
                  {format.name}
                </span>
              ))}
            </div>
          </div>

          {/* Upload Zone */}
          <div className="card-premium-lg p-6 md:p-10">
            <UploadZone
              maxFileSizeMB={config.maxFileSizeMB}
              allowedExtensions={config.allowedExtensions}
              enableMultiple={config.enableMultipleUpload}
            />
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No registration required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Max {config.maxFileSizeMB}MB per file</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Multiple upload support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Drag & Drop or Paste</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features for seamless image hosting and sharing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card-premium p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to share your images
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary-500/30">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold text-primary-500 mb-2">Step 1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload</h3>
              <p className="text-gray-600">
                Drag & drop, paste, or click to select images from your device
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-accent-500/30">
                <Code className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold text-accent-500 mb-2">Step 2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Links</h3>
              <p className="text-gray-600">
                Instantly receive links in HTML, Markdown, BBCode, and direct URL formats
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-green-500/30">
                <Share2 className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold text-green-500 mb-2">Step 3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Share</h3>
              <p className="text-gray-600">
                Copy and paste the links anywhere to share your images
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{config.appName}</span>
            </div>
            
            <p className="text-gray-400 text-center md:text-right">
              © {new Date().getFullYear()} {config.appName}. All rights reserved.
              <br />
              <span className="text-sm">Free image hosting service</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}