# 작업 진행 상황 (2026-02-14)

## 1. 현재 상태 (Current Status)
- **프로젝트**: `vote-for-deokso` (Next.js + Firebase)
- **배포**: Vercel (Static Assets)
- **주요 변경 사항**:
    - **이미지 최적화**: 300px, 80% 품질 (JPG), 로컬 호스팅 방식으로 변경 (DB 의존성 제거).
    - **봉사 이력 추가**: 후보자 데이터에 `profileDesc` 추가 및 엑셀 업로드 지원.
    - **UI 개선**:
        - **PC**: 2열 그리드, 가로형 카드 배치 (좌측: 사진/정보, 우측: 봉사 이력).
        - **Mobile**: 1열 그리드, 꽉 찬 카드 배치.

## 2. 주요 기능 상세 (Key Features)

### A. 이미지 처리 (Image Optimization)
- 기존의 불규칙한 크기와 포맷(PNG/JPG 혼용) 문제를 해결.
- `scripts/copy_and_resize.mjs` 스크립트를 통해 일괄 변환:
    - **Resize**: 가로 300px (세로 자동).
    - **Format**: `.jpg`로 통일.
    - **Quality**: 80% (용량 30~50KB 수준으로 최적화).
- **경로**: `/images/candidates/[Name].jpg` (한글 이름은 자동 인코딩 처리).

### B. 후보자 봉사 이력 (Service History)
- **DB 필드**: `profileDesc` (String).
- **업로드**: 관리자 페이지에서 엑셀/CSV 업로드 시 `ProfileDesc` 칼럼을 자동 인식하여 저장.
- **표시**: 투표 화면 카드 우측에 상세 봉사 이력 표시 (줄바꿈 지원).

### C. 반응형 디자인 (Responsive UI)
- **Grid Layout**:
    - PC/Tablet (sm 이상): `6` (2 Columns) - 정보 밀도를 높이고 가독성 확보.
    - Mobile (xs): `12` (1 Column) - 작은 화면에서 정보를 명확히 전달.
- **Card Design**:
    - 높이 맞춤 (`alignItems: stretch`).
    - 직분/차수 칩(Chip) 디자인 통일.

## 3. 남아있는 이슈 & 가이드 (Known Issues & Guide)

### 🚨 Firestore 할당량 (Quota)
- **현상**: 후보자 목록이 뜨지 않음 (빈 화면).
- **원인**: 무료 플랜(Spark)의 일일 읽기 할당량(50k) 초과.
- **해결**:
    - 한국 시간 **오후 5시**에 리셋됨.
    - 리셋 후 정상 작동함. (이미지는 DB와 무관하게 뜨도록 수정됨).

### 🛠️ 개발/배포 가이드
- **로컬 실행**: `npm run dev`
- **배포**: `git push origin main` (Vercel 자동 배포)
- **이미지 업데이트**:
    1. 원본 이미지를 로컬 특정 폴더에 준비.
    2. `npm run resize-images` (또는 `node scripts/copy_and_resize.mjs`) 실행.
    3. `public/images/candidates` 폴더의 변경사항을 Git에 커밋 & 푸시.

## 4. 유용한 스크립트
- `scripts/copy_and_resize.mjs`: 이미지 리사이징 및 복사.
- `scripts/upload_candidates.js`: (구버전) DB 업로드 스크립트.
- `src/utils/hangul.ts`: 한글 초성 검색 유틸리티.
