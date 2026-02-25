/**
 * Firestore 데이터 무결성 검증 스크립트
 *
 * 시뮬레이션 테스트 후 Firestore 데이터의 정합성을 검증합니다:
 * 1. hasVoted가 true인 투표자 수 집계
 * 2. 각 후보자의 voteCount 합산
 * 3. 투표자 수 × 직분별 선택 수와 후보자 총 득표수 비교
 * 4. votesByRound 합산 일치 여부
 *
 * 사용법: node scripts/verify_integrity.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
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

async function verify(electionId) {
    console.log(`\n=== 데이터 무결성 검증: ${electionId} ===\n`);

    const issues = [];
    let allPass = true;

    // ===== 1. 투표자 데이터 수집 =====
    console.log("[1/4] 투표자 데이터 조회 중...");
    const votersSnap = await getDocs(collection(db, `elections/${electionId}/voters`));
    const voters = [];
    votersSnap.forEach(d => voters.push({ id: d.id, ...d.data() }));

    const totalVoters = voters.length;
    const votedVoters = voters.filter(v => v.hasVoted === true);
    const notVotedVoters = voters.filter(v => !v.hasVoted);

    console.log(`  전체 투표자: ${totalVoters}명`);
    console.log(`  투표 완료(hasVoted=true): ${votedVoters.length}명`);
    console.log(`  미투표: ${notVotedVoters.length}명`);

    // ===== 2. 후보자 데이터 수집 =====
    console.log("\n[2/4] 후보자 데이터 조회 중...");
    const candidatesSnap = await getDocs(collection(db, `elections/${electionId}/candidates`));
    const candidates = [];
    candidatesSnap.forEach(d => candidates.push({ id: d.id, ...d.data() }));

    const candidatesByPosition = {};
    for (const c of candidates) {
        if (!candidatesByPosition[c.position]) candidatesByPosition[c.position] = [];
        candidatesByPosition[c.position].push(c);
    }

    for (const pos of POSITION_ORDER) {
        const posCandidates = candidatesByPosition[pos] || [];
        const totalVotes = posCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
        console.log(`  [${pos}] 후보 ${posCandidates.length}명, 총 득표수: ${totalVotes}`);
        posCandidates.forEach(c => {
            console.log(`    - ${c.name}: voteCount=${c.voteCount || 0}`);
        });
    }

    // ===== 3. participated 기반 직분별 투표자 수 vs 후보 득표 합 =====
    console.log("\n[3/4] 직분별 투표 참여자 수 vs 후보 득표 합산 비교...");

    const settingsSnap = await getDoc(doc(db, `elections/${electionId}/settings`, 'config'));
    const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};
    const rounds = settingsData.rounds || { '장로': 1, '안수집사': 1, '권사': 1 };

    for (const pos of POSITION_ORDER) {
        const round = rounds[pos] || 1;
        const groupKey = `${pos}_${round}`;

        // participated[groupKey] === true 인 투표자 수
        const participatedCount = voters.filter(v => v.participated?.[groupKey] === true).length;

        // 해당 직분 후보자 총 득표수
        const posCandidates = candidatesByPosition[pos] || [];
        const totalCandidateVotes = posCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);

        // 투표자 1인당 여러 후보를 선택할 수 있으므로, totalCandidateVotes >= participatedCount
        // 하지만 totalCandidateVotes <= participatedCount * maxVotes 이어야 함
        const maxVotes = settingsData.maxVotes?.[pos] || posCandidates.length;

        const valid = totalCandidateVotes >= participatedCount && totalCandidateVotes <= participatedCount * maxVotes;

        const status = valid ? 'PASS' : 'FAIL';
        if (!valid) {
            allPass = false;
            issues.push(`[${pos}] 득표 범위 이상: 참여자 ${participatedCount}명, 총 득표 ${totalCandidateVotes}, 허용 범위 [${participatedCount}~${participatedCount * maxVotes}]`);
        }

        console.log(`  [${pos}] ${status}`);
        console.log(`    참여자(${groupKey}): ${participatedCount}명`);
        console.log(`    후보 총 득표: ${totalCandidateVotes}`);
        console.log(`    허용 범위: ${participatedCount} ~ ${participatedCount * maxVotes}`);
    }

    // ===== 4. voteCount vs votesByRound 정합성 =====
    console.log("\n[4/4] voteCount vs votesByRound 정합성 검증...");

    for (const c of candidates) {
        const voteCount = c.voteCount || 0;
        const votesByRound = c.votesByRound || {};
        const roundSum = Object.values(votesByRound).reduce((sum, v) => sum + v, 0);

        if (voteCount !== roundSum) {
            allPass = false;
            const msg = `[${c.position}] ${c.name}: voteCount(${voteCount}) != votesByRound 합계(${roundSum})`;
            issues.push(msg);
            console.log(`  FAIL - ${msg}`);
        }
    }

    if (issues.length === 0) {
        console.log("  모든 후보자 voteCount == votesByRound 합계 일치");
    }

    // ===== 5. hasVoted 일관성 검증 =====
    console.log("\n[보너스] hasVoted와 participated 일관성 검증...");
    let hasVotedMismatch = 0;
    for (const v of voters) {
        const participated = v.participated || {};
        const hasAnyParticipation = Object.values(participated).some(val => val === true);

        if (v.hasVoted && !hasAnyParticipation) {
            hasVotedMismatch++;
            issues.push(`투표자 ${v.name}(${v.id}): hasVoted=true이지만 participated 기록 없음`);
        }
        if (!v.hasVoted && hasAnyParticipation) {
            hasVotedMismatch++;
            issues.push(`투표자 ${v.name}(${v.id}): hasVoted=false이지만 participated 기록 있음`);
        }
    }
    console.log(`  불일치: ${hasVotedMismatch}건`);

    // ===== 최종 결과 =====
    console.log("\n=============================");
    if (allPass && issues.length === 0) {
        console.log("  검증 결과: ALL PASS ✓");
    } else {
        console.log(`  검증 결과: FAIL (${issues.length}건의 문제 발견)`);
        issues.forEach(i => console.log(`    - ${i}`));
    }
    console.log("=============================\n");

    // 결과 JSON 저장
    const report = {
        electionId,
        timestamp: new Date().toISOString(),
        summary: {
            totalVoters,
            votedCount: votedVoters.length,
            notVotedCount: notVotedVoters.length,
            totalCandidates: candidates.length,
            allPass: allPass && issues.length === 0,
        },
        positionDetails: POSITION_ORDER.map(pos => {
            const round = rounds[pos] || 1;
            const groupKey = `${pos}_${round}`;
            const posCandidates = candidatesByPosition[pos] || [];
            return {
                position: pos,
                participatedCount: voters.filter(v => v.participated?.[groupKey] === true).length,
                totalVotes: posCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0),
                candidates: posCandidates.map(c => ({ name: c.name, voteCount: c.voteCount || 0 })),
            };
        }),
        issues,
    };

    const reportPath = path.resolve(__dirname, 'integrity_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`검증 결과 저장: ${reportPath}`);

    return allPass && issues.length === 0;
}

async function main() {
    // mock_voters.json에서 electionId 읽기
    const dataPath = path.resolve(__dirname, 'mock_voters.json');
    let electionId = 'test-simulation';

    if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        electionId = data.electionId || electionId;
    }

    const passed = await verify(electionId);
    process.exit(passed ? 0 : 1);
}

main().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
