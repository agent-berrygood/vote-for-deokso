import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, getDoc, increment } from 'firebase/firestore';

// 더미 투표를 위한 가짜 API
// 실제 /actions/vote.ts의 트랜잭션 로직과 동일한 부하를 주되, 
// 1) 고정된 투표자 ID와 선거 ID 사용
// 2) 쿠키 인증/파기 로직 생략
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { electionId, voterId, candidateIds, position } = body;

        if (!electionId || !voterId || !candidateIds || !position) {
            return NextResponse.json({ success: false, message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
        }

        // Settings / Config 가져오기 (라운드 정보 파악 로직 백엔드 수행)
        const settingsSnap = await getDoc(doc(db, `elections/${electionId}/settings`, 'config'));
        const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};
        const rounds = settingsData.rounds || { '장로': 1, '권사': 1, '안수집사': 1 };

        // 트랜잭션 수행
        await runTransaction(db, async (transaction) => {
            const voterRef = doc(db, `elections/${electionId}/voters`, voterId);
            const voterSnap = await transaction.get(voterRef);

            if (!voterSnap.exists()) {
                throw new Error("선거인 정보를 찾을 수 없습니다.");
            }

            const voterData = voterSnap.data();

            // 테스트용이므로 중복참여 검사는 건너뜁니다 (계속 같은 ID로 쏴야하므로)
            // 대신 트랜잭션의 읽기/쓰기 "비용(수고)"은 그대로 발생시킵니다.
            const round = rounds[position as string] || 1;
            const groupKey = `${position}_${round}`;

            const participatedUpdates: Record<string, boolean> = { [groupKey]: true };
            const allSelectedIds: string[] = candidateIds;

            // 후보자 Write (Atomic Increment)
            for (const id of allSelectedIds) {
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

        return NextResponse.json({ success: true, message: '더미 투표 성공' });

    } catch (err: unknown) {
        console.error("Dummy Vote Transact Error:", err);
        let errorMessage = '알 수 없는 오류가 발생했습니다.';
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}
