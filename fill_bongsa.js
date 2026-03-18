const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ======================== FILE PATHS ========================
const bongsaFile = String.raw`j:\내 드라이브\선거 테스트\당회보고용\봉사정보\봉사정보_0304.xls`;
const kwonsaFile = String.raw`j:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업\가공완료_권사후보_0306.xlsx`;
const jipsaFile = String.raw`j:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업\가공완료_안수집사후보_0306.xlsx`;

// Local output paths
const localOutKwonsa = path.join(__dirname, 'output_kwonsa_0306.xlsx');
const localOutJipsa = path.join(__dirname, 'output_jipsa_0306.xlsx');

// ======================== PARSE 봉사정보 (HTML) ========================
const html = fs.readFileSync(bongsaFile, 'utf-8');

const yearHeaders = [];
const thMatches = html.matchAll(/<th[^>]*>\s*(\d{4})\s*<\/th>/g);
for (const m of thMatches) yearHeaders.push(parseInt(m[1]));

const trRegex = /<tr[^>]*class='tr_cs'[^>]*>([\s\S]*?)<\/tr>/g;
const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;

const people = {};
let match;
while ((match = trRegex.exec(html)) !== null) {
    const trContent = match[1];
    const cells = [];
    let tdMatch;
    while ((tdMatch = tdRegex.exec(trContent)) !== null) {
        cells.push(tdMatch[1].replace(/<[^>]*>/g, '').trim());
    }
    if (cells.length >= 2) {
        const name = cells[1];
        let bongsa = cells[7] || '';
        const bongsaClean = bongsa.replace(/^[^\[]*\[덕소\]/, '').trim() || bongsa;
        const yearData = {};
        for (let i = 0; i < yearHeaders.length; i++) {
            const val = cells[8 + i] || '';
            if (val && val.trim()) yearData[yearHeaders[i]] = true;
        }
        if (!people[name]) people[name] = [];
        people[name].push({ bongsa: bongsaClean, yearData });
    }
}

// ======================== FORMAT ========================
function formatBongsaInfo(entries) {
    if (!entries || entries.length === 0) return '';

    const formatted = entries.map(e => {
        const years = Object.keys(e.yearData).map(Number).sort((a, b) => a - b);
        if (years.length === 0) return null;

        const groups = [];
        let start = years[0], end = years[0];
        for (let i = 1; i < years.length; i++) {
            if (years[i] === end + 1) { end = years[i]; }
            else { groups.push([start, end]); start = years[i]; end = years[i]; }
        }
        groups.push([start, end]);

        const yearStr = groups.map(([s, e]) => {
            const s2 = String(s).slice(2);
            const e2 = String(e).slice(2);
            return s === e ? s2 : `${s2}~${e2}`;
        }).join(',');

        return { text: `${e.bongsa}(${yearStr})`, mostRecentYear: Math.max(...years) };
    }).filter(x => x !== null);

    formatted.sort((a, b) => b.mostRecentYear - a.mostRecentYear);
    return formatted.slice(0, 3).map(f => f.text).join('\n');
}

// ======================== UPDATE ========================
function updateExcel(inputPath, outputPath, label) {
    // Read from buffer to avoid EBUSY
    const buffer = fs.readFileSync(inputPath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const volIdx = 6;
    let updatedCount = 0;
    const updatedNames = [];
    const emptyNames = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const name = row[0];
        if (!name || typeof name !== 'string') continue;

        const currentVol = row[volIdx];
        if (currentVol && String(currentVol).trim()) continue;

        const entries = people[name] || people[name.replace(/[A-Z]$/, '')];
        if (entries) {
            const info = formatBongsaInfo(entries);
            if (info) {
                row[volIdx] = info;
                updatedCount++;
                updatedNames.push(name);
            } else {
                emptyNames.push(name);
            }
        } else {
            emptyNames.push(name);
        }
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write to LOCAL path
    XLSX.writeFile(wb, outputPath);

    console.log(`\n=== ${label} ===`);
    console.log(`봉사정보 기입: ${updatedCount}명`);
    if (updatedNames.length) console.log(`  기입 대상: ${updatedNames.join(', ')}`);
    if (emptyNames.length) console.log(`  봉사정보 없음: ${emptyNames.join(', ')}`);
    console.log(`  저장: ${outputPath}`);
}

updateExcel(kwonsaFile, localOutKwonsa, '권사 후보');
updateExcel(jipsaFile, localOutJipsa, '안수집사 후보');

console.log('\n✅ 로컬에 저장 완료! 이제 원본 위치에 복사합니다...');
