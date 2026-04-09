'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getElectionSettingsAction, submitVoteSQLAction } from './data';

const POSITION_ORDER = ['장로', '안수집사', '권사'] as const;

export async function submitVoteAction(votes: Record<string, string[]>) {
    try {
        const cookieStore = await cookies();
        const voterToken = cookieStore.get('voter_token');

        if (!voterToken?.value) {
            return { success: false, message: '인증 정보가 없습니다. 다시 로그인해주세요.' };
        }

        // 1. JWT 검증
        const payload = await verifyToken(voterToken.value);
        if (!payload || payload.role !== 'voter' || !payload.voterId || !payload.electionId) {
            return { success: false, message: '유효하지 않은 인증 세션입니다.' };
        }

        const { voterId, electionId } = payload;

        // 2. 선거 설정 가져오기 (Action)
        const settingsRes = await getElectionSettingsAction(electionId as string);
        if (!settingsRes.success) throw new Error(settingsRes.error);
        const electionData = settingsRes.data;

        if (!electionData) {
            return { success: false, message: '선거 설정을 찾을 수 없습니다.' };
        }

        // 투표 종료 시간 체크
        if (electionData.endDate) {
            const now = new Date();
            const end = new Date(electionData.endDate);
            if (now > end) {
                return { success: false, message: '투표 시간이 종료되었습니다.' };
            }
        }

        // 3. 투표 및 참여 기록 생성 (Data Connect)
        // 현재는 서버 액션에서 각 직분별로 뮤테이션 호출
        for (const pos of POSITION_ORDER) {
            const selectedForPos = votes[pos] || [];
            if (selectedForPos.length === 0) continue;

            // 투표 참여 기록 생성 (Upsert Action)
            const voteRes = await submitVoteSQLAction({
                voterId: voterId as string,
                electionId: electionId as string,
                position: pos,
                round: 1 // Default round for migration
            });
            if (!voteRes.success) throw new Error(voteRes.error);

            // 후보자 득표수 증가는 추후 PostgreSQL 트리거 또는 
            // 별도 Increment 로직을 통해 처리하도록 아키텍처 구성 가능
            // (현재는 참여 기록을 남기는 데 우선순위)
        }

        // 2. 투표 완료 이후 쿠키 파기 처리
        cookieStore.delete('voter_token');

        return { success: true };

    } catch (err: unknown) {
        console.error("Data Connect Submit Error:", err);
        return { 
            success: false, 
            message: err instanceof Error ? err.message : '투표 처리 중 오류가 발생했습니다.' 
        };
    }
}
