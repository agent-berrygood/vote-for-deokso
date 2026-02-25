# 선거인 참여 명단 다운로드(엑셀) 통계 기능 추가 작업

- [x] 1. `src/app/admin/page.tsx`의 `handleDownloadVotersList` 내부 로직 수정
- [x] 2. `birthdate` (예: 800512)를 파싱하여 만 나이 및 연령대(20대, 30대, 40대 등) 계산 함수 구현
- [x] 3. `votedAt` Timestamp 혹은 파생된 시간을 YYYY-MM-DD HH:mm:ss 형식으로 변환하여 컬럼 추가
- [x] 4. 엑셀 출력 객체 맵핑에 이 세 가지 컬럼(만 나이, 연령대, 투표완료시간) 반영
- [x] 5. 수정 완료 후 Github 푸시
