import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname === "/login";
  const isPublicPath = pathname === "/" || pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".");

  if (isPublicPath && !pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const validRoles = ["TA_TEAM", "HIRING_TEAM"];
  if (user && !validRoles.includes(user.role || "")) {
    return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};