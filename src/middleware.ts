import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Admin routes protection
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const adminAuthCookie = request.cookies.get('admin_auth');
        if (adminAuthCookie?.value !== 'true') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
