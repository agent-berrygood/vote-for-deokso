const XLSX = require('xlsx');
const fs = require('fs');

// File paths
const processedKwonsa = String.raw`j:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업\가공완료_권사후보.xlsx`;
const processedJipsa = String.raw`j:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업\가공완료_안수집사후보.xlsx`;
const finalKwonsa = String.raw`j:\.shortcut-targets-by-id\16Fg28Vui52LUIsj_kDpgtD6ac-Ry7KUW\높은뜻덕소교회_팀공유드라이브_시즌2\8.행정\선거\2026 선거\최종\2026_권사_최종_피선거인_명단_188명.xlsx`;
const finalJipsa = String.raw`j:\.shortcut-targets-by-id\16Fg28Vui52LUIsj_kDpgtD6ac-Ry7KUW\높은뜻덕소교회_팀공유드라이브_시즌2\8.행정\선거\2026 선거\최종\2026_안수집사_최종_피선거인_명단_105명.xlsx`;

// Local output paths (write here first, then user can copy or we overwrite)
const outKwonsa = String.raw`j:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업\가공완료_권사후보_수정.xlsx`;
const outJipsa = String.raw`j:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업\가공완료_안수집사후보_수정.xlsx`;

function readExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
}

// ========== 권사 처리 ==========
const pkData = readExcel(processedKwonsa);
const fkData = readExcel(finalKwonsa);

const pkHeader = pkData[0];
const pkRows = pkData.slice(1).filter(r => r[0] && typeof r[0] === 'string' && r[0].trim());

const fkRows = fkData.slice(1).filter(r => r[2] && typeof r[2] === 'string' && r[2].trim());
const fkNames = new Set(fkRows.map(r => r[2].trim()));

const pkFiltered = pkRows.filter(r => fkNames.has(r[0].trim()));
const pkRemoved = pkRows.filter(r => !fkNames.has(r[0].trim()));

const pkExistingNames = new Set(pkFiltered.map(r => r[0].trim()));
const fkToAdd = fkRows.filter(r => !pkExistingNames.has(r[2].trim()));

const newKwonsaRows = fkToAdd.map(r => [r[2], r[3], r[4], '서리집사', '', '', '']);

const allKwonsaRows = [...pkFiltered, ...newKwonsaRows].sort((a, b) => {
    return String(a[0] || '').localeCompare(String(b[0] || ''), 'ko');
});

const kwonsaWs = XLSX.utils.aoa_to_sheet([pkHeader, ...allKwonsaRows]);
const kwonsaWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(kwonsaWb, kwonsaWs, 'Sheet1');
XLSX.writeFile(kwonsaWb, outKwonsa);

// ========== 안수집사 처리 ==========
const pjData = readExcel(processedJipsa);
const fjData = readExcel(finalJipsa);

const pjHeader = pjData[0];
const pjRows = pjData.slice(1).filter(r => r[0] && typeof r[0] === 'string' && r[0].trim());

const fjRows = fjData.slice(1).filter(r => r[2] && typeof r[2] === 'string' && r[2].trim());
const fjNames = new Set(fjRows.map(r => r[2].trim()));

const pjFiltered = pjRows.filter(r => fjNames.has(r[0].trim()));
const pjRemoved = pjRows.filter(r => !fjNames.has(r[0].trim()));

const pjExistingNames = new Set(pjFiltered.map(r => r[0].trim()));
const fjToAdd = fjRows.filter(r => !pjExistingNames.has(r[2].trim()));

const newJipsaRows = fjToAdd.map(r => [r[2], r[3], r[5], '서리집사', '', '', '']);

const allJipsaRows = [...pjFiltered, ...newJipsaRows].sort((a, b) => {
    return String(a[0] || '').localeCompare(String(b[0] || ''), 'ko');
});

const jipsaWs = XLSX.utils.aoa_to_sheet([pjHeader, ...allJipsaRows]);
const jipsaWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(jipsaWb, jipsaWs, 'Sheet1');
XLSX.writeFile(jipsaWb, outJipsa);

// ========== 결과 출력 ==========
console.log('=== 권사 후보 처리 결과 ===');
console.log(`삭제: ${pkRemoved.length}명 - ${pkRemoved.map(r => r[0]).join(', ')}`);
console.log(`추가: ${fkToAdd.length}명 - ${fkToAdd.map(r => r[2]).join(', ')}`);
console.log(`최종 인원: ${allKwonsaRows.length}명 (기존 유지 ${pkFiltered.length} + 신규 ${newKwonsaRows.length})`);

console.log('\n=== 안수집사 후보 처리 결과 ===');
console.log(`삭제: ${pjRemoved.length}명 - ${pjRemoved.map(r => r[0]).join(', ')}`);
console.log(`추가: ${fjToAdd.length}명 - ${fjToAdd.map(r => r[2]).join(', ')}`);
console.log(`최종 인원: ${allJipsaRows.length}명 (기존 유지 ${pjFiltered.length} + 신규 ${newJipsaRows.length})`);

console.log(`\n✅ 수정된 파일 저장 완료!`);
console.log(`  권사: ${outKwonsa}`);
console.log(`  안수집사: ${outJipsa}`);
