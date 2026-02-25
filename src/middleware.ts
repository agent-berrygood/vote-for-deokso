import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Admin routes protection
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const adminAuthCookie = request.cookies.get('admin_auth');
        let isValidAdmin = false;

        if (adminAuthCookie?.value) {
            const payload = await verifyToken(adminAuthCookie.value);
            if (payload && payload.role === 'admin') {
                // Check explicit expiration: jose already rejects expired tokens,
                // but double-check in case of clock skew
                const exp = payload.exp as number | undefined;
                if (exp && exp > Math.floor(Date.now() / 1000)) {
                    isValidAdmin = true;
                }
            }
        }

        if (!isValidAdmin) {
            const loginUrl = new URL('/admin/login', request.url);
            const response = NextResponse.redirect(loginUrl);

            // Clear invalid/expired/tampered admin cookie on redirect
            response.cookies.delete('admin_auth');

            return response;
        }

        // Prevent caching of authenticated admin pages (back-button bypass prevention)
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    // 2. Voter routes protection
    if (pathname.startsWith('/vote') && !pathname.includes('/vote/')) {
        const voterTokenCookie = request.cookies.get('voter_token');
        let isValidVoter = false;

        if (voterTokenCookie?.value) {
            const payload = await verifyToken(voterTokenCookie.value);
            if (payload && payload.role === 'voter' && payload.voterId && payload.electionId) {
                const exp = payload.exp as number | undefined;
                if (exp && exp > Math.floor(Date.now() / 1000)) {
                    isValidVoter = true;
                }
            }
        }

        if (!isValidVoter) {
            const homeUrl = new URL('/', request.url);
            const response = NextResponse.redirect(homeUrl);

            // Clear invalid/expired voter cookie on redirect
            response.cookies.delete('voter_token');

            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/vote/:path*'],
};
