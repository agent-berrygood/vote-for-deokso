
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');
const ExcelJS = require('exceljs');
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

// 유연한 속성 기반 파싱 함수 (Flexible Attribute Extraction)
function parseFlexible(html) {
    const volunteerMap = {};
    // 각 <td> 태그를 먼저 추출하고 그 안의 속성을 파싱
    const tdRegex = /<td[^>]*SYear='(\d+)'[^>]*SName='([^']+)'[^>]*SPartName='([^']+)'[^>]*>/g;
    
    // 만약 순서가 정해져 있지 않다면 위 방식도 실패할 수 있으므로 
    // 모든 <td>를 찾아서 개별적으로 속성을 추출하는 것이 더 확실함
    const allTdMatches = html.match(/<td[^>]*SYear='[^']*'[^>]*>/g);
    if (!allTdMatches) return {};

    allTdMatches.forEach(td => {
        const yearMatch = td.match(/SYear='([^']*)'/);
        const nameMatch = td.match(/SName='([^']*)'/);
        const deptMatch = td.match(/SPartName='([^']*)'/);

        if (yearMatch && nameMatch && deptMatch) {
            const year = yearMatch[1];
            const name = nameMatch[1].trim();
            const dept = deptMatch[1].trim();
            
            const yearNum = parseInt(year);
            // 최근 5년 이력 여부 확인 (2021~2026)
            if (yearNum >= 2021 && yearNum <= 2026) {
                if (!volunteerMap[name]) volunteerMap[name] = [];
                volunteerMap[name].push({ dept, year: year.slice(2) });
            }
        }
    });

    return volunteerMap;
}

function formatVolunteerInfo(history) {
    if (!history || history.length === 0) return '';
    const deptInfo = {}; // dept -> [years]
    history.forEach(h => {
        if (!deptInfo[h.dept]) deptInfo[h.dept] = [];
        deptInfo[h.dept].push(h.year);
    });

    return Object.entries(deptInfo)
        .map(([dept, years]) => {
            const sortedYears = [...new Set(years)].sort();
            if (sortedYears.length > 1) {
                return `${dept} (${sortedYears[0]}~${sortedYears[sortedYears.length-1]})`;
            }
            return `${dept} (${sortedYears[0]})`;
        })
        .join(' \\n ');
}

async function run() {
    try {
        console.log("1. 봉사 정보 파일 정밀 분석 중...");
        const html = fs.readFileSync('j:\\내 드라이브\\선거 테스트\\당회보고용\\봉사정보\\봉사정보_0304.xls', 'utf8');
        const volunteerMap = parseFlexible(html);
        console.log("- 데이터 추출된 성도 수 (5년 이력):", Object.keys(volunteerMap).length);

        console.log("2. 2차 후보자 데이터 매칭 중...");
        const systemDoc = await getDoc(doc(db, 'settings', 'system'));
        const activeElectionId = systemDoc.exists() ? systemDoc.data().activeElectionId : 'default-2026';
        const q = query(collection(db, `elections/${activeElectionId}/candidates`), where('round', '==', 2));
        const querySnapshot = await getDocs(q);
        const candidates = [];
        querySnapshot.forEach(docSnap => candidates.push({ id: docSnap.id, ...docSnap.data() }));
        console.log(`- 전체 대상 후보자 수: ${candidates.length}명`);

        console.log("3. 엑셀 파일 생성 중...");
        const workbook = new ExcelJS.Workbook();
        const positions = ['장로', '안수집사', '권사'];
        const imageDir = path.join(__dirname, 'public', 'images', 'candidates');

        for (const pos of positions) {
            const list = candidates.filter(c => c.position === pos).sort((a,b) => a.name.localeCompare(b.name, 'ko'));
            if (list.length === 0) continue;

            const sheet = workbook.addWorksheet(pos);
            sheet.columns = [
                { header: '사진', key: 'photo', width: 15 },
                { header: '이름', key: 'name', width: 12 },
                { header: '봉사내역 (최근 5년)', key: 'volunteer', width: 45 },
                { header: '가족사항/추가정보', key: 'profile', width: 35 },
                { header: '교구', key: 'district', width: 10 }
            ];

            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).alignment = { horizontal: 'center' };

            list.forEach((c, i) => {
                const rowNum = i + 2;
                const newVolunteer = formatVolunteerInfo(volunteerMap[c.name]);
                
                // 피드백 반영: 가족사항 필드도 정돈 
                // (기존 profileDesc에 "봉사: ..." 등이 섞여 있을 수 있으나, 일단은 profileDesc 전체를 그대로 표시)
                const row = sheet.addRow({
                    name: c.name,
                    volunteer: newVolunteer || '데이터 없음', 
                    profile: (c.profileDesc || '').replace(/봉사[:\s].*/g, '').trim(), // 봉사라고 써있는 이후 내용 제거 시도
                    district: c.district || ''
                });
                row.height = 80;
                row.alignment = { vertical: 'middle', wrapText: true };

                const imgPath = path.join(imageDir, `${c.name}.jpg`);
                if (fs.existsSync(imgPath)) {
                    const imgId = workbook.addImage({ filename: imgPath, extension: 'jpeg' });
                    sheet.addImage(imgId, {
                        tl: { col: 0.1, row: rowNum - 0.9 },
                        ext: { width: 85, height: 100 }
                    });
                }
            });
        }

        const fileName = '2차_후보자_프로필_최종_봉사5년수정.xlsx';
        await workbook.xlsx.writeFile(fileName);
        console.log("- 파일 생성 완료:", fileName);

    } catch (err) {
        console.error("에러:", err);
    }
}

run();
