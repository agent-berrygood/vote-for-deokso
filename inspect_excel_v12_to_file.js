const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '2차_후보자_프로필_최종_정상수정_v12.xlsx');
try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const sample = data.slice(0, 5).map(row => ({
        이름: row['이름'],
        봉사내역: row['봉사내역 (최근 5년)']
    }));

    fs.writeFileSync('sample_output.txt', JSON.stringify(sample, null, 2), 'utf-8');
} catch (error) {
    console.error("Error reading file:", error);
}
