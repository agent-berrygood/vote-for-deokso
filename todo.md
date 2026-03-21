# 작업 목표: 어드민 페이지에서 후보자 기호 번호 수정 기능 구현

- [V] 1. 후보자 데이터 모델(`types` 등) 및 Firestore 스키마에 기호 번호(`symbolNumber` 또는 `candidateNumber`) 필드 추가.
- [V] 2. `src/app/admin/page.tsx` 또는 관련 관리자 컴포넌트(후보자 목록 관리) 내에 후보자별 기호 번호를 수정할 수 있는 UI (입력 칸) 구현.
- [V] 3. 관리자 페이지에서 변경한 기호 번호를 DB(Firebase)에 저장 및 업데이트하는 로직 연동.
- [V] 4. 투표 화면(`src/app/vote/page.tsx`, `CandidatePositionManager.tsx` 등)에서 하드코딩된 기호 번호 텍스트를 DB에서 불러온 기호 번호 값으로 교체하여 렌더링.
- [V] 5. 기호 번호 값이 없을 경우의 Fallback 로직 추가 (표시 안 함 또는 기본값 지정).
- [V] 6. 저장 및 렌더링이 정상 작동하는지 여부 확인 및 TypeScript 컴파일/Lint 에러 체크.
