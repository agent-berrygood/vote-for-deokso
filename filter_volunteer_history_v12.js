const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '2차_후보자_프로필_최종_정상수정_v12.xlsx');

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const resultData = data.map(row => {
        const historyText = row['봉사내역 (최근 5년)'];
        if (!historyText) return row;

        const lines = historyText.toString().split(/\r?\n/).filter(line => line.trim());
        const parsed = lines.map(line => {
            let maxYear = 0;
            let minYear = 0;
            const match = line.match(/\(([^)]+)\)[^\)]*$/);
            if (match) {
                const yearStr = match[1];
                const years = [...yearStr.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
                if (years.length > 0) {
                    maxYear = Math.max(...years);
                    minYear = Math.min(...years);
                }
            }
            return { line, maxYear, minYear };
        });

        parsed.sort((a, b) => {
            if (b.maxYear !== a.maxYear) {
                return b.maxYear - a.maxYear; // Descending max year
            }
            if (a.minYear !== b.minYear) {
                return a.minYear - b.minYear; // Ascending min year (longer duration first)
            }
            return a.line.localeCompare(b.line); 
        });

        const top3 = parsed.slice(0, 3).map(p => p.line).join('\r\n');
        return {
            ...row,
            '봉사내역 (최근 5년)': top3
        };
    });

    const newSheet = xlsx.utils.json_to_sheet(resultData);
    
    // Copy column widths or other properties if possible, but basic json_to_sheet is usually okay.
    // However, since it's an existing file, let's try to preserve formatting by modifying existing cells if possible.
    // The easiest way is to modify the existing sheet's cells directly. Let's do that for safety.
    
    // Iterate over rows in the existing sheet
    const range = xlsx.utils.decode_range(sheet['!ref']);
    // Find column index for '봉사내역 (최근 5년)'
    let colIndex = -1;
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = {c: C, r: 0}; // Assuming header is on first row
        const cellRef = xlsx.utils.encode_cell(cellAddress);
        if (sheet[cellRef] && sheet[cellRef].v === '봉사내역 (최근 5년)') {
            colIndex = C;
            break;
        }
    }

    if (colIndex !== -1) {
        for (let R = 1; R <= range.e.r; ++R) {
            const cellAddress = {c: colIndex, r: R};
            const cellRef = xlsx.utils.encode_cell(cellAddress);
            const cell = sheet[cellRef];
            if (cell && cell.v) {
                const historyText = cell.v.toString();
                const lines = historyText.split(/\r?\n/).filter(line => line.trim());
                const parsed = lines.map(line => {
                    let maxYear = 0;
                    let minYear = 0;
                    const match = line.match(/\(([^)]+)\)[^\)]*$/);
                    if (match) {
                        const yearStr = match[1];
                        const years = [...yearStr.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
                        if (years.length > 0) {
                            maxYear = Math.max(...years);
                            minYear = Math.min(...years);
                        }
                    }
                    return { line, maxYear, minYear };
                });

                parsed.sort((a, b) => {
                    if (b.maxYear !== a.maxYear) return b.maxYear - a.maxYear;
                    if (a.minYear !== b.minYear) return a.minYear - b.minYear;
                    return a.line.localeCompare(b.line); 
                });

                cell.v = parsed.slice(0, 3).map(p => p.line).join('\r\n');
            }
        }
    }
    
    xlsx.writeFile(workbook, filePath);
    console.log("Successfully updated the file: " + filePath);
} catch (error) {
    console.error("Error reading/writing file:", error);
}
