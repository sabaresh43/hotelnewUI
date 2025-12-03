import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const res = NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  res.headers.set("x-url", req.nextUrl.href);
  return res;
});
