'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ImageIcon, 
  Menu, 
  X, 
  Upload, 
  Info,
  Sparkles
} from 'lucide-react'

interface HeaderProps {
  appName?: string
}

export default function Header({ appName = 'ImageHost Pro' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <Sparkles className="w-3 h-3 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {appName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="font-medium">Upload</span>
            </Link>
            <Link 
              href="#features"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="font-medium">Features</span>
            </Link>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Upload</span>
              </Link>
              <Link 
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Info className="w-5 h-5" />
                <span className="font-medium">Features</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}