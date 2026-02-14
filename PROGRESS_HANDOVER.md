# 작업 진행 상황 (2026-02-14)

## 1. 현재 상태 (Current Status)
- **프로젝트**: `vote-for-deokso` (Next.js + Firebase)
- **Firebase 프로젝트**: `vote-for-deokso-back` (신규 프로젝트)
- **DB (Firestore)**:
    - 선거 ID: `당회보고용`
    - 후보자 데이터: 약 750명 업로드 완료.
    - 사진 경로: `/images/candidates/[type]/[name].jpg` (로컬 경로) 형식으로 업데이트 완료.
- **사진 (Images)**:
    - 위치: `public/images/candidates` (권사, 안수집사, 장로 폴더)
    - 상태: **150px, 약 3KB**로 리사이징 및 압축 완료.
    - 확장자: 모두 `.jpg`로 통일됨.

## 2. 주요 이슈 및 해결 방안 (Issues & Fixes)

### 🚨 Firestore 할당량 초과 (Quota Exceeded)
- **증상**: 사이트 접속 시 데이터를 불러오지 못하고 에러 발생.
- **원인**: 무료 플랜(Spark)의 일일 읽기 한도(50,000회) 초과. (후보자 750명 x 반복 새로고침)
- **해결**:
    1. **기다리기**: 매일 오후 5시(한국시간) 리셋.
    2. **업그레이드**: Blaze 요금제(종량제)로 변경.

### ⚠️ 이미지 엑박 (Image Not Loading)
- **증상**: 배포 후 이미지가 안 뜸.
- **원인**: 리눅스(Vercel) 환경에서 **한글 파일명**을 제대로 인식하지 못할 가능성 큼.
- **해결 예정 (To-Do)**:
    - `src/components/CandidateManager.tsx`에서 이미지 `src`에 `encodeURI()` 적용 필요.
    - 예: `<Avatar src={encodeURI(candidate.profileUrl)} ... />`

## 3. 다음 작업 가이드 (Next Steps)
다른 컴퓨터에서 작업을 이어가시려면:

1. **프로젝트 클론 및 설치**:
   ```bash
   git clone [레포지토리 주소]
   cd vote-for-deokso
   npm install
   ```

2. **환경 변수 확인**:
   `.env.local` 파일이 있는지 확인 (없으면 Vercel 환경변수 참조하여 생성).

3. **코드 수정 (이미지 인코딩)**:
   `src/components/CandidateManager.tsx` 파일 열기.
   `Avatar` 컴포넌트의 `src` 부분을 찾아서 아래와 같이 수정:
   ```tsx
   // 수정 전
   src={candidate.profileUrl || ''}
   
   // 수정 후
   src={candidate.profileUrl ? encodeURI(candidate.profileUrl) : ''}
   ```

4. **배포**:
   ```bash
   git add .
   git commit -m "fix: encode image urls for korean filenames"
   git push
   ```

## 4. 스크립트 도구 (Scripts)
`scripts/` 폴더에 유용한 도구들이 있습니다:
- `resize_images.mjs`: `public/images` 내의 이미지를 100px로 리사이징.
- `upload_candidates.mjs`: 로컬 이미지를 스캔하여 DB의 `profileUrl` 업데이트 (스토리지 안 씀).
- `fix_extensions.mjs`: DB의 `.png` 확장자를 `.jpg`로 일괄 수정.
