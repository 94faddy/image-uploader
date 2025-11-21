// src/middleware.ts
// Next.js middleware for CORS handling

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Get allowed origins from environment
function getAllowedOrigins(): string[] {
  const originsString = process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:1344';
  return originsString.split(',').map(origin => origin.trim());
}

// Check if origin is allowed
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow same-origin requests
  
  const allowedOrigins = getAllowedOrigins();
  
  if (allowedOrigins.includes('*')) return true;
  if (allowedOrigins.includes(origin)) return true;
  
  return false;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    if (origin && isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.length > 0) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }
  
  // Handle actual requests
  const response = NextResponse.next();
  
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // Same-origin request, allow primary domain
    if (allowedOrigins.length > 0) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
  }
  
  // Block requests from non-allowed origins to API routes
  if (request.nextUrl.pathname.startsWith('/api/') && origin && !isOriginAllowed(origin)) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Origin not allowed' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return response;
}

// Configure which routes to apply middleware
export const config = {
  matcher: [
    '/api/:path*',
    '/uploads/:path*',
  ],
};