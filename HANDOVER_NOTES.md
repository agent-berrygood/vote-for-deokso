# 📝 프로젝트 인수인계 및 작업 현황 보고 (2026-05-09)

## 1. 현재 핵심 문제: 설문 응답 데이터 중복 노출
- **현상:** 익명 설문 응답 시 모든 데이터가 동일한 `memberId`를 공유함에 따라, Firebase Data Connect SDK의 **정규화 캐시(Normalized Cache)**가 모든 응답을 동일 객체로 오인하여 첫 번째 응답 내용으로 덮어씌우는 현상 발생.
- **결과:** 어드민 페이지 및 엑셀 다운로드 시 모든 응답 내용이 중복되어 나타남.

## 2. 해결 방법 및 진행 상황
- **조치 사항:** 
  1. `connector.gql`에 `member` 조인을 포함하지 않는 전용 쿼리 `ListSurveyResponsesNoJoin`을 추가하여 캐시 충돌 원인을 원천 차단.
  2. 서버 액션(`data.ts`)에서 해당 쿼리를 호출하고, UI 호환성을 위해 가상(Dummy) 멤버 객체를 주입하도록 로직 변경.
- **현재 상태:** 로컬 코드 수정 및 빌드(`npm run build`)는 성공적으로 완료되었으며, 저장소에 푸시되었습니다.

## 3. 잔여 블로커 및 내일 작업 예정 사항 (CRITICAL)
- **배포 실패 (403 Forbidden):** 운영 프로젝트(`deoksovote`)로의 `firebase deploy`가 권한 문제로 실패하고 있습니다.
  - **원인:** 요금제는 Blaze로 업그레이드되었으나, CLI 계정에 **Data Connect Admin** 및 **Billing** 관련 권한이 완전히 전파되지 않았거나 부족함.
  - **증상:** 로컬에서 `firebase deploy` 실행 시 `403 Permission Denied` 또는 `Billing Info` 접근 에러 발생.
- **내일 할 일:**
  1. 권한이 있는 로컬 PC에서 `firebase deploy --only dataconnect --project deoksovote` 실행하여 최신 쿼리 반영.
  2. 배포 성공 후 어드민 페이지에서 응답 목록이 정상(중복 없음)인지 최종 확인.

## 4. 환경 설정 참고
- **프로젝트 ID:** `deoksovote` (운영)
- **환경 변수:** `.env.local`에 실제 운영 API Key 및 App ID가 반영되어 있음.
- **주요 파일:**
  - `dataconnect/vote/connector.gql`: 신규 쿼리 정의됨.
  - `src/app/actions/data.ts`: `ListSurveyResponsesNoJoin` 호출 로직 반영됨.

---
**내일 작업 시 위 배포 명령어를 먼저 실행하여 서버측 쿼리를 업데이트하는 것이 최우선입니다.**
