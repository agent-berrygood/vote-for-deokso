'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/firebase'; // Ensure you have firebase-admin or can use client SDK in edge/node carefully
import { collection, doc, runTransaction, getDoc, getDocs } from 'firebase/firestore';
import { verifyToken } from '@/lib/auth';
import { Candidate } from '@/types';

const ADMIN_VOTER_NAME = '관리자';
const POSITION_ORDER = ['장로', '안수집사', '권사'];

export async function submitVote(votes: Record<string, string[]>) {
    try {
        const cookieStore = await cookies();
        const voterToken = cookieStore.get('voter_token');

        if (!voterToken?.value) {
            return { success: false, message: '인증 정보가 없습니다. 다시 로그인해주세요.' };
        }

        // 1. JWT 검증 (위변조 방지)
        const payload = await verifyToken(voterToken.value);
        if (!payload || payload.role !== 'voter' || !payload.voterId || !payload.electionId) {
            return { success: false, message: '유효하지 않은 인증 세션입니다.' };
        }

        const { voterId, electionId } = payload;

        // Settings / Config 가져오기 (라운드 정보 파악 로직 백엔드 수행)
        const settingsSnap = await getDoc(doc(db, `elections/${electionId}/settings`, 'config'));
        const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};
        const rounds = settingsData.rounds || { '장로': 1, '권사': 1, '안수집사': 1 };

        // 트랜잭션 수행
        await runTransaction(db, async (transaction) => {
            const voterRef = doc(db, `elections/${electionId}/voters`, voterId as string);
            const voterSnap = await transaction.get(voterRef);

            if (!voterSnap.exists()) {
                throw new Error("선거인 정보를 찾을 수 없습니다.");
            }

            const voterData = voterSnap.data();
            const isAdmin = voterData.name === ADMIN_VOTER_NAME;
            const allSelectedIds: string[] = [];
            const participatedUpdates: Record<string, boolean> = {};

            // 권한 및 중복참여 검사
            for (const pos of POSITION_ORDER) {
                const selectedForPos = votes[pos] || [];
                if (selectedForPos.length === 0) continue;

                const round = rounds[pos] || 1;
                const groupKey = `${pos}_${round}`;

                if (!isAdmin && voterData.participated?.[groupKey]) {
                    throw new Error(`이미 '${pos}' 투표에 참여하셨습니다.`);
                }

                participatedUpdates[groupKey] = true;
                allSelectedIds.push(...selectedForPos);
            }

            if (allSelectedIds.length === 0 && Object.keys(participatedUpdates).length === 0) {
                // 사실상 빈 투표 (UI에서 처리되지만 서버에서도 막음)
                throw new Error("선택된 후보가 없습니다.");
            }

            // 후보자 Read 
            const candidateUpdates = [];
            for (const candidateId of allSelectedIds) {
                const candidateRef = doc(db, `elections/${electionId}/candidates`, candidateId);
                const candidateSnap = await transaction.get(candidateRef);

                if (!candidateSnap.exists()) {
                    throw new Error("후보자 정보가 변경되었습니다. 새로고침 후 다시 시도해주세요.");
                }

                candidateUpdates.push({
                    ref: candidateRef,
                    data: candidateSnap.data() as Candidate
                });
            }

            // 후보자 Write
            for (const { ref, data } of candidateUpdates) {
                const newTotal = (data.voteCount || 0) + 1;
                const cRound = data.round || 1;
                const votesByRound = data.votesByRound || {};
                votesByRound[cRound] = (votesByRound[cRound] || 0) + 1;

                transaction.update(ref, {
                    voteCount: newTotal,
                    votesByRound: votesByRound
                });
            }

            // 선거인 Write
            if (!isAdmin) {
                const newParticipated = { ...voterData.participated, ...participatedUpdates };
                transaction.update(voterRef, {
                    participated: newParticipated,
                    votedAt: Date.now(),
                    hasVoted: true
                });
            }
        });

        // 2. 투표 완료 이후 쿠키 파기 처리 (재투표 방지, 단 관리자는 유지)
        if (payload.voterName !== ADMIN_VOTER_NAME) {
            cookieStore.delete('voter_token');
        }

        return { success: true };
    } catch (err: unknown) {
        console.error("Transact Submit Error:", err);
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        return { success: false, message: errorMessage };
    }
}
