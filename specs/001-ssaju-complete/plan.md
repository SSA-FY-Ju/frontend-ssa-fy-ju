# Implementation Plan: SSAju 프론트엔드 완성 (001-ssaju-complete)

**Branch**: `001-ssaju-complete` | **Date**: 2026-05-14 | **Spec**: [specs/001-ssaju-complete/spec.md](spec.md)  
**Status**: Phase 1 (Design — Swiper.js 마이그레이션 반영) | **Next**: Phase 3 (Implementation)  
**Input**: 6 user stories (P1: 3, P2: 3), 65+ functional requirements, 135 implementation tasks

---

## Clarifications

### Session 2026-05-11 (Clarification Round 2)

- Q1: HttpOnly Cookie + sessionStorage 이중 저장 모델 → A: **HttpOnly + Authorization 헤더 선택**
  - HttpOnly Cookie: 백엔드가 설정, CSRF 보호, 모든 요청 자동 포함
  - sessionStorage: 제거 (XSS 위험)
  - Authorization 헤더: 프론트엔드가 선택적으로 읽음 (로깅/디버깅용, 인증에는 사용 안 함)
  - **구현**: apiFetch에서 HttpOnly 쿠키에만 의존; 헤더는 logging 용도 선택사항

- Q2: 회사명 자동완성 데이터 소스 → A: **백엔드 `/api/company/autocomplete`**
  - 새 엔드포인트: `POST /api/company/autocomplete`
  - 요청: `{ query: string }`
  - 응답: `{ suggestions: string[] }`
  - 타임아웃: 5s (입력 시마다 호출)

### Session 2026-05-13 (UI 변경)

- Q6: AI 컨설팅 8개 섹션 표시 방식 → A: **fullpage.js 기반 전체화면 섹션 전환**
  - 탭 기반 UI → 스크롤 + fullpage.js 섹션 방식으로 전환 (spec US4 2026-05-13 변경 반영)
  - 각 분석 섹션이 화면 전체(100vh)를 차지하는 독립 페이지로 표시
  - 스크롤 시 fullpage.js가 자동으로 다음/이전 섹션으로 전환 (스냅 스크롤)
  - 세로 네비게이터(오른쪽 고정): 현재 섹션 표시 + 클릭 이동 지원
  - `fullpage.js` 라이브러리 추가 (Constitution IV 예외 — 이유: 스크롤 스냅 구현 직접 작성 시 500+ 줄 + 브라우저 호환 이슈)

### Session 2026-05-14 (스크롤 라이브러리 교체)

- Q7: AI 컨설팅 8섹션 스크롤 라이브러리 교체 → A: **Swiper.js v12 수직 슬라이드 방식**
  - fullpage.js: GPL v3 유료 라이선스 + CSS scroll-snap 수동 wheel 처리 부자연스러운 UX 문제
  - `swiper@12` 도입: MIT 라이선스, React 공식 지원, 내장 Mousewheel 모듈로 자연스러운 UX
  - 설정: `direction: "vertical"`, `speed: 700`, `mousewheel.thresholdDelta: 50`, `keyboard: true`
  - 네비게이터: `swiperRef.current?.slideTo(index)` 호출 (기존 `moveTo()` 대체)
  - `onSlideChange` 콜백 → `currentSectionIndex` 자동 동기화 (IntersectionObserver 제거)
  - Constitution IV 예외 유지 — 사용자 명시 요청, `[Exception: Principle IV]` PR 명시 필수

---

## Executive Summary

SSAju 프론트엔드는 **사주 기반 커리어 컨설팅 플랫폼**의 완성된 구현입니다. 사용자는 생년월일/시간을 입력하여 관운 분석(H1/H2), AI 커리어 컨설팅(8개 Swiper.js 섹션), 기업 궁합 분석을 받고, 로그인하여 결과를 영구 저장할 수 있습니다.

**핵심 가치**:
- 소셜 로그인(카카오/구글) + 분석 결과 영구 저장
- **AI 기반 8섹션 컨설팅 (Swiper.js 수직 슬라이드 — 자연스러운 마우스/트랙패드 스크롤)**
- 1.5초 고지 문구 오버레이 애니메이션
- 마이페이지 무한 스크롤 (threshold 0.5)
- "별이 빛나는 밤" 테마 (night-900/800/700, star-500/400/300)

**구현 규모**: ~40개 컴포넌트, ~15개 훅, 5개 Zustand 스토어, 137개 구현 작업, 80% 테스트 커버리지

---

## Constitution Check

*GATE: Swiper.js 라이브러리 사용에 대한 Constitution 준수 여부 검토*

| 원칙 | 상태 | 비고 |
|------|------|------|
| **I (파일 크기 100줄)** | ✅ PASS | FullPageConsultation은 섹션별 컴포넌트로 분리 |
| **II (한국어 문서화)** | ✅ PASS | 모든 훅/컴포넌트 주석 한국어 |
| **III (4계층 아키텍처)** | ✅ PASS | Page → FullPageConsultation → useConsultation → API |
| **IV (외부 UI 라이브러리 제한)** | ⚠️ EXCEPTION | Swiper.js 사용 — 마우스/트랙패드 wheel 정규화 직접 구현 복잡. 사용자 명시 요청. MIT 라이선스. `[Exception: Principle IV]` PR에 기록 필수 |
| **V (타입 안전성)** | ✅ PASS | Swiper.js TypeScript 타입 내장 (`import type { Swiper as SwiperInstance }`) |
| **VI (빌드/테스트 관문)** | ✅ PASS | npm install 후 Jest mock + build 통과 확인 |
| **VIII (조기 최적화 금지)** | ✅ PASS | useMemo/useCallback 사용 안 함 |

