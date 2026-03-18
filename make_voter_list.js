const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const txtPath = 'j:/내 드라이브/선거 테스트/선거인명부/선거인명부.txt';
const sourceExcelPath = 'j:/내 드라이브/선거 테스트/선거인명부/2026_0306_성도.xls';
const targetExcelPath = 'j:/내 드라이브/선거 테스트/선거인명부/선거인명부0306.xlsx';

function processVoters() {
    try {
        console.log("작업 시작...");

        // 1. TXT 명단 읽기
        const txtData = fs.readFileSync(txtPath, 'utf8');
        const rawNames = txtData.split(/\s+/).filter(Boolean);

        // "선거인", "명단", "(1,526명)" 등 첫줄 필터링
        const targetNames = rawNames.filter(n =>
            n !== '선거인' && n !== '명단' && !n.includes('명)') && n.length > 0
        );
        console.log(`[분석] 추출 대상 인원: ${targetNames.length}명`);

        // 2. 원본 성도 엑셀 읽기
        const wb = XLSX.readFile(sourceExcelPath);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const allMembers = XLSX.utils.sheet_to_json(ws);

        const resultData = [];
        const missingNames = [];

        // 3. 텍스트 명단 1명씩 대조
        for (const target of targetNames) {
            let matched = null;

            // "김경순B(571208)" 형태 파싱 로직
            const matchResult = target.match(/^([가-힣a-zA-Z]+)(?:\((\d{6})\))?$/);

            if (matchResult) {
                const namePart = matchResult[1]; // 김경순B
                const birthPart = matchResult[2]; // 571208 (있을 경우만)

                if (birthPart) {
                    // 동명이인 괄호 생년이 있는 경우
                    matched = allMembers.find(m =>
                        String(m['이름'] || '').trim() === namePart &&
                        String(m['생년월일'] || '').endsWith(birthPart)
                    );
                } else {
                    // 이름만 있는 경우 중복 상관없이 첫 번째 매칭
                    matched = allMembers.find(m => String(m['이름'] || '').trim() === namePart);
                }
            } else {
                // 일반 매칭 실패 (특이문자 등) - 전체 이름으로 단순 비교
                matched = allMembers.find(m => String(m['이름'] || '').trim() === target.trim());
            }

            // 4. 데이터 가공 (YYMMDD 강제 6자리)
            if (matched) {
                let rawBirth = String(matched['생년월일'] || '').trim();
                let formattedBirth = rawBirth;

                // 19801009(8자리) -> 801009(6자리) 변환
                if (rawBirth.length === 8) {
                    formattedBirth = rawBirth.substring(2);
                } else if (rawBirth.length > 6) {
                    // 1957.12.08 같은 텍스트 찌꺼기가 있을 경우 방어 로직
                    formattedBirth = rawBirth.replace(/[^0-9]/g, '').slice(-6);
                }

                resultData.push({
                    '이름': matched['이름'],
                    '생년월일': formattedBirth,
                    '휴대폰': matched['휴대폰'] || ''
                });
            } else {
                missingNames.push(target);
            }
        }

        console.log(`\n========= 작업 완료 =========`);
        console.log(`[결과] 매칭 성공 후 엑셀 포함: ${resultData.length}명`);
        console.log(`[결과] 매칭 실패 (누락): ${missingNames.length}명`);

        if (missingNames.length > 0) {
            console.log(`\n[주의] 명단에는 있지만 엑셀(DB)에서 못 찾은 이름:`);
            console.log(missingNames.join(', '));
        }

        // 5. 새 엑셀 파일 생성
        if (resultData.length > 0) {
            const newWs = XLSX.utils.json_to_sheet(resultData);
            const newWb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWb, newWs, "선거인명부_최종");
            XLSX.writeFile(newWb, targetExcelPath);
            console.log(`\n=> [성공] 엑셀 파일 정상 저장 위치: ${targetExcelPath}`);
        } else {
            console.log(`\n=> [실패] 매칭된 데이터가 단 1건도 없어 엑셀을 만들지 않았습니다.`);
        }

    } catch (e) {
        console.error("오류 발생:", e);
    }
}

processVoters();
