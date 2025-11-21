// src/app/layout.tsx
// Root layout

import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'ImageHost Pro',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Free Premium Image Hosting Service',
  keywords: ['image hosting', 'free image upload', 'photo sharing', 'image url'],
  authors: [{ name: 'ImageHost Pro' }],
  openGraph: {
    title: process.env.NEXT_PUBLIC_APP_NAME || 'ImageHost Pro',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Free Premium Image Hosting Service',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
        <Toaster 
          position="bottom-right" 
          richColors 
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}