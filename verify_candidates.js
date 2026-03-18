const XLSX = require('xlsx');

// Verify the output files
const outKwonsa = String.raw`j:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업\가공완료_권사후보_수정.xlsx`;
const outJipsa = String.raw`j:\내 드라이브\선거 테스트\당회보고용\0304 후보 작업\가공완료_안수집사후보_수정.xlsx`;
const finalKwonsa = String.raw`j:\.shortcut-targets-by-id\16Fg28Vui52LUIsj_kDpgtD6ac-Ry7KUW\높은뜻덕소교회_팀공유드라이브_시즌2\8.행정\선거\2026 선거\최종\2026_권사_최종_피선거인_명단_188명.xlsx`;
const finalJipsa = String.raw`j:\.shortcut-targets-by-id\16Fg28Vui52LUIsj_kDpgtD6ac-Ry7KUW\높은뜻덕소교회_팀공유드라이브_시즌2\8.행정\선거\2026 선거\최종\2026_안수집사_최종_피선거인_명단_105명.xlsx`;

function readExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
}

// Read and verify
const okData = readExcel(outKwonsa);
const ojData = readExcel(outJipsa);
const fkData = readExcel(finalKwonsa);
const fjData = readExcel(finalJipsa);

const okNames = new Set(okData.slice(1).map(r => r[0]).filter(n => n && String(n).trim()));
const ojNames = new Set(ojData.slice(1).map(r => r[0]).filter(n => n && String(n).trim()));
const fkNames = new Set(fkData.slice(1).map(r => r[2]).filter(n => n && String(n).trim()));
const fjNames = new Set(fjData.slice(1).map(r => r[2]).filter(n => n && String(n).trim()));

console.log('=== 검증: 수정된 가공완료 vs 최종 ===');
console.log(`\n권사: 수정된 가공완료 ${okNames.size}명, 최종 ${fkNames.size}명`);
const kMissing = [...fkNames].filter(n => !okNames.has(n));
const kExtra = [...okNames].filter(n => !fkNames.has(n));
console.log(`  최종에 있으나 수정본에 없는 사람: ${kMissing.length}명 ${kMissing.length ? '- ' + kMissing.join(', ') : ''}`);
console.log(`  수정본에 있으나 최종에 없는 사람: ${kExtra.length}명 ${kExtra.length ? '- ' + kExtra.join(', ') : ''}`);

console.log(`\n안수집사: 수정된 가공완료 ${ojNames.size}명, 최종 ${fjNames.size}명`);
const jMissing = [...fjNames].filter(n => !ojNames.has(n));
const jExtra = [...ojNames].filter(n => !fjNames.has(n));
console.log(`  최종에 있으나 수정본에 없는 사람: ${jMissing.length}명 ${jMissing.length ? '- ' + jMissing.join(', ') : ''}`);
console.log(`  수정본에 있으나 최종에 없는 사람: ${jExtra.length}명 ${jExtra.length ? '- ' + jExtra.join(', ') : ''}`);

if (kMissing.length === 0 && kExtra.length === 0 && jMissing.length === 0 && jExtra.length === 0) {
    console.log('\n✅ 완벽! 수정된 가공완료 파일과 최종 명단이 정확히 일치합니다.');
} else {
    console.log('\n⚠️ 아직 불일치가 있습니다.');
}
