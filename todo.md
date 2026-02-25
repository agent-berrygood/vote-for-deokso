# 투표자 정보 확인 및 인증 분기 처리

- [x] 1. `src/app/actions/auth.ts`에 선거인 명부 확인 로직(`verifyVoterInfo`) 서버 액션 구현 (이름, 전화번호, 생년월일 수신 -> Firestore 명부 대조, 투표 완료여부 포함 정보 반환)
- [x] 2. `src/app/page.tsx`의 `handleRequestAuth` 함수에서 기존 Firestore 직접 조회 로직을 제거하고, 서버 액션(`verifyVoterInfo`)을 호출하도록 변경
- [x] 3. `src/app/page.tsx` 브라우저 단에서 반환된 정보를 확인하여, 모든 투표가 완료된 경우 "이미 모든 투표를 완료하셨습니다." 메시지를 띄우고 인증문자 전송 중단
- [x] 4. 투표가 미완료된 경우에만 기존 인증문자(Firebase Phone Auth) 전송 로직이 실행되도록 분기 처리
- [x] 5. 기존 컴포넌트(로그인/인증 폼)가 200줄을 초과하지 않고 재사용되도록 리팩토링 및 타입 안정성 점검
