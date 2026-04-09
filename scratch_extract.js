require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function extractExactPath() {
    try {
        const exactPath = 'elections/2026 항존직 본선거/voters';
        console.log(`=> 정확한 경로 [${exactPath}] 조회 시도 중...`);
        
        const votersRef = collection(db, exactPath);
        const votersSnap = await getDocs(votersRef);
        
        if (votersSnap.empty) {
            console.log("⚠️ 명단이 비어있습니다. 권한이나 경로 이름을 다시 한 번 체크해주세요.");
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

extractExactPath();