**Exception 처리**: Constitution IV 위반 사항은 PR에 `[Exception: Principle IV]`로 명시, EXCEPTIONS.md에 기록.

---

## 1. 기술 스택 & 의존성

### 1.1 언어 & 런타임

| 컴포넌트 | 버전 | 설명 |
|-----------|---------|-------|
| **Node.js** | 18.17+ LTS | Runtime environment |
| **TypeScript** | 5.3+ | Strict mode enabled, no `any` types |
| **JavaScript (ES2022)** | Latest | Target for all bundles |
| **Npm** | 10+ | Package manager |

### 1.2 프론트엔드 프레임워크 & 핵심 라이브러리

| 라이브러리 | 버전 | 목적 | 설정 |
|---------|---------|---------|--------|
| **React** | 18.2+ | UI rendering | App Router, Server Components later |
| **Next.js** | 14.0+ | Framework (App Router) | API routes, middleware, deployment |
| **React DOM** | 18.2+ | DOM rendering | `"use client"` for all pages (Phase 1) |
| **TypeScript React** | 5.3+ | Type-safe JSX | `strict: true` in tsconfig |
| **Swiper.js** | 12.0+ | 8섹션 수직 슬라이드 전환 | `swiper/react`, Mousewheel/Keyboard/A11y 모듈. MIT 라이선스. Constitution IV 예외 — 사용자 명시 요청, wheel 정규화 직접 구현 복잡도 과다 |

### 1.3 상태 관리 & 데이터 흐름

| 라이브러리 | 버전 | 목적 | 아키텍처 |
|---------|---------|---------|--------------|
| **Zustand** | 4.4+ | Global state | 5 stores: authStore, sessionStore, analysisStore, consultationStore, errorStore |
| **Zustand Persist** | 4.4+ | sessionStorage persist | sessionStore의 sajuResultId, lastAnalysisType만 sessionStorage에 persist (FR-022: localStorage 미사용) |

**Store Details**:
```typescript
// authStore: 사용자 인증 상태
// 인증 토큰은 HttpOnly Cookie로만 관리 (Q1 결정: XSS 방지, 클라이언트 미저장)
{ isLoggedIn, user, provider, loginError }

// sessionStore: 현재 세션 분석 — sajuResultId/lastAnalysisType은 sessionStorage persist
{ sajuResultId, lastAnalysisType, currentAnalysisData, isAnalyzing }

// analysisStore: 비로그인 사용자 분석 결과 (메모리만, 새로고침 시 초기화)
{ careerTiming, compatibility }

// consultationStore: 8섹션 전체 데이터 메모리 캐싱 전용 (persist 없음, FR-022 준수)
// Swiper.js activeIndex와 동기화 (0-based index, onSlideChange 콜백으로 업데이트)
{ consultation: ConsultationData | null, lastFetchedId, currentSectionIndex }

// errorStore: 전역 에러 + 토스트
{ globalError, toastQueue: Toast[] }
```

### 1.4 스타일링 & 디자인 시스템

| 도구 | 버전 | 설정 |
|------|---------|---------------|
| **Tailwind CSS** | 3.3+ | Utility-first CSS only (no CSS Modules, no styled-components) |
| **Custom Colors** | - | night-900: #0a0e27, night-800: #1a1f3a, night-700: #2a3050, star-500: #ffd700, star-400: #ffed4e, star-300: #fff8a8 |
| **Typography** | Pretendard Sans (body), Garamond Serif (headings) | Font sizes: desktop 16-32px, tablet 14-20px |
| **Responsive Breakpoints** | sm (640), md (768), lg (1024), xl (1280) | Mobile-first approach |

**tailwind.config.ts** (Custom Configuration):
```typescript
theme: {
  extend: {
    colors: {
      night: { 900: '#0a0e27', 800: '#1a1f3a', 700: '#2a3050' },
      star: { 500: '#ffd700', 400: '#ffed4e', 300: '#fff8a8' }
    },
    fontFamily: {
      body: ['Pretendard', 'sans-serif'],
      heading: ['Garamond', 'serif']
    }
  }
}
```

### 1.5 검증 & 스키마 관리

| Library | Version | Usage |
|---------|---------|-------|
| **Zod** | 3.22+ | Runtime validation of all API requests/responses |
| **TypeScript** | 5.3+ | Compile-time type safety |

**Zod Schema Pattern**:
```typescript
// All API types defined in lib/api/schemas.ts
const CareerTimingRequestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().optional().default('12:00'),
  solarType: z.enum(['SOLAR', 'LUNAR'])
});
```

### 1.6 폼 처리 & 사용자 입력

| 접근 방식 | 버전 | 설명 |
|----------|---------|-------|
| **React useState** | 18.2+ | Forms only (no react-hook-form, Phase 1 constraint) |
| **React DOM Events** | 18.2+ | onChange, onSubmit, etc. |
| **HTML5 Input Types** | Latest | date, time, text, email, select |

### 1.7 API 클라이언트 & HTTP

| 컴포넌트 | 버전 | 상세 |
|-----------|---------|---------|
| **Native Fetch API** | ES2020 | Wrapped in `lib/api/client.ts` with `apiFetch<T>()` |
| **Custom Wrapper** | - | Error handling, auth token injection, retry policy |
| **Environment Variable** | - | `NEXT_PUBLIC_API_BASE_URL` (e.g., `http://localhost:8080`) |

