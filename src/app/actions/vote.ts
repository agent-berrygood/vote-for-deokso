'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/firebase'; // Ensure you have firebase-admin or can use client SDK in edge/node carefully
import { collection, doc, runTransaction, getDoc, getDocs, increment } from 'firebase/firestore';
import { verifyToken } from '@/lib/auth';
import { Candidate } from '@/types';

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

        // Settings / Config 가져오기 (라운드 정보 파악 및 종료 시간 체크)
        const settingsSnap = await getDoc(doc(db, `elections/${electionId}/settings`, 'config'));
        const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};

        // 투표 종료 시간 체크
        if (settingsData.endDate) {
            const now = new Date();
            const end = new Date(settingsData.endDate);
            if (now > end) {
                return { success: false, message: '투표 시간이 종료되었습니다. 더 이상 투표할 수 없습니다.' };
            }
        }

        const rounds = settingsData.rounds || { '장로': 1, '권사': 1, '안수집사': 1 };

        // 트랜잭션 수행
        await runTransaction(db, async (transaction) => {
            const voterRef = doc(db, `elections/${electionId}/voters`, voterId as string);
            const voterSnap = await transaction.get(voterRef);

            if (!voterSnap.exists()) {
                throw new Error("선거인 정보를 찾을 수 없습니다.");
            }

            const voterData = voterSnap.data();
            const selectedCandidatesInfo: { id: string, round: number }[] = [];
            const participatedUpdates: Record<string, boolean> = {};

            // 권한 및 중복참여 검사
            for (const pos of POSITION_ORDER) {
                const selectedForPos = votes[pos] || [];
                if (selectedForPos.length === 0) continue;

                const round = rounds[pos] || 1;
                const groupKey = `${pos}_${round}`;

                if (voterData.participated?.[groupKey]) {
                    throw new Error(`이미 '${pos}' 투표에 참여하셨습니다.`);
                }

                participatedUpdates[groupKey] = true;
                for (const cId of selectedForPos) {
                    selectedCandidatesInfo.push({ id: cId, round });
                }
            }

            if (selectedCandidatesInfo.length === 0 && Object.keys(participatedUpdates).length === 0) {
                // 사실상 빈 투표 (UI에서 처리되지만 서버에서도 막음)
                throw new Error("선택된 후보가 없습니다.");
            }

            // 후보자 Write (Atomic Increment 적용)
            // 기존에는 후보자 문서를 get()으로 모두 읽어온 뒤 +1을 해서 다시 썼지만, 
            // 다수의 사람이 동시에 투표할 때 발생하는 Contention(경합)을 줄이기 위해 원자적 증가(increment) 사용
            for (const { id, round } of selectedCandidatesInfo) {
                const candidateRef = doc(db, `elections/${electionId}/candidates`, id);
                transaction.update(candidateRef, {
                    voteCount: increment(1),
                    [`votesByRound.${round}`]: increment(1)
                });
            }

            // 선거인 Write
            const newParticipated = { ...voterData.participated, ...participatedUpdates };
            transaction.update(voterRef, {
                participated: newParticipated,
                votedAt: Date.now(),
                hasVoted: true
            });
        });

        // 2. 투표 완료 이후 쿠키 파기 처리 (재투표 방지)
        cookieStore.delete('voter_token');

        return { success: true };
    } catch (err: unknown) {
        console.error("Transact Submit Error:", err);

        // Firestore 트랜잭션 실패 시 자동 롤백됨 — 사용자에게 구체적인 메시지 제공
        let errorMessage = '알 수 없는 오류가 발생했습니다.';
        if (err instanceof Error) {
            // Firestore 트랜잭션 경합(contention) 또는 네트워크 에러 분류
            if (err.message.includes('contention') || err.message.includes('too much contention')) {
                errorMessage = '동시 요청이 많아 처리에 실패했습니다. 잠시 후 다시 시도해주세요.';
            } else if (err.message.includes('network') || err.message.includes('unavailable') || err.message.includes('UNAVAILABLE')) {
                errorMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인 후 다시 시도해주세요.';
            } else {
                errorMessage = err.message;
            }
        }
        return { success: false, message: errorMessage };
    }
}
