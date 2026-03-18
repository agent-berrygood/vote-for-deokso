const fs = require('fs');
const XLSX = require('xlsx');

const txtPath = 'j:/내 드라이브/선거 테스트/선거인명부/선거인명부.txt';
const sourceExcelPath = 'j:/내 드라이브/선거 테스트/선거인명부/2026_0306_성도.xls';

function processVoters() {
    try {
        const txtData = fs.readFileSync(txtPath, 'utf8');
        const rawNames = txtData.split(/\s+/).filter(Boolean);
        const targetNames = rawNames.filter(n => n !== '선거인' && n !== '명단' && !n.includes('명)') && n.length > 0);

        const wb = XLSX.readFile(sourceExcelPath);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const allMembers = XLSX.utils.sheet_to_json(ws);

        const resultData = [];
        const missingNames = [];
        const noPhoneNames = [];

        for (const target of targetNames) {
            let matched = null;
            const matchResult = target.match(/^([가-힣a-zA-Z]+)(?:\((\d{6})\))?$/);

            if (matchResult) {
                const namePart = matchResult[1];
                const birthPart = matchResult[2];

                if (birthPart) {
                    matched = allMembers.find(m => String(m['이름'] || '').trim() === namePart && String(m['생년월일'] || '').endsWith(birthPart));
                } else {
                    matched = allMembers.find(m => String(m['이름'] || '').trim() === namePart);
                }
            } else {
                matched = allMembers.find(m => String(m['이름'] || '').trim() === target.trim());
            }

            if (matched) {
                const phone = String(matched['휴대폰'] || '').trim();
                if (!phone || phone === 'undefined') {
                    noPhoneNames.push(matched['이름']);
                }
            } else {
                missingNames.push(target);
            }
        }

        const report = `
[명부 대조 분석 결과]
- 텍스트 명부(제시된 명단) 총원: ${targetNames.length}명
- 엑셀(DB)과 이름이 일치하지 않아 누락된 인원: ${missingNames.length}명
- 엑셀(DB)에는 있지만 전화번호가 등록되지 않은(공란인) 인원: ${noPhoneNames.length}명

[1. 엑셀(DB)에서 이름을 아예 찾을 수 없는 명단 (텍스트에만 존재)]
${missingNames.join(', ') || '없음'}

[2. 이름은 매칭되었으나, 엑셀(DB) 상 연락처(휴대폰)가 빈칸인 명단]
${noPhoneNames.join(', ') || '없음'}
`;

        fs.writeFileSync('comparison_report.txt', report.trim());
        console.log("보고서 생성 완료");
    } catch (e) {
        console.error("오류 발생:", e);
    }
}
processVoters();
