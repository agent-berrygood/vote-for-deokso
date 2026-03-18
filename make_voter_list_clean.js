const fs = require('fs');
const XLSX = require('xlsx');

const txtPath = 'j:/내 드라이브/선거 테스트/선거인명부/선거인명부.txt';
const sourceExcelPath = 'j:/내 드라이브/선거 테스트/선거인명부/2026_0306_성도.xls';
const targetExcelPath = 'j:/내 드라이브/선거 테스트/선거인명부/선거인명부0306_알파벳제거.xlsx';

function removeAlphabet(name) {
    // 문자열 끝에 붙어있는 대문자 알파벳 1자리 (A-Z) 제거. 예: 김경순B -> 김경순
    return String(name || '').replace(/[A-Z]$/, '').trim();
}

function processVoters() {
    try {
        console.log("=== 이름 알파벳 완전 제거 및 생년월일 절대 대조 모드 시작 ===");

        // 1. TXT 명단 읽기
        const txtData = fs.readFileSync(txtPath, 'utf8');
        const rawNames = txtData.split(/\s+/).filter(Boolean);
        const targetNames = rawNames.filter(n =>
            n !== '선거인' && n !== '명단' && !n.includes('명)') && n.length > 0
        );

        // 2. 성도 엑셀 읽기
        const wb = XLSX.readFile(sourceExcelPath);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const allMembers = XLSX.utils.sheet_to_json(ws);

        // 원본 엑셀 멤버 이름에서 미리 알파벳을 떼어낸 버전을 캐싱
        allMembers.forEach(m => {
            m._cleanName = removeAlphabet(m['이름']);
        });

        const resultData = [];
        const missingNames = [];
        const noPhoneNames = [];

        // 3. 대조 로직 (텍스트파일 기준)
        for (const target of targetNames) {
            let matched = null;

            // "이름(571208)" 형태 파싱. 이 때 이름에 붙은 알파벳도 분리
            const matchResult = target.match(/^([가-힣a-zA-Z]+)(?:\((\d{6})\))?$/);

            if (matchResult) {
                const rawNamePart = matchResult[1]; // 김경순B
                const cleanNamePart = removeAlphabet(rawNamePart); // 김경순
                const birthPart = matchResult[2]; // 571208 (있을 경우만)

                if (birthPart) {
                    // 조건 1. 텍스트에 생년월일(괄호)이 명시된 경우
                    // 엑셀에서 (알파벳 뗀 이름) + (생년월일 끝 6자리) 가 정확히 일치하는 사람 탐색
                    matched = allMembers.find(m =>
                        m._cleanName === cleanNamePart &&
                        String(m['생년월일'] || '').endsWith(birthPart)
                    );
                } else {
                    // 조건 2. 이름만 있고 생년월일 괄호가 없는 경우
                    // 엑셀에서 (알파벳 여부 상관없이) 이름이 같은 첫 번째 사람 탐색
                    matched = allMembers.find(m => m._cleanName === cleanNamePart);
                }
            } else {
                // 일반 매칭 실패 (특이문자 등), 통째로 알파벳 떼서 비교
                const cleanTarget = removeAlphabet(target);
                matched = allMembers.find(m => m._cleanName === cleanTarget);
            }

            // 4. 추출 성공 시 데이터 저장
            if (matched) {
                let rawBirth = String(matched['생년월일'] || '').trim();
                let formattedBirth = rawBirth;

                // YYMMDD (6자리)로 변환
                if (rawBirth.length === 8) {
                    formattedBirth = rawBirth.substring(2);
                } else if (rawBirth.length > 6) {
                    formattedBirth = rawBirth.replace(/[^0-9]/g, '').slice(-6);
                }

                resultData.push({
                    '이름': matched['이름'], // 명부에는 원본에 있던 예전 이름 형태를 유지(또는 변경 가능)
                    '생년월일': formattedBirth,
                    '휴대폰': matched['휴대폰'] || ''
                });

                const phone = String(matched['휴대폰'] || '').trim();
                if (!phone || phone === 'undefined') {
                    noPhoneNames.push(matched['이름']);
                }

            } else {
                missingNames.push(target);
            }
        }

        console.log(`\n========= 작업 완료 =========`);
        console.log(`[결과] 매칭 성공 후 엑셀 포함: ${resultData.length}명`);
        console.log(`[결과] 매칭 실패 (누락): ${missingNames.length}명`);
        console.log(`[결과] 번호가 없는 사람: ${noPhoneNames.length}명`);

        if (noPhoneNames.length > 0) {
            console.log(`\n[번호 없는 사람 목록]:\n${noPhoneNames.join(', ')}`);
        }

        // 5. 새 엑셀 파일 생성
        if (resultData.length > 0) {
            const newWs = XLSX.utils.json_to_sheet(resultData);
            const newWb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWb, newWs, "선거인명부추출");
            XLSX.writeFile(newWb, targetExcelPath);
            console.log(`\n=> [성공] 이름 알파벳 무시 버전 엑셀 저장 완료: ${targetExcelPath}`);
        }

    } catch (e) {
        console.error("오류 발생:", e);
    }
}

processVoters();
