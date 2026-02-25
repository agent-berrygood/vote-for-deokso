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
                isValidAdmin = true;
            }
        }

        if (!isValidAdmin) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // 2. Voter routes protection
    if (pathname.startsWith('/vote') && !pathname.includes('/vote/')) {
        const voterTokenCookie = request.cookies.get('voter_token');
        let isValidVoter = false;

        if (voterTokenCookie?.value) {
            const payload = await verifyToken(voterTokenCookie.value);
            if (payload && payload.role === 'voter' && payload.voterId && payload.electionId) {
                isValidVoter = true;
            }
        }

        if (!isValidVoter) {
            // Unauthenticated or manipulated token, back to SMS verification auth page
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/vote/:path*'],
};

