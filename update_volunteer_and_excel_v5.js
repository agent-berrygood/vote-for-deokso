
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

function parseTableRows(html) {
    const map = {};
    const rows = html.split('<tr');
    console.log(`- 전체 행(Row) 개수: ${rows.length}`);
    
    let parsedCount = 0;
    
    rows.forEach(row => {
        // 이름 추출: <td class='pname'>홍길동</td>
        const nameMatch = row.match(/<td class=['"]?pname['"]?[^>]*>([^<]+)<\/td>/);
        if (!nameMatch) return;
        const name = nameMatch[1].replace(/\s/g, ''); // 공백 제거
        
        // 부서 추출: <td align='left' class='p-2'>교구 [덕소]목장지기</td>
        const deptMatch = row.match(/<td align=['"]?left['"]? class=['"]?p-2['"]?[^>]*>([^<]+)<\/td>/);
        const dept = deptMatch ? deptMatch[1].trim() : '부서미상';

        // 연도별 내역 추출: <td ... SYear='202X'>...</td> 안쪽 내용 확인.
        // 스판 태그가 있거나 빈값이 아니면 봉사한 것임 ('1 ' 등 값이 들어있음)
        // 빠른 처리를 위해 단순 정규식과 matchAll 활용
        const yearsMatched = [];
        const tdRegex = /<td[^>]*SYear=['"]?\s*(\d{4})['"]?[^>]*>(.*?)<\/td>/g;
        let tdm;
        while ((tdm = tdRegex.exec(row)) !== null) {
            const y = tdm[1];
            const content = tdm[2].trim();
            const yearNum = parseInt(y);
            // 봉사 실적이 있고, 최근 5년 이력이면 (내부에 뭔가가 기록되어 있으면)
            if (yearNum >= 2021 && yearNum <= 2026 && content !== '') {
                yearsMatched.push(y.slice(-2));
            }
        }
        
        if (yearsMatched.length > 0) {
            parsedCount++;
            if (!map[name]) map[name] = [];
            yearsMatched.forEach(y => {
                map[name].push({ dept, year: y });
            });
        }
    });

    console.log(`- [성공] 봉사 이력이 있는 행 수 (최근 5년): ${parsedCount}`);
    return map;
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
        console.log("1. 봉사 정보 파일 행(Row) 단위 정밀 파싱 중 (v5)...");
        const html = fs.readFileSync('j:\\내 드라이브\\선거 테스트\\당회보고용\\봉사정보\\봉사정보_0304.xls', 'utf8');
        const volunteerMap = parseTableRows(html);
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

        let successfulMatches = 0;

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
                
                if (formattedVolunteer) successfulMatches++;

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
        
        console.log(`- 전체 후보자(${candidates.length}명) 중 ${successfulMatches}명 봉사 이력 매칭 성공`);

        const fileName = '2차_후보자_프로필_최종_정렬수정.xlsx';
        await workbook.xlsx.writeFile(fileName);
        console.log("- 최종 파일 생성 완료:", fileName);

    } catch (err) {
        console.error("에러:", err);
    }
}

run();
