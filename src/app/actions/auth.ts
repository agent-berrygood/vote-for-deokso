'use server';

import { cookies } from 'next/headers';

export async function loginAdmin(password: string) {
    const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD || 'vote2026';

    if (password === CORRECT_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set('admin_auth', 'true', {
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
