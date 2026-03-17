# 2차 후보자 자동 불러오기 (피택자 제외 1.5배수) 작업 목록

- [x] Task 1: `CandidatePositionManager.tsx`에 Firestore Batch(일괄 처리) 유틸리티 함수 및 상태 변수 추가
- [x] Task 2: 2차 선발 인원(`maxVotes`) 및 1차 투표수(`ballots`)를 가져오는 비동기 로직 `fetchPrevRoundData` 구현
- [x] Task 3: 1차 피택 기준 계산 및 미피택 1.5배수 후보자 선별(득표순 정렬 후 추출) 로직 작성
- [x] Task 4: 선택된 후보자들을 새로운 Firestore 문서로 2차 투표(round: 2)에 등록하는 저장 로직 완성
- [x] Task 5: 2차 탭 렌더링 시 후보가 없을 때만 표시되는 '1차 결과 기준 2차 후보 자동 생성' 버튼 및 다이얼로그 UI 추가

## 정밀 관리: 선거인 명부 차수별 참여 상태 시각화
- [x] Task 9: `VoterManager.tsx`에 `participated` 데이터를 차수별로 분석하는 로직 추가
- [x] Task 10: 테이블 헤더에 '차수별 참여' 컬럼 또는 버튼 추가 및 상세 참여 현황 다이얼로그 구현
- [x] Task 11: 엑셀 다운로드 시 차수별 참여 여부를 열로 분리하여 출력하도록 수정
- [ ] Task 12: `VoterManager.tsx` 명부 상단에 '차수 선택 버튼(1차~3차)' 그룹 추가 및 테이블 참여 상태 연동
- [ ] Task 13: 프로젝트 전체 린트 에러(`any` 타입 등) 최종 수정 및 `test_jwt.ts` 제거
- [ ] Task 14: 수정 후 빌드/린트 검사 및 최종 Git 푸시
