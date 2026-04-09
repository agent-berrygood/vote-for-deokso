const admin = require('firebase-admin');
const fs = require('fs');

console.log("Firebase Admin SDK 초기화 중...");
admin.initializeApp({
  projectId: "deoksovote"
});

const db = admin.firestore();

async function extractVotersAdmin() {
    try {
        console.log("=> Admin 권한으로 elections/default-2026/voters 경로 조회 시도...");
        const votersRef = db.collection('elections').doc('default-2026').collection('voters');
        const votersSnap = await votersRef.get();
        
        if (votersSnap.empty) {
            console.log("⚠️ Admin으로 조회했으나 명단이 비어있습니다. 실제 데이터가 존재하지 않을 가능성이 높습니다.");
            process.exit(0);
        }

        const voters = [];
        votersSnap.forEach(doc => {
            voters.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ 데이터 추출 완료! 총 ${voters.length}명의 선거인을 찾았습니다.`);

        fs.writeFileSync('voters_export.json', JSON.stringify(voters, null, 2), 'utf-8');
        console.log("=> 'voters_export.json' 저장 완료.");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ 오류 발생:", error.message);
        process.exit(1);
    }
}

extractVotersAdmin();
