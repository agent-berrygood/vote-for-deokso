const fs = require('fs');
const XLSX = require('xlsx');

// 1. Process Volunteer Info for Total Unique Years
const html = fs.readFileSync('j:/내 드라이브/선거 테스트/당회보고용/봉사정보/봉사정보.xls', 'utf-8');
const rows = html.split('<tr');

// { name: Set<year> }
const uniqueYearsData = {};
// Store raw top3 text for the report
const volunteerData = {};

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
                uniqueYearsData[name].add(y);
                volunteerData[name][dept].add(y);
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
    resultData[name] = textLines.join('<br/>');
}


// 2. Read Target Files and generate report
const targetFiles = [
    {
        path: 'j:/내 드라이브/선거 테스트/당회보고용/안수집사 후보 02.20.xlsx',
        role: '안수집사'
    },
    {
        path: 'j:/내 드라이브/선거 테스트/당회보고용/권사후보02.20.xlsx',
        role: '권사'
    },
    {
        path: 'j:/내 드라이브/선거 테스트/당회보고용/장로후보02.20.xls.xlsx',
        role: '장로'
    }
];

let report = `# 피선거권 자격 검증 리포트 (총 봉사 3년 이상 기준)\n\n`;

targetFiles.forEach(fileMeta => {
    const workbook = XLSX.readFile(fileMeta.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let eligible = [];
    let ineligible = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0 || !row[0]) continue; // Skip empty rows

        const name = String(row[0]).trim();
        const rawVolData = resultData[name] || '';
        const totalVolYears = uniqueYearsData[name] ? uniqueYearsData[name].size : 0;

        const candidateInfo = {
            name,
            totalYears: totalVolYears,
            history: rawVolData || '내역 없음'
        };

        if (totalVolYears >= 3) {
            eligible.push(candidateInfo);
        } else {
            ineligible.push(candidateInfo);
        }
    }

    report += `## ${fileMeta.role} 후보\n\n`;
    report += `### ❌ 탈락 예상자 (총 ${ineligible.length}명)\n`;
    report += `| 이름 | 인정 봉사 연수 | 상세 봉사 내역 (최대 3개) |\n`;
    report += `|---|---|---|\n`;
    ineligible.forEach(c => {
        report += `| **${c.name}** | ${c.totalYears}년 | ${c.history} |\n`;
    });
    report += `\n`;

    report += `### ✅ 통과 예상자 (총 ${eligible.length}명)\n`;
    report += `<details><summary>명단 열기</summary>\n\n`;
    report += `| 이름 | 인정 봉사 연수 | 상세 봉사 내역 (최대 3개) |\n`;
    report += `|---|---|---|\n`;
    eligible.forEach(c => {
        report += `| ${c.name} | ${c.totalYears}년 | ${c.history} |\n`;
    });
    report += `\n</details>\n\n---\n\n`;

});

fs.writeFileSync('c:/Users/Administrator/.gemini/antigravity/brain/06398513-15ba-4e3a-b570-8c4f660719fa/eligibility_report.md', report, 'utf8');
console.log("Report generated.");
