# CrossStitch — 나의 GitHub 커밋으로 만드는 픽셀 아트

GitHub 커밋 기록을 기반으로 나만의 크로스스티치 픽셀 아트를 만들고, GitHub README에 뱃지처럼 삽입할 수 있는 웹 서비스.

---

## 만든 이유

### 문제

GitHub 프로필 README를 꾸미고 싶어도 막막한 경우가 많다.

- 잔디(contribution graph)는 이미 있지만, 나만의 개성을 담기 어렵다
- 외부 서비스를 쓰면 뱃지 디자인이 획일적이고, 수정이 불가능하다
- 직접 이미지를 만들려면 Photoshop 같은 별도 툴이 필요하다

### 해결

이 서비스는 GitHub 계정으로 로그인하면 **최근 커밋 수를 보여주면서**, 20×20 그리드 위에 색을 칠해 나만의 크로스스티치 픽셀 아트를 만들 수 있다.
완성된 이미지는 Firebase Storage에 업로드되고, **README에 바로 붙여넣을 수 있는 마크다운 코드**를 생성해 준다.

| 문제 | 해결 |
| ---- | ---- |
| 프로필에 개성을 담기 어려움 | 20×20 픽셀 그리드로 자유롭게 그림 그리기 |
| 디자인 툴 없이 이미지 생성 불가 | 브라우저에서 바로 PNG로 변환 및 저장 |
| 생성한 이미지를 README에 삽입하기 번거로움 | 마크다운 코드 원클릭 복사 |
| 이미지 파일을 직접 관리해야 함 | Firebase Storage에 자동 업로드 및 URL 제공 |

---

## 프로젝트 개요

| 항목        | 내용                          |
| ----------- | ----------------------------- |
| 플랫폼      | Next.js 15 (App Router)       |
| 지원 환경   | 웹 브라우저                   |
| 인증        | GitHub OAuth (Firebase Auth)  |
| 버전        | 1.0.0                         |

---

## 서비스 구조

```
🧑‍💻 사용자 (브라우저)
  │  GitHub 로그인 → Firebase Auth → GitHub Access Token을 httpOnly 쿠키 저장
  │  20×20 그리드에 색 칠하기 → 완성 버튼
  ▼
🌐 Next.js API Routes
  │  /api/github/auth/login  → GitHub 토큰 httpOnly 쿠키 저장 (24시간 만료)
  │  /api/github/user        → 로그인한 사용자 정보 조회
  │  /api/github/commits     → 최근 7일 커밋 수 조회 (GitHub Search API)
  ▼
🎨 html-to-image
  │  그리드 DOM 요소 → PNG 변환
  ▼
☁️ Firebase Cloud Storage
  │  images/{userId}.png 경로에 업로드
  │  다운로드 URL 반환
  ▼
📋 마크다운 코드 생성
  │  <img src="{firebaseUrl}" width="200" height="400"/>
  └─ 클립보드에 복사 → GitHub README에 붙여넣기
```

---

## 기능 요약

- GitHub OAuth 로그인 / 로그아웃
- 최근 7일 커밋 수 헤더에 표시
- 20×20 인터랙티브 픽셀 그리드 에디터
- 색상 피커로 원하는 색 선택 후 셀 클릭으로 색칠
- 그리드 초기화 버튼
- 완성된 아트를 PNG로 변환 후 Firebase Storage 업로드
- 생성된 이미지 미리보기 모달
- README 삽입용 마크다운 코드 원클릭 복사
- 복사 완료 Lottie 애니메이션

---

## 사용 API / 서비스

### 1. GitHub OAuth — 인증

| 항목        | 내용                                                       |
| ----------- | ---------------------------------------------------------- |
| 용도        | 사용자 인증 및 GitHub API 접근 토큰 발급                   |
| 인증 방식   | Firebase Auth + GitHub Provider (OAuth 팝업)               |
| 토큰 저장   | httpOnly 쿠키 (만료: 24시간, XSS 방어)                    |
| 사용 파일   | `src/hooks/useAuth.tsx`, `app/api/github/auth/login/`      |

---

### 2. GitHub Search API — 커밋 조회

| 항목        | 내용                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| 용도        | 로그인한 사용자의 최근 7일 커밋 수 조회                                         |
| 엔드포인트  | `GET https://api.github.com/search/commits?q=author:{username}+committer-date:>{date}` |
| 인증        | `Authorization: token {github_access_token}`                                    |
| 응답 필드   | `total_count`                                                                   |
| 사용 파일   | `app/api/github/commits/route.ts`                                               |

---

### 3. Firebase — 인증 및 스토리지

| 항목        | 내용                                          |
| ----------- | --------------------------------------------- |
| 용도 (Auth) | GitHub OAuth 세션 관리                        |
| 용도 (Storage) | 생성된 픽셀 아트 PNG 파일 저장 (`images/{userId}.png`) |
| 사용 파일   | `app/lib/firebase.ts`, `src/hooks/useFile.tsx` |

---

## 기술 스택

