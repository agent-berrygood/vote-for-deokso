const fs = require('fs');
const XLSX = require('xlsx');

// 1. Process Volunteer Info
const html = fs.readFileSync('j:/내 드라이브/선거 테스트/당회보고용/봉사정보/봉사정보.xls', 'utf-8');
const rows = html.split('<tr');
const volunteerData = {};
const uniqueYearsData = {};

let count = 0;
for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const nameMatch = row.match(/class='pname'>([^<]+)<\/td>/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    const deptMatch = row.match(/class='p-2'>([^<]+)<\/td>/);
    if (!deptMatch) continue;
    let dept = deptMatch[1].trim();
    dept = dept.replace(/^.*?\[.*?\]/, '').trim();

    const yearParts = row.split("SYear='");
    const years = [];
    for (let j = 1; j < yearParts.length; j++) {
        const part = yearParts[j];
        const endQuote = part.indexOf("'");
        if (endQuote === -1) continue;
        const yearStr = part.substring(0, endQuote).trim();

        const tdEnd = part.indexOf("</td>");
        if (tdEnd === -1) continue;
        const tdContent = part.substring(endQuote, tdEnd);
        if (tdContent.includes('>1') || tdContent.includes('btn-success\'>1') || tdContent.includes('>1\t')) {
            if (yearStr.includes('.')) {
                yearStr.split('.').forEach(y => years.push(parseInt(y)));
            } else {
                years.push(parseInt(yearStr));
            }
        } else if (tdContent.match(/>\s*1\s*</)) {
            years.push(parseInt(yearStr));
        }
    }

    if (years.length > 0) {
        if (!uniqueYearsData[name]) uniqueYearsData[name] = new Set();
        if (!volunteerData[name]) volunteerData[name] = {};
        if (!volunteerData[name][dept]) volunteerData[name][dept] = new Set();
        years.forEach(y => {
            if (!isNaN(y)) {
                volunteerData[name][dept].add(y);
                uniqueYearsData[name].add(y);
            }
        });
    }
}

function formatYears(yearsSet) {
    let years = Array.from(yearsSet).sort((a, b) => a - b);
    if (years.length === 0) return '';
    let ranges = [];
    let start = years[0];
    let end = years[0];
    for (let i = 1; i < years.length; i++) {
        if (years[i] === end + 1) {
            end = years[i];
        } else {
            ranges.push(start === end ? `${start % 100}` : `${start % 100}~${end % 100}`);
            start = years[i];
            end = years[i];
        }
    }
    ranges.push(start === end ? `${start % 100}` : `${start % 100}~${end % 100}`);
    return ranges.join(', ');
}

const resultData = {};
for (const name in volunteerData) {
    const depts = [];
    for (const dept in volunteerData[name]) {
        if (volunteerData[name][dept].size === 0) continue;
        const yearsSet = volunteerData[name][dept];
        const maxYear = Math.max(...Array.from(yearsSet));
        depts.push({
            name: dept,
            yearsText: formatYears(yearsSet),
            maxYear: maxYear
        });
    }
    depts.sort((a, b) => b.maxYear - a.maxYear);
    const top3 = depts.slice(0, 3);
    const textLines = top3.map(d => `${d.name} (${d.yearsText})`);
    resultData[name] = textLines.join('\n');
}

// 2. Map and Process Target Files
const targetFiles = [
    {
        path: 'j:/내 드라이브/선거 테스트/당회보고용/안수집사 후보 02.20.xlsx',
        outStr: '안수집사_업로드용.xlsx',
        targetPosition: '안수집사'
    },
    {
        path: 'j:/내 드라이브/선거 테스트/당회보고용/권사후보02.20.xlsx',
        outStr: '권사_업로드용.xlsx',
        targetPosition: '권사'
    },
    {
        path: 'j:/내 드라이브/선거 테스트/당회보고용/장로후보02.20.xls.xlsx',
        outStr: '장로_업로드용.xlsx',
        targetPosition: '장로'
    }
];

targetFiles.forEach(fileMeta => {
    console.log("Processing:", fileMeta.path);
    const workbook = XLSX.readFile(fileMeta.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // We can read as arrays to maintain column order exactly
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // Assuming first row is headers: ["Name","Birthdate","District","Position","PhotoLink","ProfileDesc"]
    // Replace the exact header format ensuring VolunteerInfo is at the end or recognized. Total 7 columns
    const outData = [];
    const headers = ['Name', 'Birthdate', 'District', 'Position', 'PhotoLink', 'ProfileDesc', 'VolunteerInfo'];
    outData.push(headers);

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0 || !row[0]) continue; // Skip empty rows

        const name = String(row[0]).trim();

        // 후보자 자격 검증 (총 봉사 연수 3년 이상)
        const totalVolYears = uniqueYearsData[name] ? uniqueYearsData[name].size : 0;
        if (totalVolYears < 3) {
            continue; // 3년 미만시 최종 명단에서 제외
        }
        const birthdate = row[1] ? String(row[1]).trim() : '';
        const district = row[2] ? String(row[2]).trim() : '';
        const churchTitle = row[3] ? String(row[3]).trim() : ''; // Using their "Position" from excel as their churchTitle
        const photoLink = `/images/candidates/${name}.jpg`;
        const profileDesc = row[5] ? String(row[5]).trim() : '';

        const volInfo = resultData[name] || '';

        outData.push([
            name,
            birthdate,
            district,
            fileMeta.targetPosition, // Enforce our target position
            photoLink,
            profileDesc ? profileDesc + '\n직분: ' + churchTitle : '직분: ' + churchTitle, // Keep their original role in the description
            volInfo
        ]);
    }

    const outPath = `j:/내 드라이브/선거 테스트/당회보고용/${fileMeta.outStr}`;

    // Create a new workbook and add the data
    const newWs = XLSX.utils.aoa_to_sheet(outData);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newWs, "Candidates");

    // Write to file
    XLSX.writeFile(newWb, outPath);

    console.log(`Saved: ${outPath} with ${outData.length - 1} records.`);
});
