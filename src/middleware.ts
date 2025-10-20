/**
 * Authentication Middleware
 *
 * Protects routes that require authentication to YOUR backend.
 * Note: This is separate from SMART on FHIR authentication.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Routes that require authentication to your backend
const protectedRoutes = ['/patient', '/dashboard', '/settings'];

// Public routes that don't require auth
const publicRoutes = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/smart/login',
  '/auth/smart/callback',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Check session
  try {
    const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!sessionResponse.ok) {
      // Redirect to sign in with return URL
      const signInUrl = new URL('/auth/sign-in', request.url);
      signInUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const session = await sessionResponse.json();

    if (!session?.user) {
      // Redirect to sign in with return URL
      const signInUrl = new URL('/auth/sign-in', request.url);
      signInUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(signInUrl);
    }
  } catch (error) {
    // On error, redirect to sign in
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
