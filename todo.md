# 작업 목표: 기호 번호(candidateNumber) 우선 정렬 로직 업데이트

- [V] 1. `src/app/vote/page.tsx` 내부 `filteredCandidates` 의 정렬(`.sort`) 함수 구조 파악
- [V] 2. 두 후보 모두 `candidateNumber`를 가지고 있을 때, `candidateNumber`의 오름차순으로 우선 정렬
- [V] 3. 한 후보만 `candidateNumber`를 가지고 있을 때, 해당 후보를 무조건 우선순위로 위로 배치
- [V] 4. 두 후보 모두 `candidateNumber`가 없을 때, 기존처럼 득표수 또는 가나다순서 등 정렬 버튼(`sortOrder`)의 조건에 따라 폴백(Fallback) 정렬이 되도록 유지
- [V] 5. `npm run build`를 실행하여 린트/컴파일 오류가 없고 정상 빌드되는지 확인
