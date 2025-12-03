export function middleware(req) {
  return new Response(null, {
    headers: {
      'x-pathname': req.nextUrl.pathname,
      'x-url': req.nextUrl.href,
    },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}