
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

// 5년 이력 추출 함수 (21~26년)
function parseVolunteerHistory(html) {
    const volunteerMap = {}; // name -> [{ dept, year }]
    
    // 이 파일은 <table> 구조가 아닌 커스텀 HTML일 수 있음
    // <tr>...<td class='NAME'>홍길동</td><td class='DEPT'>교구</td><td class='YY'>2024</td>...</tr> 형태 추정
    // 실제 스니펫을 기반으로 정규식 추출
    // <td  class='xs t-center'>1   </td><td  class='xs t-center'>성도</td><td  class='xs t-center'>고여진</td>...
    
    const rows = html.split(/<tr/g);
    rows.forEach(row => {
        // 간단한 정규식으로 이름, 부서, 연도 추출 시도 (HTML 태그 제거하며)
        const cellMatches = row.match(/<td[^>]*>(.*?)<\/td>/g);
        if (cellMatches && cellMatches.length >= 10) {
            const clean = (str) => str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
            const name = clean(cellMatches[2]);
            const dept = clean(cellMatches[6]);
            const year = clean(cellMatches[10]); // 연도가 들어있는 인덱스 추정 (2024 등)

            if (name && dept && year) {
                const yearNum = parseInt(year);
                if (yearNum >= 2021 && yearNum <= 2026) {
                    if (!volunteerMap[name]) volunteerMap[name] = [];
                    volunteerMap[name].push({ dept, year: year.slice(2) }); // '2024' -> '24'
                }
            }
        }
    });
    return volunteerMap;
}

// 부서별 연도 묶기 (부서(24~26) 형태)
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
        console.log("1. 봉사 정보 파일 읽는 중...");
        const html = fs.readFileSync('j:\\내 드라이브\\선거 테스트\\당회보고용\\봉사정보\\봉사정보_0304.xls', 'utf8');
        const volunteerMap = parseVolunteerHistory(html);
        console.log("- 파싱된 성도 수 (5년 이력 보유):", Object.keys(volunteerMap).length);

        console.log("2. 활성 선거 2차 후보자 데이터 가져오는 중...");
        const systemDoc = await getDoc(doc(db, 'settings', 'system'));
        const activeElectionId = systemDoc.exists() ? systemDoc.data().activeElectionId : 'default-2026';
        
        const q = query(
            collection(db, `elections/${activeElectionId}/candidates`),
            where('round', '==', 2)
        );
        const querySnapshot = await getDocs(q);
        const candidates = [];
        querySnapshot.forEach(docSnap => {
            candidates.push({ id: docSnap.id, ...docSnap.data() });
        });

        console.log(`- 대상 후보자 수: ${candidates.length}명`);

        // 데이터 보정: 가족사항에 봉사가 들어가 있다면 분리/수정
        candidates.forEach(c => {
            // 외부 파일에서 새로 가져온 5년 정보로 봉사 이력 업데이트
            const newHistory = volunteerMap[c.name] || [];
            c.volunteerInfo = formatVolunteerInfo(newHistory); // 봉사내역 필드에 5년치 정보 (요청 형식)
            // 가족사항 필드는 기존 volunteerInfo에 들어있던 봉사 정보를 제거해야 하므로, 
            // 현재 구조상 profileDesc(봉사내역)와 volunteerInfo(가족사항)가 혼용된 것으로 보임.
            // 사용자의 피드백: "가족사항 및 추가정보에 봉사정보가 들어가 있다" 
            // -> volunteerInfo 필드 전체를 5년 봉사 정보로 덮어쓰거나, 봉사 정보를 추출해내야 함.
            // 여기서는 요청하신 대로 '부서(연도)' 형태로 새로 작성합니다.
        });

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

            for (let i = 0; i < list.length; i++) {
                const c = list[i];
                const rowNum = i + 2;
                // profileDesc에 있던 내용을 가족사항으로, 새로 만든 volunteerInfo를 봉사내역으로 스왑 배치 (피드백 반영)
                const row = sheet.addRow({
                    name: c.name,
                    volunteer: c.volunteerInfo, // oooo부 (24~26)
                    profile: c.profileDesc, // 기존 봉사내역을 일단 가족사항 자리에 (사용자 요청에 따라 데이터 정돈 필요할 수 있음)
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
            }
        }

        const fileName = '2차_후보자_프로필_봉사5년수정.xlsx';
        await workbook.xlsx.writeFile(fileName);
        console.log(`- 파일 생성 완료: ${fileName}`);

    } catch (err) {
        console.error("에러:", err);
    }
}

run();
