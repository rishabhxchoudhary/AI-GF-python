import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Temporarily disable middleware for development testing
// This allows direct access to all routes without authentication checks

export function middleware(request: NextRequest) {
  // Allow all requests to pass through during development
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
