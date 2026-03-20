
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
    
    rows.forEach(row => {
        let name = '';
        const nameIdx = row.indexOf(`class='pname'>`);
        if (nameIdx > -1) {
            const endIdx = row.indexOf('</td>', nameIdx);
            if (endIdx > -1) {
                name = row.slice(nameIdx + 14, endIdx).replace(/<[^>]*>/g, '').replace(/\s/g, '');
            }
        }
        if (!name) return;

        let dept = '부서미상';
        const p2Idx = row.indexOf(`class='p-2'>`);
        if (p2Idx > -1) {
            const endIdx = row.indexOf('</td>', p2Idx);
            if (endIdx > -1) {
                dept = row.slice(p2Idx + 12, endIdx).replace(/<[^>]*>/g, '').trim();
                dept = dept.replace(/^.*\[.*?\]/, '').trim(); // 카테고리 제거
            }
        } else {
            const p2Idx2 = row.indexOf(`class="p-2">`);
            if (p2Idx2 > -1) {
                const endIdx = row.indexOf('</td>', p2Idx2);
                if (endIdx > -1) {
                    dept = row.slice(p2Idx2 + 12, endIdx).replace(/<[^>]*>/g, '').trim();
                    dept = dept.replace(/^.*\[.*?\]/, '').trim(); // 카테고리 제거
                }
            }
        }

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
                    const tdEndIdx = row.indexOf('</td>', endYear);
                    const tdContentStart = row.indexOf('>', endYear) + 1;
                    if(tdEndIdx > tdContentStart) {
                        const cellContent = row.slice(tdContentStart, tdEndIdx).trim();
                        if(cellContent !== '') yearsMatched.push(yStr.slice(-2));
                    }
                }
            }
            searchIdx = sYearIdx + 7;
        }

        if (yearsMatched.length > 0) {
            if (!map[name]) map[name] = [];
            yearsMatched.forEach(y => { map[name].push({ dept, year: y }); });
        }
    });

    return map;
}

function parseFamilyInfo(html) {
    const map = {};
    const rows = html.split('<tr');
    rows.forEach(row => {
        const tds = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
        if(tds && tds.length >= 3) {
            const name = tds[0].replace(/<[^>]*>/g, '').replace(/\s/g, '');
            const spouse = tds[1].replace(/<[^>]*>/g, '').trim();
            const family = tds[2].replace(/<[^>]*>/g, '').trim();
            
            if(name && name !== '이름' && name !== '성명') {
                map[name] = { spouse, family };
            }
        }
    });
    return map;
}

function formatVolunteerInfo(history) {
    if (!history || history.length === 0) return '';
    const deptInfo = {};
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
        .join('\n'); // 줄바꿈 문자
}

async function run() {
    try {
        console.log("1. 봉사 정보 파일 (v6) 및 가족 정보 파싱 중...");
        const htmlVol = fs.readFileSync('j:\\내 드라이브\\선거 테스트\\당회보고용\\봉사정보\\봉사정보_0304.xls', 'utf8');
        const volunteerMap = parsePerfect(htmlVol);

        const htmlFam = fs.readFileSync('j:\\내 드라이브\\선거 테스트\\2차후보\\후보 가족.xls', 'utf8');
        const familyMap = parseFamilyInfo(htmlFam);

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

        let familyMatches = 0;

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
                
                // 가족 정보 조합
                let cleanProfile = '';
                const famData = familyMap[cleanName];
                if (famData) {
                    familyMatches++;
                    if (famData.spouse) cleanProfile += `배우자: ${famData.spouse}\n`;
                    if (famData.family) {
                        const familyStr = famData.family.replace(/\s+/g, ', ');
                        cleanProfile += `가족: ${familyStr}\n`;
                    }
                }

                // 기존 프로필(봉사 제거 버전) 덧붙이기 (만약 내용이 있다면)
                const firebaseProfile = (c.profileDesc || '')
                    .split('\n')
                    .filter(line => !line.includes('봉사') && !line.includes('부서'))
                    .join('\n')
                    .trim();
                
                if (firebaseProfile && !cleanProfile.includes(firebaseProfile)) {
                    if (cleanProfile) cleanProfile += '\n'; // 구분선 혹은 줄바꿈
                    cleanProfile += firebaseProfile;
                }

                const row = sheet.addRow({
                    name: c.name,
                    volunteer: formattedVolunteer || '데이터 없음', 
                    profile: cleanProfile.trim() || '', 
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
        
        console.log(`=> 전체 후보자 중 ${familyMatches}명 가족 정보 매칭 및 отра!`);

        const fileName = '2차_후보자_프로필_최종_정상수정_v6.xlsx';
        await workbook.xlsx.writeFile(fileName);
        console.log("- 파일 덮어쓰기 완료:", fileName);

    } catch (err) {
        console.error("에러:", err);
    }
}

run();
