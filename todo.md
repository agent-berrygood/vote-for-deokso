# 2차 후보자 자동 불러오기 (피택자 제외 1.5배수) 작업 목록

- [x] Task 1: `CandidatePositionManager.tsx`에 Firestore Batch(일괄 처리) 유틸리티 함수 및 상태 변수 추가
- [x] Task 2: 2차 선발 인원(`maxVotes`) 및 1차 투표수(`ballots`)를 가져오는 비동기 로직 `fetchPrevRoundData` 구현
- [x] Task 3: 1차 피택 기준 계산 및 미피택 1.5배수 후보자 선별(득표순 정렬 후 추출) 로직 작성
- [x] Task 4: 선택된 후보자들을 새로운 Firestore 문서로 2차 투표(round: 2)에 등록하는 저장 로직 완성
- [x] Task 5: 2차 탭 렌더링 시 후보가 없을 때만 표시되는 '1차 결과 기준 2차 후보 자동 생성' 버튼 및 다이얼로그 UI 추가
