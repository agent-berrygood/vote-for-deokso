/**
 * 동시 다발적 투표 부하 테스트 스크립트
 *
 * generate_mock_voters.mjs로 생성된 mock_voters.json을 읽어
 * Firestore 트랜잭션 기반 투표를 동시에 수행합니다.
 *
 * 테스트 항목:
 * - 동시 투표 요청의 트랜잭션 안정성
 * - 중복 투표 방지 로직 검증
 * - 트랜잭션 경합(contention) 시 에러 핸들링
 *
 * 사용법: node scripts/simulate_votes.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, getDocs, collection, runTransaction } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const POSITION_ORDER = ['장로', '안수집사', '권사'];
const CONCURRENCY_BATCH = 10; // 동시 요청 수

/**
 * submitVote 서버 액션의 핵심 트랜잭션 로직을 복제하여
 * 스크립트에서 직접 Firestore 트랜잭션을 실행
 */
async function simulateVote(electionId, voterId, voterName) {
    const settingsSnap = await getDoc(doc(db, `elections/${electionId}/settings`, 'config'));
    const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};
    const rounds = settingsData.rounds || { '장로': 1, '권사': 1, '안수집사': 1 };

    // 후보자 목록 조회
    const candidatesSnap = await getDocs(collection(db, `elections/${electionId}/candidates`));
    const candidatesByPosition = {};
    candidatesSnap.forEach(d => {
        const data = d.data();
        if (!candidatesByPosition[data.position]) candidatesByPosition[data.position] = [];
        candidatesByPosition[data.position].push({ id: d.id, ...data });
    });

    // 각 직분에서 랜덤으로 1~3명 선택
    const votes = {};
    for (const pos of POSITION_ORDER) {
        const candidates = candidatesByPosition[pos] || [];
        if (candidates.length === 0) continue;
        const pickCount = Math.min(1 + Math.floor(Math.random() * 3), candidates.length);
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        votes[pos] = shuffled.slice(0, pickCount).map(c => c.id);
    }

    // 트랜잭션 실행 (submitVote 서버 액션과 동일한 로직)
    await runTransaction(db, async (transaction) => {
        const voterRef = doc(db, `elections/${electionId}/voters`, voterId);
        const voterSnap = await transaction.get(voterRef);

        if (!voterSnap.exists()) {
            throw new Error("선거인 정보를 찾을 수 없습니다.");
        }

        const voterData = voterSnap.data();
        const allSelectedIds = [];
        const participatedUpdates = {};

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

        if (allSelectedIds.length === 0) {
            throw new Error("선택된 후보가 없습니다.");
        }

        // 후보자 Read
        const candidateUpdates = [];
        for (const candidateId of allSelectedIds) {
            const candidateRef = doc(db, `elections/${electionId}/candidates`, candidateId);
            const candidateSnap = await transaction.get(candidateRef);

            if (!candidateSnap.exists()) {
                throw new Error("후보자 정보가 변경되었습니다.");
            }

            candidateUpdates.push({ ref: candidateRef, data: candidateSnap.data() });
        }

        // 후보자 Write
        for (const { ref, data } of candidateUpdates) {
            const newTotal = (data.voteCount || 0) + 1;
            const cRound = data.round || 1;
            const votesByRound = data.votesByRound || {};
            votesByRound[cRound] = (votesByRound[cRound] || 0) + 1;

            transaction.update(ref, { voteCount: newTotal, votesByRound });
        }

        // 선거인 Write
        const newParticipated = { ...voterData.participated, ...participatedUpdates };
        transaction.update(voterRef, {
            participated: newParticipated,
            votedAt: Date.now(),
            hasVoted: true,
        });
    });

    return { success: true, votes };
}

/**
 * 동일 투표자로 중복 투표 시도 → 실패해야 정상
 */
async function testDuplicateVote(electionId, voter) {
    try {
        await simulateVote(electionId, voter.id, voter.name);
        return { voter: voter.name, result: 'FAIL - 중복 투표가 허용됨!' };
    } catch (err) {
        if (err.message.includes('이미') || err.message.includes('참여')) {
            return { voter: voter.name, result: 'PASS - 중복 투표 정상 차단' };
        }
        return { voter: voter.name, result: `UNEXPECTED ERROR: ${err.message}` };
    }
}

async function main() {
    console.log("=== 동시 투표 부하 테스트 ===\n");

    // mock_voters.json 로드
    const dataPath = path.resolve(__dirname, 'mock_voters.json');
    if (!fs.existsSync(dataPath)) {
        console.error("mock_voters.json이 없습니다. 먼저 generate_mock_voters.mjs를 실행하세요.");
        process.exit(1);
    }

    const { electionId, voters } = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`선거 ID: ${electionId}`);
    console.log(`투표자: ${voters.length}명`);
    console.log(`동시 요청 배치: ${CONCURRENCY_BATCH}명씩\n`);

    // ===== Phase 1: 동시 투표 =====
    console.log("--- Phase 1: 동시 투표 테스트 ---");
    const results = { success: 0, fail: 0, errors: [] };
    const startTime = Date.now();

    for (let i = 0; i < voters.length; i += CONCURRENCY_BATCH) {
        const batch = voters.slice(i, i + CONCURRENCY_BATCH);
        const batchNum = Math.floor(i / CONCURRENCY_BATCH) + 1;

        const promises = batch.map(voter =>
            simulateVote(electionId, voter.id, voter.name)
                .then(res => {
                    results.success++;
                    return { voter: voter.name, status: 'success' };
                })
                .catch(err => {
                    results.fail++;
                    results.errors.push({ voter: voter.name, error: err.message });
                    return { voter: voter.name, status: 'fail', error: err.message };
                })
        );

        const batchResults = await Promise.all(promises);
        const successCount = batchResults.filter(r => r.status === 'success').length;
        console.log(`  배치 ${batchNum}: ${successCount}/${batch.length} 성공`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n[Phase 1 결과]`);
    console.log(`  성공: ${results.success}/${voters.length}`);
    console.log(`  실패: ${results.fail}`);
    console.log(`  소요 시간: ${elapsed}s`);

    if (results.errors.length > 0) {
        console.log(`  에러 목록:`);
        results.errors.forEach(e => console.log(`    - ${e.voter}: ${e.error}`));
    }

    // ===== Phase 2: 중복 투표 방지 테스트 =====
    console.log("\n--- Phase 2: 중복 투표 방지 테스트 ---");
    // 이미 투표한 사람 중 5명으로 다시 투표 시도
    const dupTestVoters = voters.slice(0, 5);
    const dupResults = await Promise.all(
        dupTestVoters.map(voter => testDuplicateVote(electionId, voter))
    );

    dupResults.forEach(r => {
        console.log(`  ${r.voter}: ${r.result}`);
    });

    // ===== 결과 저장 =====
    const report = {
        electionId,
        timestamp: new Date().toISOString(),
        totalVoters: voters.length,
        phase1: {
            success: results.success,
            fail: results.fail,
            elapsedSeconds: parseFloat(elapsed),
            errors: results.errors,
        },
        phase2: {
            duplicateTests: dupResults,
        },
    };

    const reportPath = path.resolve(__dirname, 'simulation_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n결과 저장: ${reportPath}`);

    process.exit(0);
}

main().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
