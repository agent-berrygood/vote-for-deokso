const fs = require('fs');
const XLSX = require('xlsx');

const files = [
    'j:/내 드라이브/선거 테스트/당회보고용/안수집사 후보 02.20.xlsx',
    'j:/내 드라이브/선거 테스트/당회보고용/권사후보02.20.xlsx',
    'j:/내 드라이브/선거 테스트/당회보고용/장로후보02.20.xls.xlsx'
];

let out = '';
files.forEach(file => {
    try {
        const workbook = XLSX.readFile(file);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        out += `--- ${file} ---\\n`;
        out += 'Headers: ' + JSON.stringify(json[0]) + '\\n';
        out += 'Row 1: ' + JSON.stringify(json[1]) + '\\n\\n';
    } catch (e) {
        out += `Error reading ${file}: ` + e.message + '\\n';
    }
});

fs.writeFileSync('inspect_out.txt', out);