**apiFetch Signature**:
```typescript
async function apiFetch<T>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
    body?: Record<string, unknown>;
    timeout?: number;  // Default: 10s (Consultation: 20s, Compatibility: 8s)
    retry?: { maxAttempts?: 3; backoff?: 'exponential' };
  }
): Promise<T>
```

### 1.8 테스트 프레임워크

| 도구 | 버전 | 목적 |
|------|---------|---------|
| **Jest** | 29+ | Unit & integration tests |
| **React Testing Library** | Latest | Component testing, user-centric queries |
| **MSW (Mock Service Worker)** | 1.3+ | API mocking (no backend needed) |
| **@testing-library/jest-dom** | Latest | Enhanced Jest matchers |
| **Playwright** | Latest | E2E testing (animation timing, integration) |

**Coverage Goal**: 80% (src/ excluding node_modules, dist/)

**Test Structure**:
```
src/
├── __tests__/
│   ├── unit/           # Component, Hook, Function tests
│   ├── integration/    # Full API flow tests
│   └── fixtures/       # Test data, mocks
├── lib/mocks/
│   ├── handlers.ts     # MSW request handlers
│   └── server.ts       # MSW server setup
└── jest.config.ts      # Jest configuration
```

### 1.9 빌드 & 배포

| 도구 | 버전 | 목적 |
|------|---------|---------|
| **npm install** | - | 모든 dependencies 및 devDependencies 설치 (필수 선행 작업) |
| **Next.js Build** | 14.0+ | `npm run build` (TypeScript + ESLint validation) |
| **ESLint** | Latest | Code quality & consistency |
| **npm scripts** | - | `dev`, `build`, `start`, `lint`, `test` |

**개발 환경 초기 설정**:
```bash
npm install                    # 의존성 설치 (package.json 기반)
npm run dev                    # 개발 서버 시작 (localhost:3000)
```

**Build Constraints**:
- `npm install` must complete before any npm scripts
- `npm run build` must pass before commit
- `npm run lint` must have no violations
- TypeScript strict mode: no errors
- All 80% test coverage must pass

### 1.10 백엔드 통합

| 엔드포인트 | 메서드 | 타임아웃 | 목적 |
|----------|--------|---------|---------|
| `/api/career/timing` | POST | 10s | 관운 분석 |
| `/api/career/consultation` | POST | 20s | AI 컨설팅 (OpenAI 호출) |
| `/api/company/autocomplete` | POST | 5s | 회사명 자동완성 (Q2) |
| `/api/company/compatibility` | POST | 8s | 기업 궁합 |
| `/api/analysis/{type}/save` | POST | 10s | 분석 결과 저장 |
| `/api/analysis/records` | POST | 10s | 마이페이지 무한 스크롤 |
| `/api/analysis/{recordId}` | POST | 5s | 상세 조회 |
| `/api/analysis/{recordId}` | DELETE | 10s | 기록 삭제 |
| `/api/feedback/satisfaction` | POST | 5s | 피드백 제출 |
| `/api/auth/check` | GET | 5s | 토큰 유효성 검증 (앱 초기화 시 자동 호출) |
| `/api/auth/callback` | GET | 10s | OAuth 콜백 |
| `/api/auth/logout` | POST | 5s | 로그아웃 |

