const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '2차_후보자_프로필_최종_정상수정_v12.xlsx');
try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(JSON.stringify(Object.keys(data[0]), null, 2));
    console.log("-------------------");
    console.log(JSON.stringify(data[0], null, 2));
    console.log("-------------------");
    console.log(JSON.stringify(data[1], null, 2));
} catch (error) {
    console.error("Error reading file:", error);
}
