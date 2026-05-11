# SSAju 프론트엔드

사주 기반 커리어 컨설팅 플랫폼의 Next.js 14 프론트엔드

## 개요

SSAju는 사용자의 생년월일과 시간을 입력하여 다음을 제공합니다:

- **관운 분석**: H1/H2 관운 주기와 신뢰도
- **AI 커리어 컨설팅**: 8개 탭에 걸친 맞춤형 조언
- **기업 궁합 분석**: 입력한 회사와의 궁합도 점수
- **분석 결과 저장**: 로그인 후 결과 영구 저장 및 히스토리 조회

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **언어**: TypeScript (strict mode)
- **상태 관리**: Zustand (5개 스토어)
- **스타일링**: Tailwind CSS
- **입력 검증**: Zod
- **테스트**: Jest + React Testing Library + MSW
- **애니메이션**: Framer Motion
- **차트**: Recharts
- **토스트**: Sonner

## 설치 및 실행

### 전제 조건

- Node.js 18.17+
- npm 10+

### 설치

```bash
npm install
```

### 환경 설정

`.env.local` 파일 생성 (`.env.example` 참고):

```bash
cp .env.example .env.local
```

개발 환경 설정:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드

```bash
npm run build
npm run start
```

## npm 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (핫 리로드) |
| `npm run build` | 프로덕션 빌드 (TypeScript + ESLint 검사 포함) |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 실행 |
| `npm run format` | Prettier 코드 포맷팅 |
| `npm test` | Jest 테스트 실행 (커버리지 포함) |
| `npm run test:watch` | Jest 감시 모드 실행 |

## 아키텍처

### 4계층 엄격한 패턴

```
┌─ 페이지 (app/**/page.tsx)
│  ├─ 커스텀 훅 1개만 호출
│  ├─ 컴포넌트 조립
│  └─ 50-100줄 max
│
├─ 컴포넌트 (components/)
│  ├─ UI 렌더링만
│  └─ Props 드릴링
│
├─ 훅 (hooks/)
│  ├─ 모든 상태 관리
│  ├─ 비즈니스 로직
│  └─ API 오케스트레이션
│
└─ API (lib/api/)
   ├─ apiFetch<T>() 래퍼
   └─ 모듈 함수 (fetch만)
```

### 디렉토리 구조

```
src/
├── app/                 # Next.js App Router
├── components/          # React 컴포넌트
├── hooks/              # Custom hooks
├── stores/             # Zustand stores (5개)
├── lib/
│   ├── api/           # API 클라이언트 래퍼
│   └── config/        # 설정 (env 검증)
├── types/             # TypeScript 타입
└── __tests__/         # Jest 테스트
```

## 주요 기능

### 1. 인증 (Phase 3)

- Kakao/Google OAuth
- HttpOnly 쿠키 기반 토큰 관리
- 자동 로그인 복원

### 2. 분석 기능 (Phase 4-7)

- 관운 분석 (3-5초)
- AI 컨설팅 (8개 탭, 15-20초)
- 기업 궁합 (8초)
- 만족도 피드백

### 3. 마이페이지 (Phase 8)

- 분석 결과 무한 스크롤
- 3개 탭으로 분류 (관운, 컨설팅, 궁합)
- 기록 삭제 기능

## 성능 목표

- **탭 전환**: <200ms (Zustand 캐싱)
- **분석 결과 로드**: <5초 (CareerTiming)
- **AI 컨설팅**: <20초 (FastAPI 호출)
- **마이페이지 스크롤**: threshold 0.5 (50% 노출 감지)
- **빌드 시간**: <30초 (TypeScript + ESLint)
- **테스트 커버리지**: 80%

## 커밋 규칙

Conventional Commits 사용 (한국어):

```
feat: 관운 분석 페이지 추가

[Build Passed]
```

- Prefix: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `ui`
- WIP 커밋: `[WIP]` 태그 (빌드 실패)
- 모든 커밋 전에 `npm run build` 성공 필수

## 개발 가이드

### TypeScript 규칙

- `strict: true` 필수
- `any` 타입 금지
- 함수 반환 타입 명시 권장

### 리액트 규칙

- Phase 1: 모든 페이지에 `'use client'` 지시문
- Server Components: Phase 2 이후 도입
- Props 스프레딩 금지 (명시적 드릴링)

### 스타일링

- Tailwind CSS only (CSS Modules ✗, styled-components ✗)
- 컴포넌트 라이브러리 금지 (shadcn/ui ✗, MUI ✗)
- 커스텀 컴포넌트만 사용

### 상태 관리

- Zustand만 사용 (Redux ✗, Recoil ✗)
- Props 드릴링 권장 (context ✗)
- 전역 상태: 5개 스토어만

### 폼 처리

- useState only (react-hook-form ✗)
- HTML5 입력 타입 활용
- Zod 검증

## 테스트

### 테스트 실행

```bash
npm test                # 한 번 실행 (커버리지 포함)
npm run test:watch     # 감시 모드
```

### 커버리지 목표

- **Lines**: 80%
- **Branches**: 50%
- **Functions**: 50%
- **Statements**: 50%

### 테스트 작성

- Jest + React Testing Library
- MSW로 API 모킹
- 사용자 행동 기반 테스트

## 문제 해결

### 빌드 실패

```bash
# TypeScript 에러 확인
npm run build

# ESLint 에러 수정
npm run lint -- --fix
```

### 개발 서버 포트 충돌

```bash
# 다른 포트 사용
npm run dev -- -p 3001
```

### 환경 변수 오류

```bash
# .env.local 확인
cat .env.local

# 환경 변수 검증
node -e "console.log(process.env.NEXT_PUBLIC_API_BASE_URL)"
```

## 라이선스

© 2026 SSAju. 모든 권리 보유.

## 문의

- GitHub Issues: 버그 보고 및 기능 요청
- Email: support@ssaju.com
