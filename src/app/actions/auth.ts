'use server';

import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';
import { getVoterByInfoAction, getElectionSettingsAction, createAuditLogAction, getMemberByInfoAction } from './data';

const POSITION_ORDER = ['장로', '안수집사', '권사'] as const;

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
        const normalizedInputName = name.replace(/\s+/g, '');
        const cleanPhone = phone.trim();
        const cleanBirthdate = birthdate.trim();

        if (!normalizedInputName || !cleanPhone || !cleanBirthdate || !electionId) {
            return { success: false, message: '모든 정보를 입력해주세요.' };
        }

        // 1. Data Connect 선거인 명부 대조 (Action)
        const res = await getVoterByInfoAction({ electionId, phone: cleanPhone, birthdate: cleanBirthdate });
        if (!res.success || !res.data) throw new Error(res.error || '선거인 데이터를 불러오지 못했습니다.');
        const voters = res.data;

        if (!voters || voters.length === 0) {
            return { success: false, message: '등록된 선거인 정보가 없습니다. (전화번호, 생년월일 확인)' };
        }

        // 이름 공백 무시 비교
        const voter = (voters as any[]).find((v: any) => {
            const dbName = (v.name || '').replace(/\s+/g, '');
            return dbName === normalizedInputName;
        });

        if (!voter) {
            return { success: false, message: '등록된 선거인 정보가 없습니다. (이름 확인)' };
        }

        // 2. 투표 참여 현황 확인 (SQL 구조에 맞게 추후 고도화 가능)
        // 현재는 participations 관계를 통해 확인
        const participated: Record<string, boolean> = {};
        // (참고: participations 관계 쿼리는 임시 비활성화 상태이므로 기본값 또는 별도 쿼리 필요)

        // 3. 현재 선거 설정 조회 (Action)
        const settingsRes = await getElectionSettingsAction(electionId);
        if (!settingsRes.success || !settingsRes.data) throw new Error(settingsRes.error || '선거 설정을 불러오지 못했습니다.');
        const electionData = settingsRes.data;
        
        const allVotesCompleted = false; // Initial migration state

        return {
            success: true,
            voterId: voter.id,
            allVotesCompleted,
            participated,
        };
    } catch (error) {
        console.error('verifyVoterInfo error:', error);
        return { success: false, message: '선거인 확인 중 오류가 발생했습니다.' };
    }
}

// --- NEW: Survey Login (Member Verification No SMS) ---
export async function verifyMemberInfo(
    name: string,
    phone: string,
    birthdate: string
): Promise<{
    success: boolean;
    message?: string;
    memberId?: string;
}> {
    try {
        const normalizedInputName = name.replace(/\s+/g, '');
        const cleanPhone = phone.trim();
        const cleanBirthdate = birthdate.trim();

        if (!normalizedInputName || !cleanPhone || !cleanBirthdate) {
            return { success: false, message: '모든 정보를 입력해주세요.' };
        }

        const res = await getMemberByInfoAction({ phone: cleanPhone, birthdate: cleanBirthdate });
        if (!res.success || !res.data) throw new Error(res.error || '교인 데이터를 불러오지 못했습니다.');
        const members = res.data;

        if (!members || members.length === 0) {
            return { success: false, message: '등록된 교인 정보가 없습니다. (전화번호, 생년월일 확인)' };
        }

        const member = members.find((m: any) => {
            const dbName = (m.name || '').replace(/\s+/g, '');
            return dbName === normalizedInputName;
        });

        if (!member) {
            return { success: false, message: '등록된 교인 정보가 없습니다. (이름 확인)' };
        }

        return {
            success: true,
            memberId: member.id,
        };
    } catch (error) {
        console.error('verifyMemberInfo error:', error);
        return { success: false, message: '교인 확인 중 오류가 발생했습니다.' };
    }
}


export async function loginAdmin(password: string) {
    const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!CORRECT_PASSWORD) {
        const envKeys = Object.keys(process.env).filter(k => k.includes('ADMIN_') || k.includes('PASS')).join(', ');
        return { success: false, message: `서버 환경 변수(ADMIN_PASSWORD)가 설정되지 않았습니다. (현재 인식된 관련 키: ${envKeys || '없음'})` };
    }

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
        const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD;
        if (!CORRECT_PASSWORD) {
            return { success: false, message: '서버 에러: 관리자 비밀번호가 설정되지 않았습니다.' };
        }
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

// SMS 없이 세션을 바로 발급하는 설문 전용 인증 세션 로직
export async function createSurveySession(memberId: string, memberName: string) {
    if (!memberId) {
        return { success: false, message: 'Invalid session data' };
    }

    try {
        const cookieStore = await cookies();
        const payload = {
            role: 'survey_member',
            memberId,
            memberName,
        };

        const token = await signToken(payload, '2h'); // 2 hours validity

        cookieStore.set('survey_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 2 // 2 hours
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to create survey session:', error);
        return { success: false, message: '세션 생성 중 오류가 발생했습니다.' };
    }
}


export async function loginWithMasterPasskey(
    name: string,
    phone: string,
    birthdate: string,
    electionId: string,
    passkey: string
) {
    const MASTER_PASSKEYS = process.env.MASTER_PASSKEYS;

    if (!MASTER_PASSKEYS) {
        return { success: false, message: '서버 환경 변수가 설정되지 않았습니다.' };
    }

    // Parse PASSKEYS string: "위원A:pass123,위원B:pass456"
    const passkeyPairs = MASTER_PASSKEYS.split(',').map(pair => pair.trim());
    let approvedBy = '';

    for (const pair of passkeyPairs) {
        const [validatorName, validatorKey] = pair.split(':');
        if (validatorKey === passkey) {
            approvedBy = validatorName;
            break;
        }
    }

    if (!approvedBy) {
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

    try {
        await createAuditLogAction({
            electionId: electionId,
            actionType: 'PASSKEY_BYPASS',
            voterId: verifyResult.voterId,
            voterName: name,
            approvedBy: approvedBy,
            ipAddress: 'server_action'
        });
    } catch (auditError) {
        console.error("Failed to write audit log via Action:", auditError);
    }

    return {
        success: true,
        voterId: verifyResult.voterId!
    };
}
