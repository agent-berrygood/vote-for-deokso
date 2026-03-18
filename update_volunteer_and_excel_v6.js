
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');
const ExcelJS = require('exceljs');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});
const db = getFirestore(app);

function parsePerfect(html) {
    const map = {};
    const rows = html.split('<tr');
    console.log(`- 전체 행(Row) 개수: ${rows.length}`);
    
    let parsedCount = 0;
    
    rows.forEach(row => {
        // 이름 추출 (안전하고 빠른 indexOf 방식)
        let name = '';
        const nameIdx = row.indexOf(`class='pname'>`);
        if (nameIdx > -1) {
            const endIdx = row.indexOf('</td>', nameIdx);
            if (endIdx > -1) {
                name = row.slice(nameIdx + 14, endIdx).replace(/<[^>]*>/g, '').replace(/\s/g, '');
            }
        }
        if (!name) return;

        // 부서 추출
        let dept = '부서미상';
        const p2Idx = row.indexOf(`class='p-2'>`);
        if (p2Idx > -1) {
            const endIdx = row.indexOf('</td>', p2Idx);
            if (endIdx > -1) {
                dept = row.slice(p2Idx + 12, endIdx).replace(/<[^>]*>/g, '').trim();
                dept = dept.replace(/^.*\[.*?\]/, '').trim(); // '교구 [덕소]목장지기' -> '목장지기'
            }
        } else {
            // 따옴표 다를 경우 대비
            const p2Idx2 = row.indexOf(`class="p-2">`);
            if (p2Idx2 > -1) {
                const endIdx = row.indexOf('</td>', p2Idx2);
                if (endIdx > -1) {
                    dept = row.slice(p2Idx2 + 12, endIdx).replace(/<[^>]*>/g, '').trim();
                    dept = dept.replace(/^.*\[.*?\]/, '').trim(); // 카테고리 제거
                }
            }
        }

        // 연도 및 봉사실적 여부 추출
        const yearsMatched = [];
        let searchIdx = 0;
        while(true) {
            const sYearIdx = row.indexOf(`SYear='`, searchIdx);
            if (sYearIdx === -1) break;
            
            const startYear = sYearIdx + 7;
            const endYear = row.indexOf(`'`, startYear);
            if(endYear > -1) {
                const yStr = row.slice(startYear, endYear).trim();
                const yNum = parseInt(yStr, 10);
                
                if (yNum >= 2021 && yNum <= 2026) {
                    // 해당 td 태그가 닫히기 전까지 혹은 다음 td 태그가 시작되기 전까지 span 태그 등 무언가 컨텐츠가 있는지 확인
                    const tdEndIdx = row.indexOf('</td>', endYear);
                    const tdContentStart = row.indexOf('>', endYear) + 1;
                    if(tdEndIdx > tdContentStart) {
                        const cellContent = row.slice(tdContentStart, tdEndIdx).trim();
                        if(cellContent !== '') {
                            yearsMatched.push(yStr.slice(-2));
                        }
                    }
                }
            }
            searchIdx = sYearIdx + 7;
        }

        if (yearsMatched.length > 0) {
            parsedCount++;
            if (!map[name]) map[name] = [];
            yearsMatched.forEach(y => {
                map[name].push({ dept, year: y });
            });
        }
    });

    console.log(`- 봉사 이력이 있는 행 수 (최근 5년): ${parsedCount}`);
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
        .join('\n');
}

async function run() {
    try {
        console.log("1. 봉사 정보 파일 직독직해 매칭 중 (v6)...");
        const html = fs.readFileSync('j:\\내 드라이브\\선거 테스트\\당회보고용\\봉사정보\\봉사정보_0304.xls', 'utf8');
        const volunteerMap = parsePerfect(html);
        console.log("- 데이터 추출 성도 종류 (최소 하나 이상 봉사이력 보유):", Object.keys(volunteerMap).length);

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
        // 공고용 엑셀 이미지 폴더 경로
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
                const cleanName = c.name.replace(/\s/g, '');
                const history = volunteerMap[cleanName] || [];
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
                    profile: cleanProfile || (c.profileDesc ? c.profileDesc : ''), 
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
        
        console.log(`=> 전체 후보자(${candidates.length}명) 중 ${successfulMatches}명 봉사 이력 발견 및 반영 완료!`);

        const fileName = '2차_후보자_프로필_최종_정상수정_v6.xlsx';
        await workbook.xlsx.writeFile(fileName);
        console.log("- 파일 생성 완료:", fileName);

    } catch (err) {
        console.error("에러:", err);
    }
}

run();
