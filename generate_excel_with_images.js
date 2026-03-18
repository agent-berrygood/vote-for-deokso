
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
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

async function generate() {
    try {
        console.log("1. 활성 선거 ID 및 데이터 확인 중...");
        const systemDoc = await getDoc(doc(db, 'settings', 'system'));
        const activeElectionId = systemDoc.exists() ? systemDoc.data().activeElectionId : 'default-2026';
        console.log(`- 활성 선거 ID: ${activeElectionId}`);

        const q = query(
            collection(db, `elections/${activeElectionId}/candidates`),
            where('round', '==', 2)
        );
        const querySnapshot = await getDocs(q);
        const allCandidates = [];
        querySnapshot.forEach(docSnap => {
            allCandidates.push({ id: docSnap.id, ...docSnap.data() });
        });

        console.log(`- 전체 2차 후보자 수: ${allCandidates.length}명`);

        // 직분별 그룹화
        const groups = {
            '장로': allCandidates.filter(c => c.position === '장로').sort((a, b) => a.name.localeCompare(b.name, 'ko')),
            '안수집사': allCandidates.filter(c => c.position === '안수집사').sort((a, b) => a.name.localeCompare(b.name, 'ko')),
            '권사': allCandidates.filter(c => c.position === '권사').sort((a, b) => a.name.localeCompare(b.name, 'ko'))
        };

        const workbook = new ExcelJS.Workbook();
        const positions = ['장로', '안수집사', '권사'];
        const imageDir = path.join(__dirname, 'public', 'images', 'candidates');

        for (const pos of positions) {
            const candidates = groups[pos];
            if (!candidates || candidates.length === 0) continue;

            console.log(`- ${pos} 시트 생성 중... (${candidates.length}명)`);
            const sheet = workbook.addWorksheet(pos);

            // 헤더 설정
            sheet.columns = [
                { header: '사진', key: 'photo', width: 15 },
                { header: '이름', key: 'name', width: 12 },
                { header: '봉사내역', key: 'profile', width: 45 },
                { header: '가족사항/추가정보', key: 'volunteer', width: 35 },
                { header: '교구', key: 'district', width: 10 }
            ];

            // 헤더 스타일
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

            for (let i = 0; i < candidates.length; i++) {
                const c = candidates[i];
                const rowNumber = i + 2;
                const row = sheet.addRow({
                    name: c.name,
                    profile: c.profileDesc || '',
                    volunteer: c.volunteerInfo || '',
                    district: c.district || ''
                });

                // 행 높이 조절 (사진 공간 확보)
                row.height = 80;
                row.alignment = { vertical: 'middle', wrapText: true };

                // 이미지 삽입
                const imageName = `${c.name}.jpg`;
                const imagePath = path.join(imageDir, imageName);

                if (fs.existsSync(imagePath)) {
                    const imageId = workbook.addImage({
                        filename: imagePath,
                        extension: 'jpeg',
                    });
                    
                    // 첫 번째 열 (A)에 삽입
                    sheet.addImage(imageId, {
                        tl: { col: 0.1, row: rowNumber - 0.9 }, // 약간의 여백
                        ext: { width: 85, height: 100 } // 정해진 크기
                    });
                } else {
                    row.getCell('photo').value = '사진 없음';
                    console.warn(`! 사진 파일을 찾을 수 없음: ${imageName}`);
                }
            }
        }

        const filename = '2차_후보자_프로필_공고용_사진포함.xlsx';
        await workbook.xlsx.writeFile(filename);
        console.log(`\n성공! 파일이 생성되었습니다: ${filename}`);

    } catch (error) {
        console.error("오류 발생:", error);
    }
}

generate();
