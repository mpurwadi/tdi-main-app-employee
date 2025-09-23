import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for development
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

export function middleware(request: NextRequest) {
  // Debug logging
  console.log('Middleware processing request:', request.nextUrl.pathname);
  console.log('Request cookies:', request.cookies);
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*'
      }
    });
    
    // Ensure credentials are allowed for API requests
    if (request.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return response;
  }

  // For all other requests, add CORS headers
  const response = NextResponse.next();
  
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // For API requests, we need to ensure credentials are handled properly
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    // Set the origin dynamically to avoid CORS issues
    const origin = request.headers.get('origin');
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
  }

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};