**Response Wrapper** (all endpoints):
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; requestId: string } | null;
  timestamp: number;  // Unix ms
}
```

---

## 2. 아키텍처: 4계층 엄격한 패턴

```
┌─────────────────────────────────────────────────────────┐
│  페이지 레이어 (app/**/page.tsx)                        │
│  ├─ "use client" 지시문                                 │
│  ├─ 커스텀 훅 1개만 호출                                 │
│  ├─ 컴포넌트 조립                                        │
│  └─ 최대 50-100줄                                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  컴포넌트 레이어 (components/)                          │
│  ├─ UI 렌더링만 (JSX)                                   │
│  ├─ 사용자 상호작용 핸들러 (onClick, onChange)          │
│  ├─ Props 드릴링 (prop 스프레딩 없음)                   │
│  └─ 허용: props, children, 콜백                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  훅 레이어 (hooks/)                                     │
│  ├─ 모든 상태 관리 (useState, Zustand)                  │
│  ├─ 비즈니스 로직                                        │
│  ├─ API 오케스트레이션 (apiFetch 호출)                  │
│  └─ 반환: { data, loading, error, actions }             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  API 레이어 (lib/api/)                                  │
│  ├─ apiFetch<T>() 래퍼 (중앙)                           │
│  ├─ 모듈 함수: fetchCareerTiming 등                     │
│  ├─ Fetch 호출만                                         │
│  ├─ 실패 시 에러 발생                                    │
│  └─ 타입이 지정된 데이터 반환 (Zod 검증)               │
└─────────────────────────────────────────────────────────┘
```

**주요 파일**:
```
src/
├── app/
│   ├── page.tsx                          # Home page
│   ├── career-timing/
│   │   └── page.tsx                      # Career timing form + result
│   ├── consultation/
│   │   └── page.tsx                      # 8섹션 Swiper.js 수직 슬라이드
│   ├── compatibility/
│   │   └── page.tsx                      # Company compatibility
│   ├── my-page/page.tsx                  # My page + infinite scroll
│   └── layout.tsx                        # Root layout (header, footer)
│
├── components/
│   ├── LoginButton.tsx                   # OAuth buttons
│   ├── ProfileMenu.tsx                   # Logged-in user menu
│   ├── TimingForm.tsx                    # Career timing input
│   ├── DisclaimerOverlay.tsx             # 1.5s + 500ms animation
│   ├── CareerTimingResult.tsx            # H1/H2 + confidence + save
│   ├── consultation/
│   │   ├── FullPageConsultation.tsx      # Swiper.js 수직 슬라이드 컴포넌트 (8섹션)
│   │   ├── SectionNavigator.tsx          # 세로 네비게이터 (오른쪽 고정)
│   │   ├── Section1Industries.tsx        # 섹션 1: 추천산업
│   │   ├── Section2InterviewTips.tsx     # 섹션 2: 면접팁
│   │   ├── Section3Strengths.tsx         # 섹션 3: 강점
│   │   ├── Section4SajuProfile.tsx       # 섹션 4: 사주프로필
│   │   ├── Section5Wealth.tsx            # 섹션 5: 부의운
│   │   ├── Section6CareerRoadmap.tsx     # 섹션 6: 경력로드맵
│   │   ├── Section7Branding.tsx          # 섹션 7: 브랜딩
│   │   └── Section8MonthlyFortune.tsx    # 섹션 8: 월별운세 (캘린더)
│   ├── CompanyForm.tsx                   # Company input + autocomplete
│   ├── CompatibilityResult.tsx           # Score + job matching + calendar
│   ├── AnalysisRecordCard.tsx            # My-page list item
│   ├── MyPageTabs.tsx                    # 3-tab my-page
│   ├── LoadingSpinner.tsx                # Loading indicator
│   ├── ErrorMessage.tsx                  # Error + retry
│   ├── FeedbackModal.tsx                 # Satisfaction + comment
│   └── shared/
│       ├── Header.tsx                    # Navigation + login
│       ├── Footer.tsx                    # Footer links
│       └── Toast.tsx                     # Sonner toast
│
├── hooks/
│   ├── useCareerTiming.ts                # { data, loading, error, submit }
│   ├── useConsultation.ts                # 섹션 전환 + 캐싱 (Swiper.js onSlideChange 연동)
│   ├── useCompatibility.ts               # Company analysis
│   ├── useMyPage.ts                      # My-page + infinite scroll
│   ├── usePageExitGuard.ts               # beforeunload + beforePopState
│   ├── useDisclaimerTimer.ts             # 1.5s + 500ms animation
│   ├── useAuthStore.ts                   # Auth state (Zustand)
│   ├── useSessionStore.ts                # Session state (Zustand)
│   ├── useAnalysisStore.ts               # Analysis results (Zustand)
│   ├── useConsultationStore.ts           # Consultation cache (Zustand)
│   └── useErrorStore.ts                  # Global errors (Zustand)
│
├── lib/
│   ├── api/
│   │   ├── client.ts                     # apiFetch<T>() wrapper
│   │   ├── career.ts                     # fetchCareerTiming, fetchConsultation
│   │   ├── company.ts                    # fetchCompatibility
│   │   ├── mypage.ts                     # fetchAnalysisHistory 등
│   │   ├── feedback.ts                   # submitFeedback
│   │   ├── auth.ts                       # OAuth callback
│   │   └── schemas.ts                    # All Zod schemas
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── sessionStore.ts               # sajuResultId sessionStorage persist
│   │   ├── analysisStore.ts              # 메모리 전용
│   │   ├── consultationStore.ts          # 메모리 전용, persist 없음
│   │   └── errorStore.ts
│
├── services/
│   └── utils/
│       ├── validation.ts
│       ├── formatters.ts
│       └── constants.ts
│
├── types/
│   ├── api.ts
│   ├── domain.ts
│   └── component.ts
│
└── __tests__/
    ├── unit/
    ├── integration/
    └── fixtures/
```

---

## 3. 데이터 모델 & 상태 흐름

### 3.1 핵심 엔티티

```
User (로그인/비로그인)
  ├─ authStore: { isLoggedIn, user, provider, loginError }
  ├─ sessionStore: { sajuResultId, currentAnalysisData }
  └─ Analysis (1...N)
      ├─ CareerTimingAnalysis { sajuResultId, favoredPeriod, confidenceScore }
      ├─ ConsultationAnalysis { sajuResultId, sections[8], currentSectionIndex }
      └─ CompatibilityAnalysis { sajuResultId, companyName, compatibilityScore }
```

### 3.2 사용자 여정 데이터 흐름

#### 여정 1: 비로그인 분석 → 로그인 → 자동 저장

```
1. User fills TimingForm
   └─ State: useState({ birthDate, birthTime })
   
2. Click "분석하기"
   └─ Hook: useCareerTiming().submit(formData)
   └─ API: POST /api/career/timing
   └─ sessionStore.setSajuResultId(id)
   
3. DisclaimerOverlay shows 1.5s
   └─ useDisclaimerTimer() setTimeout 1500ms
   └─ CSS transition opacity 500ms ease-in-out
   
4. CareerTimingResult displays
   └─ showLoginNudgeCard() if !isLoggedIn
   
5. User clicks "로그인하기"
   └─ OAuth popup (kakao/google)
   └─ authStore.setLogin(user)
   └─ Auto-save analysis to backend
   └─ Sonner toast: "분석 결과가 저장되었습니다"
