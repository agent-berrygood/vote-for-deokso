'use server';

import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';

export async function loginAdmin(password: string) {
    const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD || 'vote2026';

    if (password === CORRECT_PASSWORD) {
        const cookieStore = await cookies();

        // Use jose to create a signed JWT payload
        const token = await signToken({ role: 'admin' }, '1d');

        cookieStore.set('admin_auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });
        return { success: true };
    }

    return { success: false, message: '비밀번호가 일치하지 않습니다.' };
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_auth');
    return { success: true };
}

// SMS OTP 성공 후 클라이언트가 호출하여 안전한 인증 쿠키를 생성
export async function createVoterSession(voterId: string, electionId: string, voterName: string) {
    if (!voterId || !electionId) {
        return { success: false, message: 'Invalid session data' };
    }

    try {
        const cookieStore = await cookies();
        const payload = {
            role: 'voter',
            voterId,
            electionId,
            voterName,
        };

        const token = await signToken(payload, '2h'); // 2 hours validity

        cookieStore.set('voter_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 2 // 2 hours
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to create voter session:', error);
        return { success: false, message: 'Failed to create secure session' };
    }
}

export async function clearVoterSession() {
    const cookieStore = await cookies();
    cookieStore.delete('voter_token');
    return { success: true };
}
