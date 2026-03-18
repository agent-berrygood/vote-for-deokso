const fs = require('fs');
const XLSX = require('xlsx');

const bongsaFile = String.raw`j:\내 드라이브\선거 테스트\당회보고용\봉사정보\봉사정보_0304.xls`;
const html = fs.readFileSync(bongsaFile, 'utf-8');

// Parse HTML table rows
// Each data row looks like: <tr ...><td>번호</td><td class='pname'>이름</td>...봉사부서 td...연도별 td...</tr>
// Header columns: 번호, 이름, 나이, 휴대폰, 직분, 행정분류, 신급, 봉사부서, 2025, 2009, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 봉사년수

// Extract year headers first
const yearHeaders = [];
const thMatches = html.matchAll(/<th[^>]*>\s*(\d{4})\s*<\/th>/g);
for (const m of thMatches) {
    yearHeaders.push(parseInt(m[1]));
}
console.log('Year headers found:', yearHeaders);

// Extract data rows
const trRegex = /<tr[^>]*class='tr_cs'[^>]*>([\s\S]*?)<\/tr>/g;
const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;

const people = {};
let match;
while ((match = trRegex.exec(html)) !== null) {
    const trContent = match[1];
    const cells = [];
    let tdMatch;
    while ((tdMatch = tdRegex.exec(trContent)) !== null) {
        // Clean HTML tags from cell content
        let cellText = tdMatch[1].replace(/<[^>]*>/g, '').trim();
        cells.push(cellText);
    }

    if (cells.length >= 2) {
        const name = cells[1]; // 이름
        const bongsa = cells[7] || ''; // 봉사부서

        // Year data starts from column 8
        // yearHeaders: the years in order
        const yearData = {};
        for (let i = 0; i < yearHeaders.length; i++) {
            const val = cells[8 + i] || '';
            if (val && val.trim()) {
                yearData[yearHeaders[i]] = val.trim();
            }
        }

        if (!people[name]) {
            people[name] = [];
        }
        people[name].push({ bongsa, yearData });
    }
}

// Show sample people
const names = Object.keys(people);
console.log(`\nTotal people found: ${names.length}`);

// Show first 5 people
let output = '';
function log(msg) { output += msg + '\n'; }

log(`Total people: ${names.length}`);
log(`Year headers: ${yearHeaders.join(', ')}`);

// Show 5 sample entries
for (const name of names.slice(0, 5)) {
    log(`\n=== ${name} ===`);
    for (const entry of people[name]) {
        log(`  봉사부서: ${entry.bongsa}`);
        log(`  연도별: ${JSON.stringify(entry.yearData)}`);
    }
}

// Now check specific people from the newly added list
const kwonsaNew = ['권현옥', '김경화B', '김미홍', '김민경A', '김선희A', '김수연C', '김은교', '김진C', '김희정B', '남현주', '박보은A', '박성희', '박은비', '박진희', '백종옥', '서임연', '성정은', '손민지', '손수미', '손현정', '양정숙', '유월진', '유정민', '유현주', '이보은', '이세리', '이영희B', '이옥자', '이원화', '이유선', '이은희', '이정숙', '이혜정', '이희영', '장순옥', '전순주', '정태희', '정혜경B', '최계영', '최진희', '최혜은', '황혜훈'];
const jipsaNew = ['김남훈', '김성은', '김성중', '김순철', '김한진', '김현용', '노희찬', '박근원', '박대수', '박승갑', '박정현', '양창석', '원병수', '유승곤', '이승화', '이정환', '장기문', '장석종', '정양근', '조철', '한지환'];

log(`\n\n=== 새로 추가된 권사 후보 봉사 정보 ===`);
for (const name of kwonsaNew) {
    // Try exact match, or match without suffix (A, B, C)
    const baseName = name.replace(/[A-Z]$/, '');
    if (people[name]) {
        log(`\n${name}: ${people[name].length}건`);
        for (const e of people[name]) log(`  ${e.bongsa} | ${JSON.stringify(e.yearData)}`);
    } else if (people[baseName]) {
        log(`\n${name} (→ ${baseName}): ${people[baseName].length}건`);
        for (const e of people[baseName]) log(`  ${e.bongsa} | ${JSON.stringify(e.yearData)}`);
    } else {
        log(`\n${name}: ❌ 봉사정보 없음`);
    }
}

log(`\n\n=== 새로 추가된 안수집사 후보 봉사 정보 ===`);
for (const name of jipsaNew) {
    const baseName = name.replace(/[A-Z]$/, '');
    if (people[name]) {
        log(`\n${name}: ${people[name].length}건`);
        for (const e of people[name]) log(`  ${e.bongsa} | ${JSON.stringify(e.yearData)}`);
    } else if (people[baseName]) {
        log(`\n${name} (→ ${baseName}): ${people[baseName].length}건`);
        for (const e of people[baseName]) log(`  ${e.bongsa} | ${JSON.stringify(e.yearData)}`);
    } else {
        log(`\n${name}: ❌ 봉사정보 없음`);
    }
}

fs.writeFileSync('bongsa_parsed.txt', output, 'utf-8');
console.log('Written to bongsa_parsed.txt');
