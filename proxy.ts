import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const userCookie = request.cookies.get("user")?.value;


  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/properties" ||
    pathname.startsWith("/properties/");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let role: string | null = null;

  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      role = user.role;
    } catch {
      role = null;
    }
  }

  if (pathname.startsWith("/tenant")) {
    if (role !== "TENANT") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/landlord")) {
    if (role !== "LANDLORD") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};