```

#### 여정 2: 컨설팅 8섹션 Swiper.js 수직 슬라이드

```
1. User on consultation page (/consultation)
   └─ Hook: useConsultation(sajuResultId)
   └─ consultationStore: { consultation, lastFetchedId, currentSectionIndex }

2. 첫 진입 또는 새 분석 시
   └─ lastFetchedId !== sajuResultId → API 호출
   └─ POST /api/career/consultation → 8개 섹션 데이터 전체 수신
   └─ consultationStore.setConsultation(data, sajuResultId)

3. 데이터 로드 완료 → Swiper.js 렌더링
   └─ FullPageConsultation 컴포넌트: <Swiper direction="vertical"> 래퍼
   └─ 8개 SwiperSlide가 각각 100vh로 렌더링
   └─ 초기 섹션: Slide 0 (추천산업)

4. 사용자 마우스 휠 / 트랙패드 스와이프
   └─ Swiper Mousewheel 모듈: 자동 섹션 전환 처리
   └─ thresholdDelta: 50 → 트랙패드 관성 스크롤 무시
   └─ 전환 시간: speed=700ms / prefers-reduced-motion → speed=0
   └─ onSlideChange → consultationStore.setCurrentSectionIndex(activeIndex)

5. SectionNavigator (오른쪽 고정, 🌕 달 인디케이터)
   └─ 현재 섹션 강조 표시 (currentSectionIndex 기반)
   └─ 클릭 시 swiperRef.current?.slideTo(index) 호출
   └─ 300ms 이내 해당 섹션으로 이동

6. 마지막 섹션 (월별운세) 최초 도달
   └─ 비로그인 사용자: SignupPromptModal 표시 (회원가입 유도)
   └─ 피드백 버튼 → FeedbackModal 열림

7. 페이지 새로고침
   └─ Zustand 메모리 초기화 → consultation=null
   └─ 재진입 시 API 재호출 (persist 없음)

8. 접근성
   └─ prefers-reduced-motion → speed: 0 (즉시 전환)
   └─ keyboard: Arrow↑↓, PageUp/Down 지원 (Keyboard 모듈)
   └─ a11y: 스크린리더 지원 (A11y 모듈)
```

#### 여정 3: 마이페이지 무한 스크롤 (threshold 0.5)

```
1. User navigates to /my-page
   └─ Hook: useMyPage('CAREER')
   └─ Initial load: offset=0, limit=20
   └─ API: POST /api/analysis/records?offset=0&limit=20
   
2. Display first 20 cards
   └─ Components: AnalysisRecordCard (×20)
   
3. User scrolls down
   └─ Intersection Observer: observe(loadMoreTrigger)
   └─ Threshold 0.5: fire when 50% visible
   
4. Load more trigger fires
   └─ onLoadMore(): fetch(offset=20, limit=20)
   └─ Append 20 more records to list
   
5. Repeat until hasMore=false
```

### 3.3 저장소 전략

| 데이터 | 저장소 | 지속시간 | 보안 |
|------|---------|----------|------|
| **인증 토큰** | HttpOnly Cookie | Until logout | ✅ XSS 방지 |
| **sajuResultId** | sessionStorage | Until page close | ⚠️ 비민감정보 |
| **Consultation data** | consultationStore (memory) | Until page refresh | - |
| **currentSectionIndex** | consultationStore (memory) | Current session | - |
| **분석 기록** | 백엔드 DB | 영구 (로그인 시) | ✅ 서버 관리 |

---

## 4. 컴포넌트 계층 & Props 흐름

### 4.1 컨설팅 페이지 컴포넌트 (Swiper.js)

```
app/consultation/page.tsx
├─ useConsultation(sajuResultId) hook
└─ Components:
    ├─ Header (ProfileMenu or LoginButton)
    ├─ LoadingSpinner (visible during API call)
    ├─ ErrorMessage (visible on error)
    └─ FullPageConsultation (visible when data loaded)
        ├─ <Swiper direction="vertical"> 래퍼 (Mousewheel/Keyboard/A11y 모듈)
        ├─ SectionNavigator (오른쪽 고정, 🌕 달 인디케이터, currentSection 표시)
        ├─ SignupPromptModal (마지막 섹션 도달 시 비로그인 사용자에게 표시)
        └─ 8 SwiperSlide Components:
            ├─ IndustriesTab      (100vh, slide 0 — 추천산업)
            ├─ InterviewTipsTab   (100vh, slide 1 — 면접팁)
            ├─ StrengthsTab       (100vh, slide 2 — 강점)
            ├─ SajuProfileTab     (100vh, slide 3 — 사주프로필)
            ├─ WealthStyleTab     (100vh, slide 4 — 부의운)
            ├─ CareerRoadmapTab   (100vh, slide 5 — 경력로드맵)
            ├─ BrandingTab        (100vh, slide 6 — 브랜딩)
            └─ MonthlyForecastTab (100vh, slide 7 — 월별운세, FeedbackButton 포함)
```

### 4.2 Swiper.js 설정

```typescript
// components/consultation/FullPageConsultation.tsx
// [Exception: Principle IV] — Swiper.js 사용. 이유: wheel 정규화 직접 구현 복잡도 과다, 사용자 명시 요청
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';

