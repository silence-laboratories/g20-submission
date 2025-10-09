import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Define protected routes that require authentication
const isProtectedRoute = (pathname: string): boolean => {
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/overview',
    '/dashboard/kanban',
    '/dashboard/apply-loan',
    '/dashboard/product',
    '/dashboard/applications',
    '/dashboard/profile',
    '/dashboard/insights',
    '/register'
  ];

  return protectedRoutes.some((route) => pathname.startsWith(route));
};

// Define public routes that don't require authentication
const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = ['/auth', '/auth/sign-in'];

  // For exact matches or routes that start with the public route
  return publicRoutes.some((route) => {
    if (route === '/') {
      // Only match exact root path
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // If it's a public route, allow access
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // If it's a protected route, check authentication
  if (isProtectedRoute(pathname)) {
    try {
      // Get cookies from the request
      const cookies = req.cookies;
      // Make API call to backend to get current user with credentials
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/auth/me`,
        {
          withCredentials: true,
          headers: {
            Cookie: cookies.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
          }
        }
      );

      if (response.data) {
        // User is authenticated, allow access
        return NextResponse.next();
      } else {
        const signInUrl = new URL('/auth/sign-in', req.url);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      // Authentication failed, redirect to sign-in
      console.log('Authentication failed:', error);
      const signInUrl = new URL('/auth/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // For all other routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
