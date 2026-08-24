import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAccessToken, getUser } from '@/lib/auth-helper';

const publicRoutes = ['/', '/login', '/register', '/properties'];

export function proxy(request: NextRequest) {
  const token = getAccessToken();
  const user = getUser();
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const privateRoutes = ['/tenant', '/landlord', '/admin'];
  if (privateRoutes.some((route) => pathname.startsWith(route))) {
    if (!token || !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = user.role?.toLowerCase();
    if (pathname.startsWith('/landlord') && role !== 'landlord') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/tenant') && role !== 'tenant') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};