/** @type {import('next').NextConfig} */

// Parse allowed origins from environment variable
const getAllowedOrigins = () => {
  const origins = process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:1344';
  return origins.split(',').map(origin => origin.trim());
};

// Extract hostname from URL
const getHostnameFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'localhost';
  }
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:1344';
const appHostname = getHostnameFromUrl(appUrl);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: appHostname,
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: process.env.PORT || '1344',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // CORS headers configuration
  async headers() {
    const allowedOrigins = getAllowedOrigins();
    
    return [
      {
        // Apply to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins[0], // Primary origin
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      {
        // Apply to uploaded files
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allow all for images (public)
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig