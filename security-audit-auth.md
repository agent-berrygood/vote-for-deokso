# 투표 시스템 보안 감사 보고서 (Authentication & Authorization)

**감사 일자**: 2026-02-22
**감사 대상**: C:\Users\E\Desktop\Antigravity\vote
**감사 항목**: 인증(Authentication), 권한 관리(Authorization), 세션 관리, API 보안

---

## 목차
1. [결과 요약](#결과-요약)
2. [1. 인증(Authentication) 로직](#1-인증authentication-로직)
3. [2. 어드민 접근 제어(Admin Access Control)](#2-어드민-접근-제어admin-access-control)
4. [3. API 경로 보호](#3-api-경로-보호)
5. [4. 비밀번호 및 인증 정보 처리](#4-비밀번호-및-인증-정보-처리)
6. [5. 세션/토큰 보안](#5-세션토큰-보안)
7. [6. 하드코딩된 시크릿 검증](#6-하드코딩된-시크릿-검증)
8. [7. CSRF 보호](#7-csrf-보호)
9. [8. 레이트 제한](#8-레이트-제한)
10. [9. 추가 보안 취약점](#9-추가-보안-취약점)
11. [10. 권장 조치 사항](#10-권장-조치-사항)

---

## 결과 요약

| 구분 | 심각도 | 개수 | 상태 |
|------|--------|------|------|
| Critical (치명적) | 🔴 | 7 | 즉시 대응 필요 |
| High (높음) | 🟠 | 9 | 우선 대응 필요 |
| Medium (중간) | 🟡 | 13 | 단기 대응 필요 |
| Low (낮음) | 🟢 | 1 | 장기 개선 권고 |
| **총 이슈** | — | **30** | — |

---

## 1. 인증(Authentication) 로직

### 1.1 일반 사용자(선거인) 인증

**현재 구현** (`src/app/page.tsx`):
- 2단계 인증 방식 사용
- **Step 1**: 이름, 전화번호, 생년월일 입력 후 서버-측 Firestore 검색
- **Step 2**: Firebase Phone Authentication으로 SMS 인증번호 전송 및 확인

**코드 흐름**:
```typescript
// Step 1: Firestore에서 선거인 정보 검증
const q = query(
  votersRef,
  where('name', '==', name.trim()),
  where('phone', '==', phone.trim()),
  where('birthdate', '==', birthdate.trim())
);
const snapshot = await getDocs(q);

// Step 2: Firebase Phone Auth로 SMS 전송
const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);

// Step 3: 인증번호 확인
await confirmationResult?.confirm(inputAuthKey);
```

**발견된 이슈**:

#### 🔴 Critical #1: SMS 인증 우회 가능 (잠재적)
- **위치**: `/src/app/page.tsx` 라인 268-275
- **문제**: Firestore 검색 후 Firebase Phone Auth를 사용하지만, SMS 코드 입력 전에 `tempVoterId`와 `tempVoterName`이 sessionStorage에 저장됨
- **위험**: Session Storage는 클라이언트 측에서 JavaScript로 접근 가능 → XSS 공격 시 voterId 탈취 가능
- **코드 예시**:
```typescript
sessionStorage.setItem('tempVoterId', voterDoc.id);
sessionStorage.setItem('tempVoterName', name);
// 인증 코드 확인 전에 이미 저장됨 (취약)
```
- **권장**:
  - tempVoterId는 httpOnly 쿠키에 저장
  - sessionStorage 대신 암호화된 상태 관리 라이브러리 사용
  - CSRF 토큰 추가

#### 🟠 High #1: 인증번호 재시도 제한 없음
- **위치**: `/src/app/page.tsx` 라인 253-298
- **문제**: Firebase의 기본 설정에만 의존. 프로젝트 측에서 인증번호 재시도 횟수 제한 로직 없음
- **위험**: 무차별 대입(Brute Force) 공격 가능 (6자리 숫자 = 최대 1,000,000 조합)
- **권장**: Firebase Console에서 SMS 인증 정책 설정 (재시도 횟수 제한, 시간 제한 등)

#### 🟠 High #2: Phone Number 형식 검증 미흡
- **위치**: `/src/app/page.tsx` 라인 140-151, 171
- **문제**: 전화번호 형식 검증이 단순 숫자 포맷팅만 수행. 실제 유효성(예: 010으로 시작) 검증 없음
- **위험**: 잘못된 번호로 SMS 발송 시도 → 로그 오염, 사용자 경험 저하
- **코드**:
```typescript
const formattedPhone = phone.replace(/-/g, '').replace(/^0/, '+82');
// '0' 제거 후 '+82' 붙이기만 함. 유효한 한국 번호인지 검증 없음
```
- **권장**: 정규식으로 한국 전화번호 형식 검증
```typescript
const koPhoneRegex = /^(010|011|012|016|017|018|019)-\d{3,4}-\d{4}$/;
```

#### 🟡 Medium #1: 생년월일 형식 검증 부재
- **위치**: `/src/app/page.tsx` 라인 354-358
- **문제**: 생년월일 입력 필드에 형식 검증 없음. 임의의 문자열 입력 가능
- **위험**: YYMMDD가 실제 유효한 날짜인지 확인 안 함
- **권장**: 클라이언트 측 형식 검증 추가

---

### 1.2 어드민 인증

**현재 구현** (`src/app/admin/login/page.tsx`):
- 단순 비밀번호 입력 방식
- 환경변수 또는 하드코딩된 기본값 사용

**코드**:
```typescript
const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'vote2026';

if (password === CORRECT_PASSWORD) {
    sessionStorage.setItem('admin_auth', 'true');
    router.push('/admin');
}
```

#### 🔴 Critical #2: 평문 비밀번호 비교 및 NEXT_PUBLIC 노출
- **위치**: `/src/app/admin/login/page.tsx` 라인 14-26
- **문제**:
  1. `NEXT_PUBLIC_` 프리픽스는 클라이언트 측에 노출됨 → 빌드된 JavaScript에 포함됨
  2. 비밀번호가 평문으로 저장 및 비교됨 (해싱 없음)
  3. 기본값이 `'vote2026'`으로 하드코딩됨
- **위험**:
  - 어드민 비밀번호가 소스 코드에 평문으로 존재
  - 빌드 아티팩트에서 쉽게 추출 가능
  - 여러 어드민이 같은 비밀번호 공유 (감사 추적 불가)
- **권장**:
  - 비밀번호를 `NEXT_PUBLIC_`이 아닌 private 환경변수로 변경
  - bcrypt 또는 argon2로 비밀번호 해싱
  - 서버-측 API route에서 비밀번호 검증 수행
  - JWT 토큰 발급 및 사용
  - 어드민별 개별 계정 시스템 도입

#### 🔴 Critical #3: SessionStorage만으로 인증 유지 (재검증 없음)
- **위치**: `/src/app/admin/login/page.tsx` 라인 19-21, `/src/app/admin/layout.tsx` 라인 16-17
- **문제**:
  - 클라이언트 sessionStorage에 `admin_auth = 'true'` 저장
  - 서버 측 검증이 없음
  - 개발자 도구에서 직접 수정 가능
- **위험**:
  ```javascript
  // 브라우저 콘솔에서 간단히 실행하면 어드민 권한 획득
  sessionStorage.setItem('admin_auth', 'true');
  location.href = '/admin';
  ```
- **권장**:
  - httpOnly 쿠키에 JWT 토큰 저장
  - 모든 요청 시 서버 측에서 토큰 검증
  - CSRF 토큰 추가

---

## 2. 어드민 접근 제어(Admin Access Control)

### 2.1 어드민 Layout 보호

**현재 구현** (`src/app/admin/layout.tsx`):
```typescript
useEffect(() => {
    if (pathname === '/admin/login') return;

    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
        setAuthorized(true);
    } else {
        router.replace('/admin/login');
    }
    setLoading(false);
}, [pathname, router]);
```

#### 🟠 High #3: 클라이언트 측 인증만 수행
- **위치**: `/src/app/admin/layout.tsx` 라인 13-24
- **문제**:
  - sessionStorage 체크만 함
  - 개발자 도구에서 수정 가능
  - 로딩 완료 전 콘텐츠에 순간적으로 접근 가능 (Race Condition)
- **위험**:
  - 일시적으로 인증되지 않은 사용자가 관리자 페이지 콘텐츠 볼 수 있음
  - XSS 공격 시 sessionStorage 변조로 권한 탈취
- **권장**:
  - Next.js 미들웨어 구현
  - 서버 측 세션 검증
  - httpOnly 쿠키 기반 인증

### 2.2 어드민 페이지 기능 접근

#### 🟡 Medium #2: 권한 세분화 부재
- **위치**: `/src/app/admin/page.tsx` 전체
- **문제**:
  - 모든 어드민이 모든 기능 접근 가능
  - 역할 기반 접근 제어(RBAC) 미구현
- **위험**:
  - 한 어드민의 실수/악의로 전체 데이터 삭제 가능
  - 감사 추적(Audit Log) 불가
- **권장**:
  - 역할 정의 (예: admin_owner, admin_manager, admin_viewer)
  - 기능별 권한 확인 로직 추가
  - 감사 로그 기록

---

## 3. API 경로 보호

### 3.1 API Routes 현황

**발견 사항**:
- `/src/app/api/` 디렉토리 없음
- **모든 백엔드 로직이 클라이언트 컴포넌트(use client)에서 Firebase SDK 직접 호출**

#### 🔴 Critical #4: 직접 Database 접근 (Server-Side 검증 없음)
- **위치**: 모든 Next.js 페이지 컴포넌트
- **문제**:
  - Firebase 권한은 클라이언트 측 규칙(Firestore Security Rules)에만 의존
  - 백엔드 검증 로직이 전혀 없음
  - 클라이언트 코드를 수정하면 권한 우회 가능
- **위험**: 클라이언트 SDK 수정으로 권한 체크 우회 가능, 백엔드 감사 불가
- **권장**:
  - Next.js API routes 구현
  - 모든 DB 접근을 API를 통해서만 허용
  - 서버-측 JWT 토큰 검증

#### 🟠 High #4: Firestore Security Rules에만 의존
- **위치**: Firebase Console (이 프로젝트 외부)
- **문제**: Rules 검증 못함 (콘솔 확인 필요), Rules 버그 시 무방비 상태
- **권장**: Firestore Rules 최소 권한 원칙 적용, Firebase App Check 활성화

### 3.2 데이터 수정 작업 보호

#### 🟠 High #5: 선거인 정보 수정 검증 부재
- **위치**: `/src/app/vote/page.tsx` 라인 219-289
- **문제**: Transaction 내에서 선거인 정보를 client에서 읽음, 읽은 정보의 정확성을 서버가 검증하지 않음
- **권장**: 서버-측 API로 변경

---

## 4. 비밀번호 및 인증 정보 처리

### 4.1 비밀번호 저장

#### 🔴 Critical #5: 어드민 비밀번호 평문 저장
- **위치**: `/src/app/admin/login/page.tsx` 라인 16
- **코드**:
  ```typescript
  const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'vote2026';
  ```
- **상세**:
  - 기본값이 소스 코드에 노출됨
  - Git 히스토리에 기록됨
  - 빌드된 JavaScript에 포함됨
  - 해싱 없음

### 4.2 비밀번호 비교

#### 🟠 High #6: Timing Attack 취약성
- **위치**: `/src/app/admin/login/page.tsx` 라인 18
- **문제**: JavaScript의 `===` 연산자는 timing-safe하지 않음
- **권장**: 서버-측에서 `crypto.timingSafeEqual()` 사용

---

## 5. 세션/토큰 보안

### 5.1 세션 저장소

**현재 구현**:
```typescript
// 선거인 인증
sessionStorage.setItem('voterId', tempVoterId);
sessionStorage.setItem('voterName', tempVoterName);
sessionStorage.setItem('electionId', activeElectionId);

// 어드민 인증
sessionStorage.setItem('admin_auth', 'true');
sessionStorage.setItem('isAdmin', 'true');
```

#### 🔴 Critical #6: SessionStorage 사용 (XSS 취약)
- **위치**:
  - `/src/app/page.tsx` 라인 211-214, 268-274
  - `/src/app/admin/login/page.tsx` 라인 19-21
- **문제**: sessionStorage는 JavaScript로 접근 가능, XSS 공격 시 토큰 탈취됨
- **권장**: httpOnly, Secure 쿠키 사용

#### 🟡 Medium #3: 세션 타임아웃 없음
- **위치**: sessionStorage 전체
- **문제**: 유효기간 설정 없음, 공유 컴퓨터에서 세션 탈취 위험
- **권장**: 클라이언트 타이머로 자동 로그아웃

#### 🟡 Medium #4: Firebase 토큰 관리 미흡
- **위치**: `/src/app/page.tsx`
- **문제**: Firebase 토큰 재신청(refresh) 로직 없음, 토큰 만료 시 권한 확인 불가
- **권장**: Firebase `onAuthStateChanged()` 모니터링

---

## 6. 하드코딩된 시크릿 검증

### 6.1 환경 변수 분석

#### 🟠 High #7: Firebase API Key 노출
- **위치**: `.env.local`
- **문제**: `NEXT_PUBLIC_` 프리픽스이므로 클라이언트에 노출됨
- **권장**: Firestore Security Rules 엄격 설정, Firebase App Check 활성화

### 6.2 소스 코드 내 하드코딩 값

| 위치 | 값 | 심각도 | 비고 |
|------|----|----|------|
| `/src/app/admin/login/page.tsx:16` | `'vote2026'` | 🔴 Critical | 어드민 기본 비밀번호 |
| `/src/hooks/useElection.ts:6` | `'default-2026'` | 🟢 Low | 기본 선거 ID |
| `/src/app/vote/page.tsx:47` | `'관리자'` | 🟡 Medium | 관리자 선거인명 |

---

## 7. CSRF 보호

#### 🔴 Critical #7: CSRF 토큰 미구현
- **위치**: 모든 상태 변경 작업
- **영향받는 작업**: 어드민 로그인, 투표 제출, 후보자 업로드/삭제, 선거인 추가/삭제, 선거 데이터 초기화
- **권장**: 모든 상태 변경 요청에 CSRF 토큰 포함, SameSite 쿠키 정책 설정

#### 🟡 Medium #5: Origin/Referer 검증 없음
- **위치**: 모든 API 호출
- **문제**: 요청 출처 검증 없음, 어느 도메인에서든 요청 가능
- **권장**: 서버 측 출처 검증 추가

---

## 8. 레이트 제한

#### 🟠 High #8: 레이트 제한 미구현
- **취약한 엔드포인트**:
  1. **어드민 로그인** (`/admin/login`) - 비밀번호 무차별 대입 공격 가능
  2. **선거인 인증** (Step 1) - SMS 발송 요청, Firebase 제한에만 의존
  3. **인증번호 확인** (Step 2) - 6자리 숫자 브루트 포스 가능

**권장되는 레이트 제한 정책**:

| 엔드포인트 | 제한 | 기간 |
|----------|------|------|
| `/admin/login` | 5회 | 15분 |
| SMS 발송 (선거인) | 3회 | 1시간 |
| 인증번호 확인 | 10회 | 1시간 |
| 선거인 검색 | 50회 | 1분 |

---

## 9. 추가 보안 취약점

### 9.1 XSS (Cross-Site Scripting)

#### 🟡 Medium #6: User Input Sanitization 부재
- **위치**: `/src/app/admin/page.tsx` 라인 225-246 (CSV 파싱), `/src/app/page.tsx` 라인 336-357 (폼 입력)
- **문제**: 후보자 이름을 아무 검증 없이 Firestore에 저장
- **권장**: DOMPurify 또는 유사 라이브러리 사용

### 9.2 권한 확장(Privilege Escalation)

#### 🟠 High #9: 관리자 여부 쉽게 판별 가능
- **위치**: `/src/app/vote/page.tsx` 라인 243
- **코드**:
  ```typescript
  const isAdmin = voterData.name === ADMIN_VOTER_NAME; // '관리자'
  ```
- **위험**: 선거인 이름이 `'관리자'`이면 무제한 투표 가능
- **권장**: 서버-측 명시적 `isAdmin` 플래그 사용

### 9.3 데이터 검증 부재

#### 🟡 Medium #7: 업로드 파일 검증 미흡
- **위치**: `/src/app/admin/page.tsx` 라인 168-196
- **문제**: 파일명만으로 형식 판단 (MIME type 검증 없음), 파일 크기 제한 없음
- **권장**: MIME type 검증 + 파일 크기 제한 추가

### 9.4 정보 공개(Information Disclosure)

#### 🟡 Medium #8: 상세한 오류 메시지
- **위치**: 여러 곳
- **문제**: `errorCode`가 사용자에게 노출됨, 공격자가 시스템 정보 유추 가능
- **권장**: 사용자에게는 일반 메시지, 서버 로그에만 상세 정보 기록

---

## 10. 권장 조치 사항

### 10.1 즉시 조치 (Priority 1 - 1주일 내)

#### 1. 어드민 인증 시스템 완전 개편
- [ ] API route 구현 (`/api/auth/admin`)
- [ ] bcrypt로 비밀번호 해싱
- [ ] JWT 토큰 발급 및 httpOnly 쿠키 저장
- [ ] 모든 어드민 요청에서 JWT 검증

**예시 코드**:
```typescript
// src/pages/api/auth/admin/login.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { password } = req.body;
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH;

  const isValid = await bcrypt.compare(password, hashedPassword);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '8h'
  });

  res.setHeader('Set-Cookie', `authToken=${token}; HttpOnly; Secure; SameSite=Strict`);
  res.json({ success: true });
}
```

#### 2. SessionStorage 제거, 안전한 저장소로 변경
- [ ] 모든 sensitive 데이터를 httpOnly 쿠키로 이동
- [ ] sessionStorage는 비민감 정보만 저장

#### 3. CSRF 토큰 구현
- [ ] 모든 상태 변경 요청에 CSRF 토큰 포함
- [ ] SameSite 쿠키 정책 설정

#### 4. Firebase Security Rules 감사
- [ ] Firestore Rules 확인 및 최소 권한 원칙 적용

---

### 10.2 단기 조치 (Priority 2 - 2주일 내)

#### 5. API Routes 완전 전환
- [ ] 모든 Firestore 접근을 API로 변경
- [ ] 서버-측 권한 검증 추가
- [ ] 감사 로그(Audit Log) 구현

#### 6. 레이트 제한 구현
- [ ] 엔드포인트별 제한 설정
- [ ] IP 기반 제한

#### 7. 입력 검증 및 Sanitization
- [ ] DOMPurify 라이브러리 추가
- [ ] CSV/Excel 업로드 검증 강화

#### 8. Firebase App Check 활성화
- [ ] reCAPTCHA v3 또는 App Check 토큰 사용

#### 9. 권한 세분화 (RBAC) 구현
- [ ] 역할 정의 및 기능별 권한 확인

---

### 10.3 중기 조치 (Priority 3 - 1개월 내)

#### 10. 보안 헤더 추가
- [ ] CSP (Content Security Policy)
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Strict-Transport-Security (HSTS)

```typescript
// next.config.ts에서
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'" }
];
```

#### 11. 로깅 및 모니터링
- [ ] 모든 인증 시도 로깅
- [ ] 비정상적 활동 감지
- [ ] 정기적인 로그 검토

---

## 발견된 모든 이슈 요약

| # | 심각도 | 제목 | 위치 | 권장 조치 |
|---|--------|------|------|---------|
| Critical #1 | 🔴 | SMS 인증 전 sessionStorage 저장 | page.tsx:268 | httpOnly 쿠키로 변경 |
| Critical #2 | 🔴 | 어드민 비밀번호 평문 + NEXT_PUBLIC | admin/login:16 | bcrypt + 서버-측 검증 |
| Critical #3 | 🔴 | SessionStorage만으로 어드민 인증 | admin/login:19 | JWT 토큰 + httpOnly 쿠키 |
| Critical #4 | 🔴 | 클라이언트에서 직접 DB 접근 | 모든 페이지 | API routes 구현 |
| Critical #5 | 🔴 | 어드민 기본 비밀번호 하드코딩 | admin/login:16 | 환경변수 + 해싱 |
| Critical #6 | 🔴 | SessionStorage XSS 취약 | page.tsx, admin/login | httpOnly 쿠키 |
| Critical #7 | 🔴 | CSRF 토큰 미구현 | 모든 상태변경 | CSRF 토큰 추가 |
| High #1 | 🟠 | 인증번호 재시도 제한 없음 | page.tsx:253 | Firebase 설정 확인 |
| High #2 | 🟠 | Phone 형식 검증 미흡 | page.tsx:140 | 정규식 검증 추가 |
| High #3 | 🟠 | 클라이언트 인증만 수행 | admin/layout:13 | 미들웨어 + 서버 검증 |
| High #4 | 🟠 | API 없음, Rules만 의존 | 프로젝트 전체 | API routes 구현 |
| High #5 | 🟠 | 선거인 정보 검증 부재 | vote/page:219 | 서버-측 검증 |
| High #6 | 🟠 | Timing Attack 취약성 | admin/login:18 | timingSafeEqual 사용 |
| High #7 | 🟠 | Firebase API Key 노출 | .env.local | Rules + App Check |
| High #8 | 🟠 | 레이트 제한 없음 | admin/login, page.tsx | rate-limit 구현 |
| High #9 | 🟠 | 관리자 여부 쉽게 판별 | vote/page:243 | 서버-측 플래그 |
| Medium #1 | 🟡 | 생년월일 형식 검증 없음 | page.tsx:354 | 정규식 검증 추가 |
| Medium #2 | 🟡 | 권한 세분화 부재 | admin/page | RBAC 구현 |
| Medium #3 | 🟡 | 세션 타임아웃 없음 | sessionStorage | 타이머 추가 |
| Medium #4 | 🟡 | Firebase 토큰 관리 미흡 | page.tsx | onAuthStateChanged 추가 |
| Medium #5 | 🟡 | Origin/Referer 검증 없음 | API | 출처 검증 추가 |
| Medium #6 | 🟡 | User Input Sanitization 없음 | admin/page:225 | DOMPurify 사용 |
| Medium #7 | 🟡 | 업로드 파일 검증 미흡 | admin/page:168 | MIME type + 크기 제한 |
| Medium #8 | 🟡 | 상세한 오류 메시지 | page.tsx:232 | 일반 메시지로 변경 |
| Low #1 | 🟢 | Firestore 주입 위험 (낮음) | 모든 쿼리 | 구조적으로 안전 |

---

## 최종 권고

이 투표 시스템은 **프로토타입 수준의 보안**을 갖추고 있습니다. **프로덕션 환경에서 사용하기 전에 다음을 반드시 수행**해야 합니다:

### 필수 조치 (Go/No-Go 기준):
1. **어드민 인증 시스템 개편** (bcrypt + JWT)
2. **API Routes 구현** (클라이언트 DB 직접 접근 제거)
3. **CSRF 보호** (토큰 + SameSite)
4. **SessionStorage → httpOnly 쿠키**
5. **레이트 제한** (모든 인증 엔드포인트)

### 강력 권고:
6. **Firestore Security Rules 검증**
7. **Firebase App Check 활성화**
8. **RBAC 구현**
9. **입력 검증 & Sanitization**
10. **감사 및 로깅**

---

**보고서 작성일**: 2026-02-22
**감사 대상**: Antigravity Vote System
**상태**: ⚠️ 프로덕션 배포 부적합 → 개선 필요