| 분류               | 라이브러리 / 서비스                         |
| ------------------ | ------------------------------------------- |
| 프레임워크         | Next.js 15 (App Router) + React 19          |
| 언어               | TypeScript 5                                |
| 스타일링           | Tailwind CSS 4                              |
| 인증               | Firebase Auth + GitHub OAuth                |
| 파일 저장          | Firebase Cloud Storage                      |
| 색상 피커          | `react-color-palette`                       |
| 애니메이션         | `react-lottie-player`                       |
| 이미지 변환        | `html-to-image`                             |
| HTTP 클라이언트    | `axios`                                     |

---

## 실행 방법

```bash
cd cross-stitch
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 환경 변수 설정 (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> `.env.local`은 `.gitignore`에 포함되어 있습니다. 절대 커밋하지 마세요.

---

## 파일 구조

```
cross-stitch/
├── app/
│   ├── api/
│   │   └── github/
│   │       ├── auth/login/     ← GitHub 토큰 httpOnly 쿠키 저장 (POST)
│   │       ├── user/           ← 로그인 사용자 정보 조회 (GET)
│   │       └── commits/        ← 최근 7일 커밋 수 조회 (GET)
│   ├── home/
│   │   └── _components/
│   │       ├── CrossStitchEditor.tsx   ← 메인 에디터 UI (색상 피커 + 그리드)
│   │       └── modal/
│   │           └── CrossStitchResultModal.tsx  ← 결과 이미지 + 마크다운 복사
│   ├── login/
│   │   ├── page.tsx            ← 로그인 페이지
│   │   └── LoginForm.tsx       ← GitHub 로그인 버튼
│   ├── src/
│   │   ├── components/
│   │   │   ├── CrossTitch.tsx       ← 20×20 픽셀 그리드 컴포넌트
│   │   │   ├── Header.tsx           ← 커밋 수 + 로그아웃 버튼
│   │   │   ├── BackPressHandler.tsx ← 뒤로가기 방지
│   │   │   └── modal.tsx            ← 공통 모달 래퍼
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx     ← GitHub 로그인 / 로그아웃
│   │   │   └── useFile.tsx     ← Firebase Storage 업로드 / 삭제
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx    ← 인증 상태 + 커밋 수 fetch
│   │   │   └── StitchProvider.tsx  ← 그리드 상태 관리 (20×20 셀)
│   │   ├── types/
│   │   │   ├── github.ts       ← GitHub API 응답 타입
│   │   │   └── crossTitch.ts   ← 그리드 셀 타입 정의
│   │   └── utils/
│   │       ├── date.ts              ← 날짜 유틸
│   │       ├── string.ts            ← 문자열 유틸
│   │       └── uploadStitchImage.ts ← DOM → PNG → Firebase 업로드
│   ├── lib/
│   │   └── firebase.ts         ← Firebase 초기화
│   ├── layout.tsx
│   ├── page.tsx                ← / → /login 리다이렉트
│   └── globals.css
├── public/
│   ├── check.json              ← 복사 완료 Lottie 애니메이션
│   └── github.svg
└── next.config.ts
```

---

## 데이터 모델

### StitchCell (그리드 셀)

```typescript
type StitchCell = {
  color: string;      // 셀 색상 (hex 또는 oklch)
  isChecked: boolean; // 색칠 여부
};
```

### 그리드 기본값

```typescript
const CROSSTITCH_SPEC = 20;  // 20×20 그리드
const CROSSTITCH_DEFAULT_COLOR = "oklch(44.6% 0.043 257.281)";  // 기본 배경색 (다크 블루-그레이)
const CROSSTITCH_DEFAULT_SELECT_COLOR = "#000000";               // 기본 선택 색상 (검정)
const COMMIT_RANGE = 7;      // 최근 7일 커밋 조회
```

---

## 만든 사람

| 항목                  | 내용                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| 서비스 기획           | 크로스스티치 픽셀 아트 + GitHub 연동 아이디어 및 전체 방향 설정      |
| 요구사항 정의         | 그리드 크기, 인증 방식, 이미지 저장 및 공유 흐름 결정                |
| 전체 아키텍처         | App Router 기반 폴더 구조, Provider 패턴으로 전역 상태 설계          |
| GitHub OAuth 연동     | Firebase Auth + GitHub 팝업 로그인, httpOnly 쿠키 토큰 저장 구현     |
| API Routes 구현       | `/api/github/auth/login`, `/api/github/user`, `/api/github/commits`  |
| 커밋 수 조회          | GitHub Search API 연동, 최근 7일 커밋 수 fetch 로직                 |
| 픽셀 그리드 에디터    | 20×20 셀 인터랙션 (클릭 토글, 호버 애니메이션, 색상 적용) 구현      |
| 이미지 변환 및 업로드 | `html-to-image`로 DOM → PNG 변환 후 Firebase Storage 업로드         |
| 결과 모달             | 이미지 미리보기, 마크다운 코드 생성, 클립보드 복사, Lottie 애니메이션 |
| 상태 관리             | `StitchProvider`로 그리드 상태, `AuthProvider`로 인증·커밋 상태 관리 |
| 보안 처리             | httpOnly 쿠키로 XSS 방어, 토큰 24시간 만료 설정                     |
| Firebase 설정         | Firebase 프로젝트 생성 및 Auth·Storage 설정                          |
| GitHub OAuth 설정     | GitHub Developer App 등록 및 Client ID/Secret 발급                   |
