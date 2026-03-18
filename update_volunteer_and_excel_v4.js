
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

function parseRobust(html) {
    const volunteerMap = {};
    // 모든 <td> 태그 추출
    const tdMatches = html.match(/<td[^>]*>/g) || [];
    console.log(`- 전체 <td> 태그 수: ${tdMatches.length}개`);

    tdMatches.forEach(td => {
        // 각 속성을 독립적으로 추출 (대소문자 무관, 작은따옴표/큰따옴표 지원)
        const yearM = td.match(/[sS][yY][eE][aA][rR]\s*=\s*['"]([^'"]*)['"]/);
        const nameM = td.match(/[sS][nN][aA][mM][eE]\s*=\s*['"]([^'"]*)['"]/);
        const partM = td.match(/[sS][pP][aA][rR][tT]\s*=\s*['"]([^'"]*)['"]/);

        if (yearM && nameM && partM) {
            const yearStr = yearM[1].trim();
            const rawName = nameM[1].trim();
            const dept = partM[1].trim();
            
            if (yearStr && rawName && dept) {
                const yearNum = parseInt(yearStr);
                // 최근 5년 (21~26)
                if (yearNum >= 2021 && yearNum <= 2026) {
                    const cleanName = rawName.replace(/\s/g, ''); // 이름 공백 제거
                    if (!volunteerMap[cleanName]) volunteerMap[cleanName] = [];
                    volunteerMap[cleanName].push({ dept, year: yearStr.slice(-2) });
                }
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
        .sort()
        .join(' \\n ');
}

async function run() {
    try {
        console.log("1. 봉사 정보 파일 정밀 파싱 중 (v4)...");
        const html = fs.readFileSync('j:\\내 드라이브\\선거 테스트\\당회보고용\\봉사정보\\봉사정보_0304.xls', 'utf8');
        const volunteerMap = parseRobust(html);
        console.log("- 데이터 매칭 가능 성도 수 (5년):", Object.keys(volunteerMap).length);

        console.log("2. 2차 후보자 데이터 매칭 중...");
        const systemDoc = await getDoc(doc(db, 'settings', 'system'));
        const activeElectionId = systemDoc.exists() ? systemDoc.data().activeElectionId : 'default-2026';
        const q = query(collection(db, `elections/${activeElectionId}/candidates`), where('round', '==', 2));
        const querySnapshot = await getDocs(q);
        const candidates = [];
        querySnapshot.forEach(docSnap => candidates.push({ id: docSnap.id, ...docSnap.data() }));

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
                const cleanCandidateName = c.name.replace(/\s/g, '');
                const history = volunteerMap[cleanCandidateName] || [];
                const formattedVolunteer = formatVolunteerInfo(history);
                
                // profileDesc에서 봉사 관련 내용 제거 시도 (가족사항만 남기기)
                const cleanProfile = (c.profileDesc || '')
                    .split('\n')
                    .filter(line => !line.includes('봉사') && !line.includes('부서'))
                    .join('\n')
                    .trim();

                const row = sheet.addRow({
                    name: c.name,
                    volunteer: formattedVolunteer || '데이터 없음', 
                    profile: cleanProfile || (c.profileDesc ? '기존 정보 확인: ' + c.profileDesc : ''), 
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

        const fileName = '2차_후보자_프로필_최종_정상수정.xlsx';
        await workbook.xlsx.writeFile(fileName);
        console.log("- 최종 파일 생성 완료:", fileName);

    } catch (err) {
        console.error("에러:", err);
    }
}

run();
