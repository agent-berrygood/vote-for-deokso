# 보안 검토 작업 계획

- [X] 1. npm 패키지 의존성 보안 취약점 점검 (`npm audit` 실행 및 결과 분석)
- [X] 2. 권한/인증 처리 로직 점검 (Admin 접근 제어 및 로그인 로직 보안성 검토)
  - Admin 로그인 방식을 `sessionStorage` 기반에서 **Server Action(HttpOnly Cookie)** 기반으로 전환
  - `src/middleware.ts` (Next.js Middleware)를 도입하여 서버 레벨에서 `/admin/` 라우트 보호
- [X] 3. 사용자 입력값 폼/데이터 검증 점검 (XSS, 주입 공격 방어)
  - `src/app/page.tsx` 선거인 로그인 폼에 XSS 방어 및 엄격한 정규표현식(전화번호, 생년월일, 20자 제한) 추가
  - `src/app/admin/page.tsx` Admin 페이지의 Election ID 및 신규 유권자 추가 시 특수문자 방어와 입력값 길이 점검 추가
- [X] 4. 민감한 데이터 보호 및 노출 상태 검토 (API 엔드포인트 및 로컬스토리지 점검)
  - `process.env.NEXT_PUBLIC_ADMIN_PASSWORD` 로 노출되던 패스워드를 서버 사이드의 `process.env.ADMIN_PASSWORD` 로 은닉화 완료
- [X] 5. SSR 및 컴포넌트 환경의 보안 취약점 점검 (API 권한 및 보안 헤더 검토)
  - Admin Layout을 클라이언트 컴포넌트에서 서버 컴포넌트로 변경하여 클라이언트 인증 로직 완전 제거
- [X] 6. 발견된 보안 취약점 패치 및 코드 리팩토링
- [X] 7. 수정 사항에 대한 빌드 및 터미널 테스트 실행
  - `npm run build` 테스트 완료 (오류 없음)
