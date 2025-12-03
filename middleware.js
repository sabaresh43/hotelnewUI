import { NextResponse } from "next/server";

export function middleware(req) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", req.nextUrl.pathname);
  response.headers.set("x-url", req.nextUrl.href);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}