const swiperRef = useRef<SwiperInstance | null>(null);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<Swiper
  direction="vertical"
  slidesPerView={1}
  spaceBetween={0}
  speed={prefersReducedMotion ? 0 : 700}     // 접근성: 즉시 전환
  mousewheel={{ sensitivity: 1, thresholdDelta: 50 }}  // 트랙패드 관성 무시
  keyboard={{ enabled: true }}               // Arrow↑↓, PageUp/Down
  a11y={{ enabled: true }}                   // 스크린리더 지원
  modules={[Mousewheel, Keyboard, A11y]}
  onSwiper={(s) => { swiperRef.current = s; }}
  onSlideChange={(s) => onSectionChange(s.activeIndex)}  // consultationStore 동기화
  className="h-screen"
/>
```

### 4.3 Props 패턴

```typescript
// FullPageConsultation Props
interface FullPageConsultationProps {
  data: ConsultationData;
  currentSectionIndex: number;
  onSectionChange: (index: number) => void;
  onFeedback?: () => void;
}

// SectionNavigator Props
interface SectionNavigatorProps {
  sections: string[];           // 섹션 이름 배열 (8개)
  currentIndex: number;
  onNavigate: (index: number) => void;  // swiperRef.slideTo() 호출
}
```

---

## 5. API 클라이언트 & 에러 처리

### 5.1 재시도 정책이 있는 apiFetch 래퍼

```typescript
// lib/api/client.ts
// Q1 결정: HttpOnly 쿠키 기반, sessionStorage 제거

