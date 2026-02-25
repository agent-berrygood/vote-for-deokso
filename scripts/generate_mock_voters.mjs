/**
 * 가상 투표자 50명 자동 생성 스크립트
 *
 * Firestore `elections/{ELECTION_ID}/voters` 컬렉션에 50명의 가상 투표자를 생성합니다.
 * 생성된 데이터는 simulate_votes.mjs에서 사용됩니다.
 *
 * 사용법: node scripts/generate_mock_voters.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc, getDocs, deleteDoc } from "firebase/firestore";
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

console.log("Initializing Firebase... Project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ELECTION_ID = 'test-simulation';
const VOTER_COUNT = 50;

// 한국 성씨 (빈도 기반)
const LAST_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
// 이름 글자
const FIRST_CHARS = ['민', '서', '지', '예', '하', '수', '도', '현', '준', '영', '은', '재', '승', '동', '성', '태', '진', '경', '상', '유'];
const SECOND_CHARS = ['준', '우', '호', '연', '아', '원', '혁', '빈', '석', '희', '경', '미', '정', '선', '철', '환', '수', '진', '율', '찬'];

function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(index) {
    const mid = String(1000 + index).slice(-4);
    const last = String(1000 + Math.floor(Math.random() * 9000)).slice(-4);
    return `010-${mid}-${last}`;
}

function generateBirthdate() {
    const year = 50 + Math.floor(Math.random() * 50); // 50~99 → 1950~1999
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
    return `${String(year).padStart(2, '0')}${month}${day}`;
}

function generateVoters(count) {
    const voters = [];
    const usedNames = new Set();

    for (let i = 0; i < count; i++) {
        let name;
        do {
            name = randomPick(LAST_NAMES) + randomPick(FIRST_CHARS) + randomPick(SECOND_CHARS);
        } while (usedNames.has(name));
        usedNames.add(name);

        voters.push({
            name,
            phone: generatePhone(i),
            birthdate: generateBirthdate(),
            hasVoted: false,
            participated: {},
            votedAt: null,
            createdAt: new Date(),
        });
    }
    return voters;
}

async function setupElection() {
    const { setDoc } = await import("firebase/firestore");

    // 선거 문서 생성
    await setDoc(doc(db, "elections", ELECTION_ID), {
        title: "시뮬레이션 테스트 선거",
        status: "active",
        createdAt: new Date(),
    });

    // settings/config 생성
    await setDoc(doc(db, `elections/${ELECTION_ID}/settings`, "config"), {
        rounds: { '장로': 1, '안수집사': 1, '권사': 1 },
        maxVotes: { '장로': 3, '안수집사': 3, '권사': 3 },
    });

    // 테스트 후보자 생성 (직분별 5명씩)
    const positions = [
        { position: '장로', count: 5 },
        { position: '안수집사', count: 5 },
        { position: '권사', count: 5 },
    ];

    let batch = writeBatch(db);
    let totalCandidates = 0;

    for (const { position, count } of positions) {
        for (let i = 1; i <= count; i++) {
            const id = `${position}_candidate_${i}`;
            const candidateRef = doc(db, `elections/${ELECTION_ID}/candidates`, id);
            batch.set(candidateRef, {
                name: `${position}후보${i}`,
                position,
                photoUrl: '',
                voteCount: 0,
                votesByRound: { 1: 0 },
                round: 1,
            });
            totalCandidates++;
        }
    }
    await batch.commit();
    console.log(`[선거 설정] 후보자 ${totalCandidates}명 생성 완료`);
}

async function uploadVoters(voters) {
    let batch = writeBatch(db);
    const batchSize = 400;
    const voterIds = [];

    for (let i = 0; i < voters.length; i++) {
        const docRef = doc(collection(db, `elections/${ELECTION_ID}/voters`));
        batch.set(docRef, voters[i]);
        voterIds.push({ id: docRef.id, ...voters[i] });

        if ((i + 1) % batchSize === 0) {
            await batch.commit();
            batch = writeBatch(db);
            console.log(`  업로드 진행: ${i + 1}/${voters.length}`);
        }
    }

    await batch.commit();
    return voterIds;
}

async function main() {
    console.log("=== 가상 투표자 생성 스크립트 ===\n");

    // 1. 선거 환경 세팅
    console.log("[1/3] 테스트 선거 환경 생성 중...");
    await setupElection();

    // 2. 투표자 생성
    console.log(`[2/3] 가상 투표자 ${VOTER_COUNT}명 생성 중...`);
    const voters = generateVoters(VOTER_COUNT);

    // 3. Firestore 업로드
    console.log("[3/3] Firestore 업로드 중...");
    const voterIds = await uploadVoters(voters);

    // 4. 로컬 JSON 저장 (simulate_votes.mjs에서 사용)
    const outputPath = path.resolve(__dirname, 'mock_voters.json');
    fs.writeFileSync(outputPath, JSON.stringify({
        electionId: ELECTION_ID,
        voters: voterIds.map(v => ({
            id: v.id,
            name: v.name,
            phone: v.phone,
            birthdate: v.birthdate,
        })),
    }, null, 2));

    console.log(`\n=== 완료 ===`);
    console.log(`선거 ID: ${ELECTION_ID}`);
    console.log(`투표자: ${voterIds.length}명`);
    console.log(`데이터 저장: ${outputPath}`);
    process.exit(0);
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
