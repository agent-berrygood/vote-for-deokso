'use server';

import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const POSITION_ORDER = ['장로', '안수집사', '권사'];

export async function verifyVoterInfo(
    name: string,
    phone: string,
    birthdate: string,
    electionId: string
): Promise<{
    success: boolean;
    message?: string;
    voterId?: string;
    allVotesCompleted?: boolean;
    participated?: Record<string, boolean>;
}> {
    try {
        const cleanName = name.trim();
        const cleanPhone = phone.trim();
        const cleanBirthdate = birthdate.trim();

        if (!cleanName || !cleanPhone || !cleanBirthdate || !electionId) {
            return { success: false, message: '모든 정보를 입력해주세요.' };
        }

        // 1. Firestore 선거인 명부 대조
        const votersRef = collection(db, `elections/${electionId}/voters`);
        const q = query(
            votersRef,
            where('name', '==', cleanName),
            where('phone', '==', cleanPhone),
            where('birthdate', '==', cleanBirthdate)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, message: '등록된 선거인 정보가 없습니다. (이름, 전화번호, 생년월일 확인)' };
        }

        const voterDoc = snapshot.docs[0];
        const voterData = voterDoc.data();
        const participated = voterData.participated || {};

        // 2. 현재 선거 설정(라운드 정보) 조회
        const settingsSnap = await getDoc(doc(db, `elections/${electionId}/settings`, 'config'));
        const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};
        const rounds: Record<string, number> = settingsData.rounds || { '장로': 1, '권사': 1, '안수집사': 1 };

        // 3. 모든 직분의 현재 라운드 투표 완료 여부 확인
        const allVotesCompleted = POSITION_ORDER.every((pos) => {
            const round = rounds[pos] || 1;
            const groupKey = `${pos}_${round}`;
            return participated[groupKey] === true;
        });

        return {
            success: true,
            voterId: voterDoc.id,
            allVotesCompleted,
            participated,
        };
    } catch (error) {
        console.error('verifyVoterInfo error:', error);
        return { success: false, message: '선거인 확인 중 오류가 발생했습니다.' };
    }
}

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

/**
 * 민감한 어드민 액션(데이터 초기화 등) 수행 전 비밀번호 재확인
 * 기존 세션 유효성 + 비밀번호 일치 여부를 동시에 검증
 */
export async function reAuthenticateAdmin(password: string): Promise<{ success: boolean; message?: string }> {
    try {
        const cookieStore = await cookies();
        const adminAuthCookie = cookieStore.get('admin_auth');

        if (!adminAuthCookie?.value) {
            return { success: false, message: '인증 세션이 만료되었습니다. 다시 로그인해주세요.' };
        }

        // 1. 기존 세션(JWT) 유효성 재확인
        const { verifyToken } = await import('@/lib/auth');
        const payload = await verifyToken(adminAuthCookie.value);
        if (!payload || payload.role !== 'admin') {
            return { success: false, message: '유효하지 않은 관리자 세션입니다. 다시 로그인해주세요.' };
        }

        // 2. 비밀번호 재확인
        const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD || 'vote2026';
        if (password !== CORRECT_PASSWORD) {
            return { success: false, message: '비밀번호가 일치하지 않습니다.' };
        }

        return { success: true };
    } catch (error) {
        console.error('reAuthenticateAdmin error:', error);
        return { success: false, message: '재인증 처리 중 오류가 발생했습니다.' };
    }
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Failed to create secure session: ${errorMsg}` };
    }
}

export async function clearVoterSession() {
    const cookieStore = await cookies();
    cookieStore.delete('voter_token');
    return { success: true };
}

export async function loginWithMasterPasskey(
    name: string,
    phone: string,
    birthdate: string,
    electionId: string,
    passkey: string
) {
    const MASTER_PASSKEY = process.env.MASTER_PASSKEY || 'vote2026admin';

    if (passkey !== MASTER_PASSKEY) {
        return { success: false, message: '마스터 패스키가 일치하지 않습니다.' };
    }

    // 1. Verify Voter Info exactly like verifyVoterInfo
    const verifyResult = await verifyVoterInfo(name, phone, birthdate, electionId);

    if (!verifyResult.success) {
        return verifyResult;
    }

    if (verifyResult.allVotesCompleted) {
        return { success: false, message: '이미 모든 투표를 완료하셨습니다.' };
    }

    // 2. Create Voter Session bypassing SMS
    const sessionResult = await createVoterSession(verifyResult.voterId!, electionId, name);

    if (!sessionResult.success) {
        return sessionResult;
    }

    return {
        success: true,
        voterId: verifyResult.voterId!
    };
}
