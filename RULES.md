# 프로젝트 글로벌 룰 (Project Global Rules)

이 파일은 AI 에이전트(Antigravity 등)가 이 프로젝트에서 작업할 때 반드시 준수해야 하는 핵심 규칙들을 정의합니다.

## 🚨 인프라 배포(Deploy) 시 타겟 환경 교차 검증 의무

파이어베이스(Firebase Data Connect 등)나 백엔드 인프라에 배포(deploy) 작업을 수행할 때는 **절대 파이어베이스 CLI의 기본값(default)을 맹신하지 마십시오.**

배포 명령을 실행하기 전에 다음 절차를 반드시 거쳐야 합니다:

1. **환경 파일 사전 확인**: `.firebaserc`와 `.env` (또는 `.env.local`) 파일을 열어 현재 프론트엔드가 바라보는 운영(Production) 프로젝트 ID와 백엔드의 배포 타겟 별칭(Alias)이 정확히 일치하는지 교차 검증합니다.
2. **명시적 타겟 지정**: 검증이 끝난 후, 터미널에서 명령어를 실행할 때는 반드시 `--project production` (또는 실제 라이브 환경에 맞는 alias)과 같이 배포 타겟을 명시하는 플래그를 강제로 포함해야 합니다.

*   **위험한(잘못된) 예시**: `npx firebase deploy --only dataconnect` (로컬의 default 환경으로 잘못 배포될 위험이 매우 큼)
*   **올바른 예시**: `npx firebase deploy --only dataconnect --project production`
