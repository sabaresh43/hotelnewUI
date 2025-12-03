import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth((req) => {
  const res = NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  res.headers.set("x-url", req.nextUrl.href);
  return res;
});
