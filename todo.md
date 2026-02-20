# 🗳 후보자 교구 정보 DB 입력 기능 구현

- [V] 1. `src/types/index.ts` 파일의 `Candidate` 인터페이스에 `district?: string;` (교구) 속성 추가
- [V] 2. `src/app/admin/page.tsx` 파일 내 `handleDownloadTemplate` 함수의 후보자 CSV/Excel 업로드 템플릿 헤더에 'District' 항목 추가
- [V] 3. `src/app/admin/page.tsx` 파일 내 `handleCandidateUpload` 함수에서 엑셀 파일 파싱 시 `District` 컬럼을 읽어 `candidateData` 객체에 저장하도록 수정
- [V] 4. `src/components/CandidateManager.tsx` 파일에서 어드민이 관리 중인 후보자 목록을 볼 때 '교구(District)' 정보가 함께 표시되도록 UI 업데이트
- [V] 5. 코드 수정 후 빌드 및 TypeScript 에러가 없는지 확인 (`npm run build` 또는 `npx tsc --noEmit` 등)

**⚠️ 주의사항:** 사용자의 요청에 따라 반드시 **투표 후보란(`src/app/vote/page.tsx` 등 투표 페이지)에는 교구 정보가 노출되지 않아야 함.**
