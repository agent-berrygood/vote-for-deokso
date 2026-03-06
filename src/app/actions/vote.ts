'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/firebase'; // Ensure you have firebase-admin or can use client SDK in edge/node carefully
import { collection, doc, runTransaction, getDoc, getDocs } from 'firebase/firestore';
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
            const allSelectedIds: string[] = [];
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
                allSelectedIds.push(...selectedForPos);
            }

            if (allSelectedIds.length === 0 && Object.keys(participatedUpdates).length === 0) {
                // 사실상 빈 투표 (UI에서 처리되지만 서버에서도 막음)
                throw new Error("선택된 후보가 없습니다.");
            }

            // 후보자 유효성 검증(Read) 생략 (충돌 방지 최적화, UI에서 선택된 ID를 단순 기록)
            // 대신 Append-Only 방식으로 votes 컬렉션에 새 문서(투표지) 추가
            // [익명성 보장 패치]: 시간 유추를 막기 위해 초/밀리초 단위를 제거한 '분' 단위 저장
            const exactTime = new Date();
            const anonymousTimestamp = new Date(exactTime.getFullYear(), exactTime.getMonth(), exactTime.getDate(), exactTime.getHours(), exactTime.getMinutes()).getTime();

            // 각 직분/차수 별로 별도의 표로 저장 (나중에 필터링 및 집계 용이)
            for (const pos of POSITION_ORDER) {
                const selectedForPos = votes[pos] || [];
                if (selectedForPos.length === 0) continue;

                const round = rounds[pos] || 1;
                const voteDocRef = doc(collection(db, `elections/${electionId}/votes`));

                transaction.set(voteDocRef, {
                    // voterId: voterId, // <- 완벽한 익명성 보장을 위해 기록하지 않음 
                    position: pos,
                    round: round,
                    candidateIds: selectedForPos,
                    timestamp: anonymousTimestamp
                });
            }

            // 선거인 Write (참여 완료 표시)
            const newParticipated = { ...voterData.participated, ...participatedUpdates };
            transaction.update(voterRef, {
                participated: newParticipated,
                votedAt: exactTime.getTime(), // 선거인 명부에는 정확한 참여 시점 기록
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
