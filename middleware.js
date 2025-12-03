import { NextResponse } from "next/server";

// This middleware must run in Edge Runtime
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon files, or manifest files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|manifest)).*)',
  ],
};

export function middleware(request) {
  const response = NextResponse.next();

  // Add custom headers
  response.headers.set("x-pathname", request.nextUrl.pathname);
  response.headers.set("x-url", request.nextUrl.href);

  return response;
}
