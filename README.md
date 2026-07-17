# CrossStitch — 나의 GitHub 커밋으로 만드는 픽셀 아트

GitHub 커밋 기록을 기반으로 나만의 크로스스티치 픽셀 아트를 만들고, GitHub README에 카드처럼 삽입할 수 있는 웹 서비스.

---

## 만든 이유

GitHub 프로필 README를 꾸미고 싶어도 막막한 경우가 많다.

- 잔디(contribution graph)는 이미 있지만, 나만의 개성을 담기 어렵다
- 외부 서비스를 쓰면 뱃지 디자인이 획일적이고, 수정이 불가능하다
- 직접 이미지를 만들려면 별도 툴이 필요하다

이 서비스는 GitHub 계정으로 로그인하면 20×20 그리드에 자유롭게 색을 칠해 픽셀 아트를 만들고, 완성된 이미지를 GitHub README에 바로 삽입할 수 있다.

---

## 모드

| 모드 | 설명 |
|------|------|
| **NORMAL** | 커밋 수 제한 없이 자유롭게 그리드를 채울 수 있음 |
| **CHALLENGE** | 최근 한 달 GitHub 커밋 수만큼만 셀을 채울 수 있음. 매달 1일 크론 잡이 실행되어 현재 커밋 수 기준으로 초과된 셀을 자동 제거 |

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) + React 19 |
| 언어 | TypeScript 5 |
| 스타일링 | Tailwind CSS 4 |
| 인증 | Firebase Auth + GitHub OAuth |
| 데이터베이스 | Firebase Firestore |
| 파일 저장 | Firebase Cloud Storage |
| 배포 | Vercel |
| CI/CD | GitHub Actions + CodeRabbit |

---

## 서비스 구조

```
🧑‍💻 사용자 (브라우저)
  │  GitHub 로그인 → Firebase Auth → GitHub Access Token을 httpOnly 쿠키 저장
  │  모드 선택 (NORMAL / CHALLENGE)
  │  20×20 그리드에 색 칠하기 (드래그 지원) → 완성 버튼
  ▼
🌐 Next.js API Routes
  │  /api/github/auth/login  → GitHub 토큰 httpOnly 쿠키 저장 (24시간 만료)
  │  /api/github/user        → 로그인한 사용자 정보 조회
  │  /api/github/commits     → 최근 한 달 커밋 수 조회 (GitHub Search API)
  │  /api/github/stats       → REPOS, FOLLOWERS, PRs, ISSUES 조회
  │  /api/readme-card/[uid]  → SVG 카드 생성 (픽셀 아트 + GitHub 통계)
  │  /api/cron/update        → 매달 1일 크론 잡 (셀 자동 제거)
  ▼
🗄️ Firebase Firestore
  │  grids/{uid} — 최초 로그인 시 빈 문서 생성, 모드 선택·완성 버튼 시 갱신
  ▼
🎨 html-to-image
  │  그리드 DOM 요소 → PNG 변환
  ▼
☁️ Firebase Cloud Storage
  │  images/{uid}.png 경로에 업로드
  ▼
📋 README 삽입
  │  ![CrossStitch](https://your-domain/api/readme-card/{uid})
  └─ 클립보드에 복사 → GitHub README에 붙여넣기
```

---

## 기능

- GitHub OAuth 로그인 / 로그아웃
- **NORMAL / CHALLENGE 모드** 선택
- 모드별 온보딩 모달 (최초 진입 시 1회)
- 최근 한 달 커밋 수 헤더에 표시 (CHALLENGE 모드)
- 20×20 인터랙티브 픽셀 그리드 에디터
- **드래그로 여러 셀 한 번에 색칠**
- 색상 피커로 원하는 색 선택
- 픽셀 아트 템플릿 제공
- 그리드 초기화 버튼
- 완성된 아트를 PNG로 변환 후 Firebase Storage 업로드
- **readme-card SVG API** — 픽셀 아트 + GitHub 통계(REPOS, FOLLOWERS, PRs, ISSUES) 포함
- README 삽입용 마크다운 코드 원클릭 복사
- **CHALLENGE 모드 크론 잡** — 매달 1일 커밋 수 기준으로 초과 셀 자동 제거

---

## README에 삽입하기

완성 후 생성되는 마크다운 코드를 GitHub README에 붙여넣으면 아래와 같이 표시된다:

```markdown
![CrossStitch](www.gitcrossstitch.site/api/readme-card/{uid})
```

카드에는 픽셀 아트와 함께 GitHub 통계(공개 레포, 팔로워, PR 수, 이슈 수)가 표시된다. (최대 1시간 캐시)

---

## CI/CD

```text
git push (브랜치)
  ↓
GitHub Actions CI 실행
  ├── Lint      (ESLint)
  ├── TypeCheck (tsc --noEmit)
  └── Test      (Vitest)
       ↓ 실패 시
  PR에 에러 리포트 자동 코멘트
  (main 직접 push 실패 시 fix/ci-{run_id} 브랜치 + PR 자동 생성)
       ↓ 통과 시
CodeRabbit 코드리뷰 자동 실행
       ↓
Vercel 자동 빌드 + 배포
```

- main 브랜치는 Ruleset으로 보호 (CI 통과 필수)
- PR 머지 후 브랜치 자동 삭제

---

## 기술 스택

