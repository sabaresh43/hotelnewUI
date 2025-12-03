import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { middlewareAuthConfig } from "./auth.middleware";

const { auth } = NextAuth(middlewareAuthConfig);

export default auth((req) => {
  const res = NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  res.headers.set("x-url", req.nextUrl.href);
  return res;
});
