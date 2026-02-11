# 카카오 알림톡(Kakao AlimTalk) 연동 가이드

카카오톡으로 인증번호를 발송하기 위해서는 **카카오 비즈니스 채널**과 **알림톡 발송 대행사**가 필요합니다.
개인이 카카오 API를 직접 호출하여 알림톡을 보내는 것은 불가능하며, 공식 딜러사(알리고, 솔라피/누리고, 비즈엠 등)를 통해야 합니다.

## 1. 준비 절차 (비개발)

1.  **카카오 비즈니스 채널 개설**
    *   [카카오 비즈니스 센터](https://business.kakao.com/)에서 채널을 개설하고 **비즈니스 채널(사업자 인증)**로 전환해야 합니다.
    *   *주의: 개인 채널(미인증)은 알림톡을 보낼 수 없습니다.*

2.  **발송 대행사 가입** (추천: 알리고, 솔라피 등)
    *   개발 편의성과 비용을 고려하여 대행사를 선택합니다.
    *   **알리고(Aligo)**: 저렴하고 연동이 간편함.
    *   **솔라피(Solapi/CoolSMS)**: 문서화가 잘 되어 있고 SDK가 좋음.

3.  **발송 프로필 키(Sender Key) 발급**
    *   대행사 사이트에서 카카오 채널을 연동하면 `Sender Key`가 발급됩니다.

4.  **템플릿 등록 (필수)**
    *   알림톡은 미리 승인된 내용만 보낼 수 있습니다. 대행사 사이트에서 템플릿을 등록하고 카카오의 승인을 받아야 합니다.
    *   **템플릿 예시**:
        ```text
        [덕소교회 선거]
        본인 확인 인증번호는 [#{AuthKey}] 입니다.
        타인에게 노출하지 마세요.
        ```
    *   승인까지 영업일 기준 1~3일 소요됩니다.

## 2. 개발 연동 절차

### A. 환경 변수 설정
발급받은 API Key들을 `.env.local` 파일에 저장합니다.

```bash
# .env.local 예시 (알리고 기준)
ALIGO_API_KEY=발급받은_API_키
ALIGO_USER_ID=aligo_아이디
ALIGO_SENDER=발신번호(010-0000-0000)
KAKAO_SENDER_KEY=카카오_발신_프로필_키
KAKAO_TEMPLATE_CODE=등록한_템플릿_코드
```

### B. API 구현 (Next.js API Route)
브라우저(Client)에서 바로 대행사 API를 호출하면 **CORS 오류**나 **보안 문제**가 발생하므로, Next.js의 `Route Handler`를 만들어야 합니다.

**파일 경로**: `src/app/api/send-alimtalk/route.ts` (새로 생성 필요)

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { phone, name, authKey } = await request.json();

    // 알리고 API 호출 예시
    const formData = new FormData();
    formData.append('key', process.env.ALIGO_API_KEY!);
    formData.append('userid', process.env.ALIGO_USER_ID!);
    formData.append('sender', process.env.ALIGO_SENDER!);
    formData.append('receiver', phone);
    formData.append('message', `[덕소교회] 인증번호: ${authKey}`); 
    // ... 기타 알림톡 필수 파라미터 (tpl_code, senderkey 등)

    const response = await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        body: formData,
    });
    
    const result = await response.json();
    return NextResponse.json(result);
}
```

### C. 클라이언트 수정
`src/app/page.tsx`에 있는 Mock 함수 대신, 위에서 만든 API를 호출하도록 수정합니다.

```typescript
// 변경 전 (Mock)
// const sendKakaoAuthCode = async ... (console.log)

// 변경 후 (Real)
const sendKakaoAuthCode = async (phone, name, authKey) => {
    const res = await fetch('/api/send-alimtalk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, authKey })
    });
    return res.ok;
};
```

## 요약
1. **[비즈니스]** 카카오 채널 개설 & 대행사 가입 & 템플릿 승인 (가장 오래 걸림)
2. **[개발]** API Key 환경변수 설정
3. **[개발]** `src/app/api/send-alimtalk/route.ts` 생성
4. **[개발]** `src/app/page.tsx`에서 API 호출로 변경

지금 바로 연동하려면 **1번(계약 및 승인)** 과정이 먼저 완료되어야 합니다.
