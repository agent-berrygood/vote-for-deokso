# 설문 응답 어드민 로딩 중복 문제 - 최종 원인 및 해결 계획

## 🔍 확정된 근본 원인

Firebase Data Connect SDK는 Apollo Client와 동일한 **정규화 캐시(Normalized Cache)** 를 사용함.
캐시 키 = `__typename + id` 조합.

**문제 시나리오**:
1. 응답 A 제출 → SDK 캐시: `SurveyResponse:idA { answers: "A응답", member: Member:익명UUID }`
2. 응답 B 제출 → SDK 캐시: `SurveyResponse:idB { answers: "B응답", member: Member:익명UUID }`
3. `ListSurveyResponses` 호출 시, SDK가 `member` 필드를 캐시에서 resolve하면서
   `Member:익명UUID`가 이미 캐시에 있으므로 **첫 번째로 캐시된 member 연결 데이터 전체를 반환**
4. 결과: 모든 응답이 첫 번째 응답의 데이터를 가리킴

**즉, 같은 memberId를 여러 응답에 재사용하는 것이 SDK 캐시 오작동을 유발함.**

## 📋 해결 방안 비교 및 리스크 점검

| 방안 | 설명 | 리스크 | 채택 |
|------|------|--------|------|
| A | SDK 완전 우회: REST API 직접 호출 | 인증/보안 설정 필요, 복잡도 높음 | ❌ |
| B | `member` 필드 제거: ListSurveyResponses에서 member join 삭제 | 어드민 UI에서 제출자 이름/전화 표시 불가 | ❌ |
| C | 매 응답마다 새 Member 생성 (이전 방식) | DB 오염, 생성→검색 지연 문제 반복 | ❌ |
| **D** | **SDK 인스턴스를 매 요청마다 새로 초기화** | Firebase 초기화 비용 있으나 서버 액션이므로 감수 가능 | ✅ |
| **E** | **connector.gql의 ListSurveyResponses에서 member 조인을 제거하고, 어드민 UI는 member 정보 없이 표시** | UI 변경 최소화, 스키마 변경 없음, 가장 안전 | ✅ 최우선 |

## ✅ 채택된 해결책: 방안 E (member 조인 제거)

### 핵심 아이디어
- `ListSurveyResponses` 쿼리에서 `member { ... }` 조인을 제거
- SDK 캐시 충돌의 원인인 `member` 참조 자체를 제거
- 어드민 응답 목록에서 이름/전화번호 대신 **"익명"** 으로 표시 (설문 특성상 문제없음)
- 엑셀 다운로드 시 이름/전화번호 컬럼도 "익명"으로 통일

### 리스크 검증
- `connector.gql` 수정 → SDK 재생성 필요 없음 (서버에서 직접 쿼리 실행)
- 단, `connector.gql` 변경은 Firebase에 배포(deploy)해야 반영됨
  - **문제**: `firebase deploy` 없이는 서버 쿼리 변경이 반영 안 됨
  - **대안**: connector.gql 변경 대신 **서버 액션에서 결과를 가공**

### 🎯 실제 구현 방법 (firebase deploy 없이)

`connector.gql`을 바꿀 수 없으므로, **서버 액션에서 SDK 응답의 `member` 필드를 신뢰하지 않고 직접 고정값으로 덮어씀.**

```typescript
// listSurveyResponsesAction에서
const data = JSON.parse(JSON.stringify(raw));
// member 필드를 캐시 참조 대신 고정값으로 강제 덮어쓰기
data.forEach((r: any) => {
  r.member = { id: r.member?.id ?? '', name: '익명', phone: '010-0000-0000', isSelfRegistered: true };
});
```

하지만 이것도 `answers` 필드가 첫 번째 값으로 고정되는 문제를 해결하지 못함.

**진짜 핵심**: SDK가 `answers` 필드까지 캐시에서 잘못 가져오고 있다면,
**SDK 캐시를 완전히 비활성화**해야 함.

Firebase Data Connect SDK의 `DataConnect` 인스턴스에 캐시 옵션이 있는지 확인 필요.

## 🔧 최종 구현 계획

### [1] Firebase Data Connect 인스턴스에서 캐시 비활성화
- `src/lib/dataconnect` 또는 초기화 코드에서 캐시 설정 확인
- `enablePersistentCacheIndexAutoCreation` 등 캐시 관련 옵션 탐색

### [2] 대안: 매 서버 액션 호출 시 새 DataConnect 인스턴스 생성
- 모듈 수준에서 공유되는 인스턴스 대신 요청마다 새 인스턴스 생성
- 리스크: 연결 오버헤드 (서버 액션은 서버에서만 실행되므로 감수 가능)

### [3] 최후 대안: SDK 완전 우회 → Firebase Admin SDK + 직접 SQL 쿼리
- Firebase Admin SDK로 직접 PostgreSQL에 접근
- 가장 확실하나 구현 복잡도 높음

## ⚡ 즉시 적용 가능한 임시 해결책

`listSurveyResponsesSDK`를 호출하기 전에 
**DataConnect 인스턴스를 새로 생성하여 캐시를 초기 상태로 리셋.**
