# 설문 응답 로딩 중복 문제 개선 TODO

## 🔍 리스크 점검 결과 요약

### 핵심 발견 사항
1. `surveyResponse_insert`는 단순 INSERT이며 `(memberId, surveyId)` 유니크 제약이 없음
   → **같은 memberId로 반복 제출해도 각각 독립된 레코드가 생성됨** (기존 걱정 불필요)
2. 현재 "생성 → 검색" 방식이 실패할 때 Fallback이 실제 교인(권오민) ID를 반환함
   → **이것이 데이터 오염의 직접 원인**
3. `surveyResponse_insert`가 중복 허용이므로, **고정된 익명 계정 1개를 사용해도 완전히 안전**

### 아키텍처 결론
- **항목 1 (Fallback 제거 + 고정 익명계정 방식으로 전환)**: 완전히 안전. 스키마 변경 불필요.
- **항목 2 (useEffect 분리)**: 완전히 안전. 
- **항목 3 (중복 방지 필터)**: 완전히 안전. 방어 로직 추가일 뿐.
- **항목 4 (스키마 변경)**: ❌ 불필요. 위 발견으로 인해 제거.
- **항목 5 (서버단 중복 제거)**: 완전히 안전.
- **항목 6 (초기화 후 fetch)**: 완전히 안전.

---

## ✅ 실행 계획 (리스크 없음 확인됨)

### [1] data.ts - 익명 멤버 생성/검색 로직 전면 교체
**변경 전**: 생성 → 0.8초 대기 → 이름으로 검색 → 실패 시 마지막 교인 fallback (❌ 위험)
**변경 후**: 환경변수에 미리 등록된 고정 익명 계정 UUID를 그대로 사용 (✅ 안전)

- `anonymous_`로 시작하는 가상 ID 감지 시, 미리 생성해둔 고정 익명 교인의 UUID 사용
- `createMemberSDK` 및 `listMembersSDK` 호출 제거 (불필요한 네트워크 요청 제거)
- 코드 단순화: if 블록 전체를 `finalMemberId = process.env.ANONYMOUS_MEMBER_ID!` 한 줄로 대체
- **전제 조건**: Firebase 콘솔에서 교인 명부에 '익명' 교인 1명을 미리 등록하고 그 UUID를 `.env.local`에 `ANONYMOUS_MEMBER_ID=xxxxx` 형태로 저장

> [!IMPORTANT]
> **사전 작업 필요**: 어드민 [교인 관리]에서 이름='익명', 전화번호='010-0000-0000' 교인 1명을 수동으로 만들고,
> 그 UUID를 복사하여 `.env.local`에 `ANONYMOUS_MEMBER_ID=<UUID>` 를 추가해야 합니다.

### [2] admin/surveys/[id]/page.tsx - useEffect 분리
**변경 전**: `useEffect([fetchData, fetchResponses])` 하나에 두 함수 묶음
**변경 후**: 각각 독립된 `useEffect`로 분리하여 이중 실행 원천 차단

```
useEffect(() => { fetchData(); }, [fetchData]);
useEffect(() => { fetchResponses(); }, [fetchResponses]);
```

### [3] admin/surveys/[id]/page.tsx - responses 중복 제거 필터
**변경**: `setResponses` 호출 전 `r.id` 기준 dedupe 추가

```
const unique = data.filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i);
setResponses(unique);
```

### [4] admin/surveys/[id]/page.tsx - fetchResponses 시작 시 초기화
**변경**: 로딩 시작 전 `setResponses([])`로 초기화하여 이전 데이터 append 방지

### [5] data.ts - 서버 액션 응답 중복 제거
**변경**: `listSurveyResponsesAction` 반환 전 `id` 기준 dedupe 추가

---

## ⚠️ 이전 배포 과정에서 생긴 오염 데이터 정리 (수동)
- 교인 관리 페이지에서 이름이 `ANON_`으로 시작하는 교인 일괄 삭제
- 이름이 `익명_타임스탬프` 형태인 교인 일괄 삭제
- 이름이 `익명`이고 전화번호가 `010-0000-0000`인 중복 교인 1개만 남기고 나머지 삭제
