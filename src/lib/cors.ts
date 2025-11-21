// src/lib/cors.ts
// CORS utility functions

import { NextRequest, NextResponse } from 'next/server';

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  allowCredentials: boolean;
  maxAge: number;
}

// Get CORS configuration from environment
export function getCorsConfig(): CorsConfig {
  const originsString = process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:1344';
  const allowedOrigins = originsString.split(',').map(origin => origin.trim());

  return {
    allowedOrigins,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowCredentials: true,
    maxAge: 86400, // 24 hours
  };
}

// Check if origin is allowed
export function isOriginAllowed(origin: string | null, config: CorsConfig): boolean {
  if (!origin) return false;
  
  // Check exact match
  if (config.allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check if wildcard is allowed
  if (config.allowedOrigins.includes('*')) {
    return true;
  }
  
  return false;
}

// Add CORS headers to response
export function addCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  config?: CorsConfig
): NextResponse {
  const corsConfig = config || getCorsConfig();
  const origin = request.headers.get('origin');
  
  // Set allowed origin
  if (origin && isOriginAllowed(origin, corsConfig)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (corsConfig.allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else if (corsConfig.allowedOrigins.length > 0) {
    // Default to first allowed origin if no match
    response.headers.set('Access-Control-Allow-Origin', corsConfig.allowedOrigins[0]);
  }
  
  response.headers.set('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', String(corsConfig.allowCredentials));
  response.headers.set('Access-Control-Max-Age', String(corsConfig.maxAge));
  
  return response;
}

// Handle preflight OPTIONS request
export function handlePreflight(request: NextRequest): NextResponse {
  const config = getCorsConfig();
  const origin = request.headers.get('origin');
  
  const response = new NextResponse(null, { status: 204 });
  
  if (origin && isOriginAllowed(origin, config)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (config.allowedOrigins.length > 0) {
    response.headers.set('Access-Control-Allow-Origin', config.allowedOrigins[0]);
  }
  
  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', String(config.allowCredentials));
  response.headers.set('Access-Control-Max-Age', String(config.maxAge));
  
  return response;
}

// Validate request origin
export function validateOrigin(request: NextRequest): { valid: boolean; origin: string | null } {
  const config = getCorsConfig();
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // If no origin header (same-origin request or server-side)
  if (!origin) {
    // Check referer as fallback
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const refererOrigin = refererUrl.origin;
        return {
          valid: isOriginAllowed(refererOrigin, config),
          origin: refererOrigin,
        };
      } catch {
        return { valid: true, origin: null }; // Allow if can't parse referer
      }
    }
    return { valid: true, origin: null }; // Allow same-origin requests
  }
  
  return {
    valid: isOriginAllowed(origin, config),
    origin,
  };
}