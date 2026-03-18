
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function extract() {
    try {
        console.log("1. 활성 선거 ID 확인 중...");
        const systemDoc = await getDoc(doc(db, 'settings', 'system'));
        const activeElectionId = systemDoc.exists() ? systemDoc.data().activeElectionId : 'default-2026';
        console.log(`- 활성 선거 ID: ${activeElectionId}`);

        console.log("2. 2차 후보자 데이터 가져오는 중...");
        const q = query(
            collection(db, `elections/${activeElectionId}/candidates`),
            where('round', '==', 2)
        );
        const querySnapshot = await getDocs(q);
        const candidates = [];
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            candidates.push({
                '사진(URL)': data.photoUrl || '',
                '이름': data.name || '',
                '봉사내역': data.profileDesc || '',
                '가족사항': data.volunteerInfo || '',
                '직분': data.position || '',
                '교구': data.district || ''
            });
        });

        console.log(`- 추출된 후보자 수: ${candidates.length}명`);

        if (candidates.length === 0) {
            console.log("! 2차 후보자가 없습니다. 정렬 조건을 확인해 보세요.");
            return;
        }

        // 이름순 정렬
        candidates.sort((a, b) => a.이름.localeCompare(b.이름, 'ko'));

        console.log("3. 엑셀 파일 생성 중...");
        const ws = XLSX.utils.json_to_sheet(candidates);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "2차 후보자 프로필");

        const filename = '2차_후보자_프로필_공고용.xlsx';
        XLSX.writeFile(wb, filename);

        console.log(`\n성공! 파일이 생성되었습니다: ${filename}`);
    } catch (error) {
        console.error("오류 발생:", error);
    }
}

extract();
