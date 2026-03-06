const admin = require('firebase-admin');

// 1. Firebase Admin SDK 초기화
// (주의) 이 스크립트를 실행하려면 서비스 계정 비공개 키 JSON 파일이 필요합니다.
// 여기서는 환경 변수나 default credential을 사용한다고 가정합니다.
// $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your-service-account-file.json"
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

const ELECTION_ID = "test_load_election_" + Date.now();
const POSITIONS = ['장로', '안수집사', '권사'];
const NUM_VOTERS = 1000;
const NUM_CANDIDATES = 10;

async function seedTestElections() {
    console.log(`🌱 테스트용 선거 데이터 세팅 시작! (ID: ${ELECTION_ID})`);

    // 1. 선거 Settings 세팅
    await db.collection(`elections/${ELECTION_ID}/settings`).doc('config').set({
        rounds: { '장로': 1, '안수집사': 1, '권사': 1 },
        isActive: true,
        title: "부하 테스트용 가짜 선거"
    });
    console.log(`✅ 선거 설정 생성됨`);

    // 2. 가짜 후보자 생성 (Batch 쓰기)
    const candidateIds = [];
    const candidateBatch = db.batch();
    for (let i = 1; i <= NUM_CANDIDATES; i++) {
        const cId = `test_candidate_${i}`;
        candidateIds.push(cId);
        const ref = db.collection(`elections/${ELECTION_ID}/candidates`).doc(cId);
        candidateBatch.set(ref, {
            id: cId,
            name: `후보${i}`,
            position: POSITIONS[i % 3], // 임의 직분 배정
            voteCount: 0,
            round: 1,
            votesByRound: { 1: 0 }
        });
    }
    await candidateBatch.commit();
    console.log(`✅ 가짜 후보 ${NUM_CANDIDATES}명 생성됨`);

    // 3. 가짜 유권자 생성 (Batch 쓰기, Firestore batch 제한 500개 고려)
    console.log(`⏳ 가짜 유권자 ${NUM_VOTERS}명 생성 중...`);
    let voterBatch = db.batch();
    let batchCount = 0;

    for (let i = 1; i <= NUM_VOTERS; i++) {
        const vId = `test_voter_${i}`;
        const ref = db.collection(`elections/${ELECTION_ID}/voters`).doc(vId);
        voterBatch.set(ref, {
            id: vId,
            name: `유권자${i}`,
            participated: {},
            hasVoted: false
        });
        batchCount++;

        if (batchCount === 500 || i === NUM_VOTERS) {
            await voterBatch.commit();
            voterBatch = db.batch();
            batchCount = 0;
            process.stdout.write(`...${i}명 `);
        }
    }
    console.log(`\n✅ 가짜 유권자 완료!`);

    console.log('\n=======================================');
    console.log(`🎉 세팅 완료! 부하 테스트 스크립트에 아래 값을 꼭 적어주세요.`);
    console.log(`const TEST_ELECTION_ID = "${ELECTION_ID}";`);
    console.log(`=======================================\n`);
}

seedTestElections().catch(console.error);
