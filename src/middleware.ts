import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/onboarding'
];

// Routes that should redirect authenticated users with completed onboarding
const authRedirectRoutes = [
  '/signin',
  '/signup'
];

export async function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Get the token from cookies
  const token = request.cookies.get('authToken')?.value;
  const hasToken = !!token;
  
  // For protected routes, check if user is authenticated
  if (protectedRoutes.some(route => path.startsWith(route))) {
    if (!hasToken) {
      // Redirect to login if no token
      const url = new URL('/signin', request.url);
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    
    // Allow the request to proceed
    return NextResponse.next();
  }
  
  // For auth routes (signin/signup), redirect to dashboard if already authenticated
  if (authRedirectRoutes.some(route => path.startsWith(route)) && hasToken) {
    // Try to determine where to redirect based on user role (from query param if possible)
    const redirectPath = new URL(request.url).searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  
  // For other routes, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except for static assets, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};