| 분류 | 라이브러리 / 서비스 |
|------|---------------------|
| 프레임워크 | Next.js 15 (App Router) + React 19 |
| 언어 | TypeScript 5 |
| 스타일링 | Tailwind CSS 4 |
| 인증 | Firebase Auth + GitHub OAuth |
| 데이터베이스 | Firebase Firestore |
| 파일 저장 | Firebase Cloud Storage |
| 색상 피커 | `react-color-palette` |
| 애니메이션 | `react-lottie-player` |
| 이미지 변환 | `html-to-image` |
| HTTP 클라이언트 | `axios` |
| 테스트 | Vitest |
| 코드리뷰 | CodeRabbit |
| 배포 | Vercel |

---

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 스크립트

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run lint       # ESLint 검사
npm run typecheck  # TypeScript 타입 검사
npm run test       # Vitest 테스트
```

### 환경 변수 (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GITHUB_TOKEN=
```

> `.env.local`은 `.gitignore`에 포함되어 있습니다. 절대 커밋하지 마세요.

---

## 파일 구조

```
cross-stitch/
├── .github/
│   └── workflows/
│       ├── ci.yml            ← Lint / TypeCheck / Test + PR 자동 생성
│       └── daily-update.yml  ← 매달 1일 크론 잡 (셀 자동 제거)
├── __tests__/
│   └── gridLogic.test.ts     ← 그리드 로직 단위 테스트 (Vitest)
├── app/
│   ├── api/
│   │   ├── github/
│   │   │   ├── auth/login/   ← GitHub 토큰 httpOnly 쿠키 저장 (POST)
│   │   │   ├── user/         ← 로그인 사용자 정보 조회 (GET)
│   │   │   ├── commits/      ← 최근 한 달 커밋 수 조회 (GET)
│   │   │   └── stats/        ← GitHub 통계 조회 (GET)
│   │   ├── cron/
│   │   │   ├── update/       ← 셀 자동 제거 크론 엔드포인트 (POST)
│   │   │   └── simulate/     ← 크론 로직 시뮬레이션 (개발용)
│   │   └── readme-card/[uid]/← SVG 카드 생성 (GET)
│   ├── home/
│   │   └── _components/
│   │       ├── CrossStitchEditor.tsx     ← 메인 에디터 (색상 피커 + 그리드)
│   │       ├── OnboardingModal.tsx        ← 모드별 최초 진입 온보딩
│   │       └── modal/
│   │           ├── CrossStitchResultModal.tsx ← 결과 이미지 + 마크다운 복사
│   │           ├── ModeSelectionModal.tsx     ← NORMAL / CHALLENGE 모드 선택
│   │           ├── WelcomeModal.tsx            ← 첫 진입 환영 모달
│   │           ├── TemplateModal.tsx           ← 픽셀 아트 템플릿 선택
│   │           └── ResetNotificationModal.tsx  ← 크론 셀 제거 알림
│   ├── login/
│   │   ├── page.tsx          ← 로그인 페이지
│   │   └── LoginForm.tsx     ← GitHub 로그인 버튼
│   ├── src/
│   │   ├── components/
│   │   │   ├── CrossTitch.tsx      ← 20×20 픽셀 그리드 컴포넌트
│   │   │   ├── Header.tsx          ← 커밋 수 + 모드 배지 + 로그아웃
│   │   │   └── BackPressHandler.tsx← 뒤로가기 방지
│   │   ├── config/
│   │   │   └── modes.ts            ← NORMAL / CHALLENGE 모드 설정 단일 진실 공급원
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx         ← GitHub 로그인 / 로그아웃
│   │   │   ├── useFile.tsx         ← Firebase Storage 업로드 / 삭제
│   │   │   └── useGridPersistence.ts← Firestore 그리드 저장 / 불러오기
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx    ← 인증 상태 + 커밋 수 fetch
│   │   │   └── StitchProvider.tsx  ← 그리드 상태 관리
│   │   ├── types/
│   │   │   ├── github.ts           ← GitHub API 응답 타입
│   │   │   └── crossTitch.ts       ← 그리드 셀 타입
│   │   └── utils/
│   │       ├── gridLogic.ts        ← 셀 제거 / 리셋 로직
│   │       ├── generateGridImage.ts← 그리드 → PNG 변환
│   │       ├── uploadStitchImage.ts← PNG → Firebase Storage 업로드
│   │       ├── date.ts
│   │       └── string.ts
│   ├── lib/
│   │   ├── firebase.ts             ← Firebase 클라이언트 초기화
│   │   └── firebase-admin.ts       ← Firebase Admin SDK (서버사이드)
│   ├── layout.tsx
│   ├── page.tsx                    ← / → /login 리다이렉트
│   └── globals.css
├── .coderabbit.yaml                ← CodeRabbit 코드리뷰 설정
├── CLAUDE.md                       ← Claude Code 개발 워크플로우
├── TROUBLESHOOTING.md              ← 트러블슈팅 기록
└── next.config.ts
```

---

## 데이터 모델

### Firestore — `grids/{uid}`

```typescript
{
  checkedCells: { r: number; c: number; color: string }[];
  commitCount: number;
  updatedAt: string;      // ISO 8601
  firstLoginAt: string;   // ISO 8601, 최초 로그인 시 기록
  mode?: "normal" | "challenge";
  githubUsername?: string;
  wasReset?: boolean;
}
```

### StitchCell (그리드 셀)

```typescript
type StitchCell = {
  color: string;      // 셀 색상
  isChecked: boolean; // 색칠 여부
};
```
