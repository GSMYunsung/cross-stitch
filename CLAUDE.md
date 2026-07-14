# 개발 워크플로우

## 브랜치 전략

기능 개발 시 항상 아래 flow를 따를 것:

1. **새 브랜치 생성**: `feat/`, `fix/`, `chore/` 등 prefix 사용
   ```
   git checkout -b feat/기능명
   ```
2. **작업 후 커밋 & 푸쉬**
3. **PR 생성**: `gh pr create --base main --head 브랜치명`
4. **CI 통과 확인** (lint → typecheck → test)
5. **머지**: 사용자가 직접 GitHub에서 머지

## 규칙

- `main` 브랜치에 직접 커밋/푸쉬 금지 (Ruleset으로 차단됨)
- 작업 시작 전 반드시 새 브랜치 생성
- PR은 CI 통과 후 머지
- 머지 후 브랜치는 자동 삭제됨
