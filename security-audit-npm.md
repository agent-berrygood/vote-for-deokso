# npm 패키지 의존성 보안 취약점 점검 결과

**점검일**: 2026-02-22
**점검 도구**: `npm audit`
**총 취약점 수**: 17개 (moderate 1개, high 16개)

---

## 1. 취약점 요약

| # | 패키지 | 심각도 | 취약점 유형 | 자동 수정 가능 | 직접 의존성 |
|---|--------|--------|-------------|---------------|------------|
| 1 | **xlsx** | HIGH | Prototype Pollution (GHSA-4r6h-8v6p-xvw6) | **NO** | **YES** |
| 2 | **xlsx** | HIGH | ReDoS (GHSA-5pgg-2g8v-p4x9) | **NO** | **YES** |
| 3 | **fast-xml-parser** | HIGH | DoS - DOCTYPE Entity Expansion (GHSA-jmr7-xgp7-cmfj) | YES | NO |
| 4 | **ajv** | MODERATE | ReDoS with `$data` option (GHSA-2g4f-4pwh-qvx6) | YES | NO |
| 5 | **minimatch** | HIGH | ReDoS via repeated wildcards (GHSA-3ppc-4f35-3m26) | YES (breaking) | NO |
| 6-17 | eslint 관련 체인 (12개) | HIGH | minimatch 취약점 전파 | YES (breaking) | NO |

---

## 2. 상세 분석

### 2.1. xlsx (SheetJS) — 가장 심각

- **심각도**: HIGH (CVSS 7.8 / 7.5)
- **취약점**:
  - **Prototype Pollution** (`< 0.19.3`): 악성 엑셀 파일 파싱 시 Object prototype 오염 가능 → 원격 코드 실행 위험
  - **ReDoS** (`< 0.20.2`): 정규식 서비스 거부 공격 가능
- **직접 의존성 여부**: YES (프로젝트에서 직접 사용)
- **자동 수정**: 불가 (`No fix available`)
- **권장 조치**:
  1. `xlsx` 패키지를 **SheetJS Community Edition** (`sheetjs`)으로 마이그레이션 검토
  2. 또는 대안 라이브러리(`exceljs`, `read-excel-file`) 사용 검토
  3. 최소한 파일 업로드 시 서버 측에서 파일 크기/형식 사전 검증 강화

### 2.2. fast-xml-parser — DoS 위험

- **심각도**: HIGH (CVSS 7.5)
- **취약점**: DOCTYPE entity expansion 제한 없음 → Billion Laughs 공격 가능
- **수정 방법**: `npm audit fix`로 자동 수정 가능 (5.3.6 이상으로 업데이트)

### 2.3. ajv — 낮은 위험도

- **심각도**: MODERATE
- **취약점**: `$data` 옵션 사용 시 ReDoS 가능
- **수정 방법**: `npm audit fix`로 자동 수정 가능 (6.14.0 이상)

### 2.4. minimatch + eslint 체인 — 개발 도구 관련

- **심각도**: HIGH
- **취약점**: ReDoS via repeated wildcards
- **영향 범위**: eslint, @typescript-eslint/* 등 개발 도구 체인 전체 (12개 패키지)
- **수정 방법**: `npm audit fix --force` (eslint 10.x로 메이저 업데이트 필요, breaking change)
- **위험 평가**: 개발 환경 전용 의존성으로 프로덕션 영향 없음. 즉시 수정 불필요하나 장기적으로 업데이트 권장

---

## 3. 권장 조치 우선순위

### 즉시 조치 (Priority 1)
```bash
npm audit fix
```
- `fast-xml-parser`, `ajv` 자동 수정 (비-breaking 변경)

### 단기 조치 (Priority 2)
- **xlsx 패키지 대체 검토**: Prototype Pollution 및 ReDoS 취약점이 수정 불가하므로, `exceljs` 등 대안 라이브러리로 마이그레이션 필요
- xlsx를 사용하는 코드에서 입력 파일 검증 로직 강화

### 장기 조치 (Priority 3)
```bash
npm audit fix --force
```
- eslint 10.x 메이저 업데이트 (breaking change 포함)
- eslint 설정 파일 호환성 검토 후 진행

---

## 4. 결론

- **프로덕션 영향이 있는 핵심 취약점**: `xlsx` (직접 의존성, 수정 불가) 및 `fast-xml-parser`
- **개발 도구 취약점**: eslint 체인 (프로덕션 미영향)
- **가장 시급한 조치**: `npm audit fix` 실행 + xlsx 대체 라이브러리 검토
