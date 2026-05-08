# 404 에러 해결을 위한 세부 하청 작업 리스트 (Claude Code -> Gemini CLI)

## Phase A: 환경 변수 무결성 확보
- [ ] **A-1.** `.env.local`의 `NEXT_PUBLIC_FIREBASE_API_KEY`를 실제 값으로 업데이트
- [ ] **A-2.** `.env.local`의 `NEXT_PUBLIC_FIREBASE_APP_ID`를 실제 값으로 업데이트
- [ ] **A-3.** `.env.local`의 `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`를 실제 값으로 업데이트

## Phase B: 프로젝트 설정 및 배포 타겟 검증
- [ ] **B-1.** `.firebaserc`에 `default: vote-for-deokso-back`이 올바르게 설정되었는지 재확인
- [ ] **B-2.** `firebase.json`의 `dataconnect` 설정이 `dataconnect` 디렉토리를 가리키는지 확인

## Phase C: 커넥터 및 쿼리 재배포 (핵심)
- [ ] **C-1.** `firebase deploy --only dataconnect --project vote-for-deokso-back --force` 실행
- [ ] **C-2.** 배포 로그에서 `ListSurveyResponsesNoJoin` 작업이 성공적으로 업로드되었는지 확인
- [ ] **C-3.** "Postgres Database fdcdb"가 정상적으로 연결되었는지 확인

## Phase D: SDK 동기화 및 빌드
- [ ] **D-1.** `firebase dataconnect:sdk:generate --project vote-for-deokso-back` 실행
- [ ] **D-2.** `src/lib/dataconnect/index.cjs.js` 파일에 `listSurveyResponsesNoJoin` 함수가 존재하는지 확인
- [ ] **D-3.** `npm run build` 실행하여 환경 변수 및 SDK 변경사항 반영

## Phase E: 최종 동작 검증
- [ ] **E-1.** 서버 콘솔 로그에서 `[DEBUG] Current Project ID: vote-for-deokso-back` 출력 확인
- [ ] **E-2.** 어드민 설문 결과 페이지에서 404 에러 발생 여부 및 데이터 로드 확인
