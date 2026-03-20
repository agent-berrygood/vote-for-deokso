const ExcelJS = require('exceljs');
const path = require('path');

async function processExcel() {
    const filePath = path.join(__dirname, '2차_후보자_프로필_최종_정상수정_v12.xlsx');
    const workbook = new ExcelJS.Workbook();
    
    try {
        await workbook.xlsx.readFile(filePath);
        const sheet = workbook.worksheets[0]; // First sheet

        // Find the column index for "봉사내역 (최근 5년)" or "봉사이력"
        let targetColIdx = -1;
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
            if (cell.value && cell.value.toString().includes('봉사내역 (최근 5년)')) {
                targetColIdx = colNumber;
            }
        });

        if (targetColIdx === -1) {
            console.error("Column '봉사내역 (최근 5년)' not found!");
            return;
        }

        // Iterate through rows (skipping header)
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            const cell = row.getCell(targetColIdx);
            if (cell && cell.value) {
                // Determine text (handles rich text objects in ExcelJS)
                let historyText = '';
                if (typeof cell.value === 'object' && cell.value.richText) {
                    historyText = cell.value.richText.map(rt => rt.text).join('');
                } else {
                    historyText = cell.value.toString();
                }

                if (!historyText.trim()) return;

                const lines = historyText.split(/\r?\n/).filter(line => line.trim());
                
                // Parse and collect years
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

                // Sort by recentness
                parsed.sort((a, b) => {
                    if (b.maxYear !== a.maxYear) return b.maxYear - a.maxYear; // Descending max year
                    if (a.minYear !== b.minYear) return a.minYear - b.minYear; // Ascending min year (longer first)
                    return a.line.localeCompare(b.line); 
                });

                // Keep top 3
                const top3 = parsed.slice(0, 3).map(p => p.line);
                const updatedText = top3.join('\n');

                // Update cell
                cell.value = updatedText;
                // Preserve formatting if possible, though setting value might clear it
                // We'll keep default wrapText
                cell.alignment = { wrapText: true, vertical: 'middle', ...cell.alignment };
            }
        });

        // Save
        const outPath = path.join(__dirname, '2차_후보자_프로필_최종_정상수정_v12.xlsx');
        await workbook.xlsx.writeFile(outPath);
        console.log("Successfully updated the file with exceljs: " + outPath);
    } catch (error) {
        console.error("Error reading/writing file:", error);
    }
}

processExcel();