async function apiFetch<T>(
  path: string,
  options?: FetchOptions
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options?.timeout ?? 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`,
        {
          method: options?.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
          credentials: 'include'  // HttpOnly 쿠키 자동 전송
        }
      );
      
      clearTimeout(timeoutId);
      const json = await response.json();
      if (!response.ok) throw new ApiError(json.error.code, json.error.message);
      return responseSchema.parse(json.data) as T;
      
    } catch (error) {
      const isRetryable = error instanceof TypeError || (error as any).name === 'AbortError';
      if (!isRetryable || attempt === 3) { clearTimeout(timeoutId); throw error; }
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}
```

---

## 6. Zustand 스토어 아키텍처

### 6.1 consultationStore (섹션 캐싱 — Swiper.js 연동)

**구현 기준**: API 응답 전체를 메모리에만 캐싱. localStorage/sessionStorage persist 없음.

```typescript
interface ConsultationStore {
  // State — 8섹션 전체 데이터 메모리 캐싱
  consultation: ConsultationData | null;
  lastFetchedId: string | null;
  currentSectionIndex: number;     // Swiper.js onSlideChange 콜백으로 동기화
  isLoading: boolean;
  error: string | null;

  // Actions
  setConsultation: (data: ConsultationData, sajuResultId: string) => void;
  clearData: () => void;
  setCurrentSectionIndex: (index: number) => void;  // 0-based (Swiper activeIndex)
  isValid: (sajuResultId: string) => boolean;
  reset: () => void;
}
```

### 6.2 authStore (인증)

```typescript
interface AuthStore {
  isLoggedIn: boolean;
  user: User | null;
  provider: 'KAKAO' | 'GOOGLE' | null;
  loginError: string | null;
  setLogin: (user: User) => void;   // token은 HttpOnly 쿠키에만 저장
  setLogout: () => void;
  checkToken: () => Promise<boolean>;
}
```

### 6.3 sessionStore (현재 세션)

```typescript
interface SessionStore {
  sajuResultId: string | null;
  lastAnalysisType: 'CAREER' | 'CONSULTATION' | 'COMPANY' | null;
  currentAnalysisData: CareerTimingData | ConsultationData | CompatibilityData | null;
  isAnalyzing: boolean;
  setSajuResultId: (id: string) => void;
  setCurrentAnalysis: (data: any) => void;
  clearSession: () => void;
}
```

---

## 7. 애니메이션 & 타이밍 사양

### 7.1 고지 문구 오버레이 (FR-048)

```
Timeline:
  0ms    ─ Display overlay (fade-in starts)
  ~50ms  ─ Fully opaque
  1500ms ─ Start fade-out (1.5s exact)
  2000ms ─ Overlay fully transparent, removed from DOM
  2000ms ─ Loading spinner fully visible

CSS:
  .disclaimer-overlay { transition: opacity 500ms ease-in-out; }
```

### 7.2 Swiper.js 섹션 전환 (US4 — Q7 결정)

```
기본 전환:
  speed: 700ms
  direction: 'vertical'
  방향: 수직 슬라이드 (마우스 휠, 트랙패드, 터치 스와이프, Arrow/Page 키)

Mousewheel 설정:
  - sensitivity: 1 (마우스 1노치 = 1섹션)
  - thresholdDelta: 50 (트랙패드 관성 스크롤 무시)

SectionNavigator 직접 이동:
  - swiperRef.current?.slideTo(index)  // 0-based API
  - 300ms 이내 해당 섹션 도달

접근성 (prefers-reduced-motion):
  - speed: 0 (즉시 전환, 애니메이션 없음)
  - Swiper 초기화 시 matchMedia 감지 후 speed prop에 전달

모바일:
  - Swiper 기본 터치 스와이프 지원 (별도 설정 불필요)
  - 각 SwiperSlide: h-screen overflow-y-auto

섹션 내 오버플로우:
  - SwiperSlide overflow-y: auto → 섹션 내부 스크롤 가능
  - Swiper는 슬라이드 간 전환만 담당
```

### 7.3 섹션 진입 페이드인 (각 섹션 콘텐츠)

```
각 섹션 컴포넌트의 콘텐츠 등장 애니메이션:
  - Swiper onSlideChangeTransitionEnd 이벤트 활용 가능
  - 섹션 진입 시: opacity 0 → 1 (350ms ease-out)
  - transform: translateY(20px) → translateY(0) (350ms ease-out)
  - prefers-reduced-motion: 애니메이션 없음 (즉시 표시)
```

---

## 8. 사용자 스토리 구현 전략

### 8.1 US1: 인증 & 사용자 관리

**컴포넌트**: LoginButton, ProfileMenu  
**훅**: useAuthStore  
**API**: GET /api/auth/callback, POST /api/auth/logout  
**성공 기준**: OAuth 팝업 → HttpOnly 쿠키 → 헤더 변경 → 분석 결과 자동 저장

---

### 8.2 US2: 마이페이지 & 히스토리

**컴포넌트**: MyPageTabs, AnalysisRecordCard, DeleteConfirmModal  
**훅**: useMyPage (pagination + infinite scroll, threshold 0.5)  
**API**: POST /api/analysis/records, DELETE /api/analysis/{recordId}  
**성공 기준**: 3 탭, 무한 스크롤, 0.1s 즉시 재현, 삭제 확인

---

### 8.3 US3: 관운 분석

**컴포넌트**: TimingForm, DisclaimerOverlay, CareerTimingResult  
**훅**: useCareerTiming, useDisclaimerTimer  
**API**: POST /api/career/timing (10s timeout)  
**성공 기준**: 1.5s 자동 고지 문구 → H1/H2 + 신뢰도 점수 → 로그인 자동 저장

---

### 8.4 US4: AI 컨설팅 (8섹션 Swiper.js — Q7)

**컴포넌트**:
- `FullPageConsultation` — Swiper.js 수직 슬라이드, 8섹션 조립, SignupPromptModal 포함
- `SectionNavigator` — 오른쪽 고정, 🌕 달 인디케이터, 현재 섹션 강조 + 클릭 이동
- `SignupPromptModal` — 마지막 섹션 최초 도달 시 비로그인 사용자 회원가입 유도
- `IndustriesTab` ~ `MonthlyForecastTab` — 각 분석 섹션 UI

**훅**:
- `useConsultation` — API 호출, consultationStore 캐싱, Swiper onSlideChange 섹션 동기화

**API**: POST /api/career/consultation (20s timeout, 8개 섹션 전체 단일 수신)

**Swiper.js 설정**:
```typescript
// FullPageConsultation.tsx
// [Exception: Principle IV] — 사용자 명시 요청, MIT 라이선스, wheel 정규화 직접 구현 복잡도 과다
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, A11y } from 'swiper/modules';

<Swiper
  direction="vertical"
  speed={prefersReducedMotion ? 0 : 700}
  mousewheel={{ sensitivity: 1, thresholdDelta: 50 }}
  keyboard={{ enabled: true }}
  a11y={{ enabled: true }}
  modules={[Mousewheel, Keyboard, A11y]}
  onSwiper={(s) => { swiperRef.current = s; }}
  onSlideChange={(s) => onSectionChange(s.activeIndex)}
  className="h-screen"
>
  {SECTION_LABELS.map((label, index) => (
    <SwiperSlide key={label} className="h-screen overflow-y-auto bg-night-900 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto px-4 py-8 w-full">
        {sections[index]}
      </div>
    </SwiperSlide>
  ))}
</Swiper>
```

**성공 기준**:
- 8개 섹션 각각 100vh 전체화면 표시
- 마우스 휠: 1노치 = 1섹션, 자연스러운 700ms 전환
- SectionNavigator 클릭 → swiperRef.slideTo() → 300ms 이내 이동
- 모바일: 터치 스와이프 지원 (Swiper 기본 지원)
- prefers-reduced-motion: speed=0 즉시 전환
- 마지막 섹션 최초 도달: 비로그인 시 SignupPromptModal 표시
- 마지막 섹션에서 피드백 버튼 표시

---

### 8.5 US5: 기업 궁합

**컴포넌트**: CompanyForm, CompatibilityResult  
**훅**: useCompatibility, useCompanyAutocomplete  
**API**: POST /api/company/autocomplete (5s), POST /api/company/compatibility (8s)  
**성공 기준**: 자동완성, 점수 + 직무 카드 + 캘린더, 폴백 수동 입력

---

### 8.6 US6: 피드백 모달

**컴포넌트**: FeedbackModal  
**훅**: useFeedback  
**API**: POST /api/feedback/satisfaction (5s)  
**성공 기준**: 만족도 라디오, 글자 수 카운터(500자), 제출 성공 메시지

---

## 9. 구현 단계 (9개 단계, 137개 작업)

| 단계 | 목표 | 작업 | 차단 |
|-------|------|-------|----------|
| Phase 1 | Setup & Infrastructure | T001-T010 | Everything |
| Phase 2 | Foundation (Zustand, API, Validation) | T011-T036 | US1-US6 |
| Phase 3 | US1: Authentication | T037-T050 | US2, US6 |
| Phase 4 | US3: Career Timing | T051-T070 | US4, US5, US6 |
| Phase 5 | US5: Company Compatibility | T071-T085 | (independent) |
| Phase 6 | US4: Consultation (8섹션 Swiper.js) | T086-T100 | US3 (sajuResultId) |
| Phase 7 | US2: My Page | T101-T112 | US1, US3, US5, US6 |
| Phase 8 | US6: Feedback & Error Handling | T113-T120 | All result screens |
| Phase 9 | Responsive, A11y, Testing, Polish | T121-T137 | All |

**Phase 6 추가 작업 (Swiper.js 마이그레이션 — tasks.md Phase 10)**:
- `npm install swiper` (swiper@12, MIT 라이선스)
- `app/globals.css`에 `@import 'swiper/css'` 추가
- `FullPageConsultation` 컴포넌트 재작성 (Swiper 교체, Constitution IV 예외 주석 필수)
- `SectionNavigator` — onNavigate prop 유지, swiperRef.slideTo() 연동
- `SignupPromptModal` — 마지막 섹션 최초 도달 시 비로그인 사용자 모달
- 8개 섹션 컴포넌트 작성 (IndustriesTab ~ MonthlyForecastTab)
- 모바일 터치 스와이프 (Swiper 기본 지원)
- prefers-reduced-motion: speed=0 처리
- Jest 테스트: Swiper mock (`jest.mock('swiper/react')`, `jest.mock('swiper/modules')`)

**중요 경로**: 단계 1 → 2 → 3 → 4 → 6 → 7 → 8 → 9

---

## 10. 테스트 전략

### 10.1 단위 테스트

```
Coverage Target: 80%

Components:
  - FullPageConsultation: 섹션 렌더링, onSectionChange 콜백
  - SectionNavigator: 현재 섹션 강조, 클릭 이동
  - Section1~8: 데이터 렌더링, 엣지 케이스
  - TimingForm, DisclaimerOverlay, FeedbackModal

Hooks:
  - useConsultation: API 호출, 캐시, sectionIndex 동기화
  - useCareerTiming, useMyPage, Zustand stores
```

### 10.2 통합 테스트 (MSW)

```
Scenarios:
  1. Full login flow
  2. Career timing + auto-save
  3. Consultation 8섹션 fullpage.js (MSW mock API)
  4. My-page 무한 스크롤
  5. API retry policy
  6. Feedback submission
```

### 10.3 E2E 테스트 (Playwright)

```
Critical Paths:
  1. DisclaimerOverlay timing (1.5s ±50ms)
  2. fullpage.js 섹션 전환 (<700ms)
  3. SectionNavigator 클릭 이동 (<300ms)
  4. 무한 스크롤 (threshold 0.5)
  5. prefers-reduced-motion: 즉시 전환
```

---

## 11. 성능 목표

| 지표 | 목표 | 접근 방식 |
|--------|--------|----------|
| **LCP** | <3s | fullpage.js 동적 import |
| **FID** | <100ms | Debounce handlers |
| **CLS** | <0.1 | 100vh 고정 섹션 크기 |
| **섹션 전환** | 700ms | fullpage.js scrollingSpeed |
| **초기 번들** | <200KB | Code splitting |

---

## 12. 의존성 (NPM)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "zustand": "^4.4.0",
    "zod": "^3.22.0",
    "recharts": "^2.10.0",
    "sonner": "^1.0.0",
    "react-intersection-observer": "^9.5.0",
    "swiper": "^12.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "msw": "^1.3.0",
    "@playwright/test": "^1.40.0"
  }
}
```

**Swiper.js 라이선스**:
- MIT 라이선스 — 상업용 포함 무료 사용 가능
- React 공식 바인딩 (`swiper/react`) 내장, 별도 패키지 불필요
- TypeScript 타입 정의 패키지에 포함됨

---

## 13. 위험 관리

| 위험 | 확률 | 완화책 |
|------|-------------|--------|
| **Swiper.js Next.js SSR 호환** | Low | `'use client'` 컴포넌트에서 import, SSR safe (v9+) |
| **Swiper.js 모바일 터치** | Low | Swiper 기본 지원, 터치 스와이프 자동 처리 |
| **월별운세 섹션 내 오버플로우** | Medium | SwiperSlide `overflow-y: auto` → 슬라이드 내부 스크롤 |
| **OAuth failure** | Medium | 비로그인 계속 허용 |
| **API timeout** | Medium | 재시도 정책 (3회) |
| **Disclaimer timing drift** | Low | setTimeout ±50ms, E2E 테스트 |

---

## 14. 보안 & 개인정보 보호

- **HttpOnly Cookie**: 인증 토큰 (XSS 방지)
- **Zod**: 모든 API 응답 런타임 검증
- **XSS**: HTML 자동 이스케이프 (React 기본 + Tailwind)
- **입력 검증**: 생년월일 YYYY-MM-DD, 시간 HH:mm, 기업명 최대 길이

---

## 요약

이 계획은 SSAju 프론트엔드 구현을 위한 **완전한 로드맵**을 제공합니다:
- **137개 작업** (9개 단계)
- **6개 사용자 스토리** (P1: 3, P2: 3)
- **65개 이상의 기능 요구사항**
- **5개 Zustand 스토어** (consultationStore는 Swiper onSlideChange로 sectionIndex 동기화)
- **Swiper.js v12** AI 컨설팅 8섹션 수직 슬라이드 (Constitution IV 예외, MIT 라이선스)
- **80% 테스트 커버리지**
- **성능 목표**: <3s LCP, 700ms 섹션 전환, <0.1 CLS
- **보안**: HttpOnly 쿠키 + Zod 검증
- **접근성**: prefers-reduced-motion, keyboard, a11y 모듈

**다음 단계**: tasks.md Phase 10 (T130-T135) Swiper.js 마이그레이션 구현

---

**업데이트**: 2026-05-14 (Swiper.js 마이그레이션 반영 — fullpage.js/CSS scroll-snap 대체)  
**버전**: 1.2  
**상태**: 구현 준비 완료
