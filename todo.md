# 템플릿 데이터 채우기 및 코드 업데이트 작업

- [x] 1. `h:\내 드라이브\선거 테스트\당회보고용\voter_upload_template.xlsx` 파일의 열(Column) 구조 확인 및 분석
  - 열 구조: Name, Phone, Birthdate, AuthKey (4개 열)
- [x] 2. `voter_upload_template.xlsx` 파일에 부하 테스트용 가상 유권자 데이터 1000명 생성 및 저장
  - 1000명 생성 완료 (한글 이름, 010 전화번호, 생년월일, 8자리 인증키)
- [x] 3. `h:\내 드라이브\선거 테스트\당회보고용\candidate_upload_template.xlsx` 파일의 열(Column) 구조 확인 및 분석
  - 열 구조: Name, Birthdate, District, Position, PhotoLink, ProfileDesc (6개 열)
- [x] 4. `candidate_upload_template.xlsx` 파일에 부하 테스트용 가상 후보자 데이터 10명 생성 및 저장
  - 10명 생성 완료 (5개 구역, 장로/권사/안수집사 직분, 프로필 설명 포함)
- [x] 5. 생성된 가상 유권자 및 후보자 데이터를 바탕으로 테스트 스크립트 코드 업데이트
  - (브라우저 자동 탐색 스크립트로 업데이트 완료)
- [x] 6. 변경된 코드가 정상적으로 실행되는지 검토 및 확인
