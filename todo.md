# 404 NOT_FOUND (ListSurveyResponsesOnly) 문제 해결 TODO

## 🔍 문제 원인 분석
1. **배포 동기화 실패**: `firebase deploy` 시 "Postgres Database fdcdb is not accessible" 경고와 함께 커넥터의 신규 쿼리가 클라우드에 실제로는 반영되지 않았을 가능성.
2. **런타임 환경 변수 불일치**: `.env.local` 수정 후에도 실행 중인 서버 프로세스(또는 빌드된 정적 페이지)가 여전히 `dummy-project` ID를 참조하여 쿼리를 날리고 있음.
3. **에뮬레이터 사용 여부**: 로컬 에뮬레이터를 사용 중이라면 클라우드 배포와 상관없이 에뮬레이터를 재시작해야 신규 쿼리를 인식함.

## 🛠️ 해결 계획

### [1] 환경 변수 강제 주입 및 확인 (서버 액션)
- 서버 액션 최상단에 현재 사용 중인 `PROJECT_ID` 로깅 추가.
- 만약 잘못된 ID가 찍힌다면 `firebase.ts` 초기화 로직 점검.

### [2] 커넥터 재배포 및 데이터베이스 접근 확인
- `connector.gql`의 쿼리 명칭을 `ListSurveyResponsesNoJoin`으로 변경 (이름 중복/캐시 가능성 배제).
- `firebase deploy --only dataconnect --force` 재실행 및 에러 로그 정밀 분석.

### [3] SDK 재생성 및 빌드
- `firebase dataconnect:sdk:generate` 실행.
- `npm run build` 재실행하여 환경 변수 반영 강제.

## ⚠️ 리스크 점검 및 검증
- **리스크**: 환경 변수를 잘못 건드리면 전체 DB 연결이 끊길 수 있음.
- **검증**: `PROJECT_ID` 로깅을 통해 실제 요청이 어디로 가는지 먼저 확인한 후 진행.
- **리스크**: 쿼리 명칭 변경 시 어드민 페이지 코드도 동시 수정 필요. (일관성 유지)

---

## ✅ 실행 순서 (문제가 없다면 바로 진행)
1. 서버 액션에 로깅 추가하여 실시간 PROJECT_ID 확인.
2. 쿼리 명칭 변경 및 재배포.
3. 전체 재빌드 및 푸시.
