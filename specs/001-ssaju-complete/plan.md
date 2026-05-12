# Implementation Plan: SSAju 프론트엔드 완성 (001-ssaju-complete)

**Branch**: `001-ssaju-complete` | **Date**: 2026-05-11 | **Spec**: [specs/001-ssaju-complete/spec.md](spec.md)  
**Status**: Phase 1 (Design Complete) | **Next**: Phase 3 (Implementation)  
**Input**: 6 user stories (P1: 3, P2: 3), 65+ functional requirements, 137 implementation tasks

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

---

## Executive Summary

SSAju 프론트엔드는 **사주 기반 커리어 컨설팅 플랫폼**의 완성된 구현입니다. 사용자는 생년월일/시간을 입력하여 관운 분석(H1/H2), AI 커리어 컨설팅(8개 탭), 기업 궁합 분석을 받고, 로그인하여 결과를 영구 저장할 수 있습니다. 

**핵심 가치**:
- 소셜 로그인(카카오/구글) + 분석 결과 영구 저장
- AI 기반 8탭 컨설팅 (0.2초 탭 전환)
- 1.5초 고지 문구 오버레이 애니메이션
- 마이페이지 무한 스크롤 (threshold 0.5)
- "별이 빛나는 밤" 테마 (night-900/800/700, star-500/400/300)

**구현 규모**: ~40개 컴포넌트, ~15개 훅, 5개 Zustand 스토어, 137개 구현 작업, 80% 테스트 커버리지

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

### 1.3 상태 관리 & 데이터 흐름

| 라이브러리 | 버전 | 목적 | 아키텍처 |
|---------|---------|---------|--------------|
| **Zustand** | 4.4+ | Global state | 5 stores: authStore, sessionStore, analysisStore, consultationStore, errorStore |
| **Zustand Persist** | 4.4+ | State persistence | localStorage for consultationStore (tab input cache) |

**Store Details**:
```typescript
// authStore: 사용자 인증 상태
{ isLoggedIn, user, accessToken, provider, loginError }

// sessionStore: 현재 세션 분석
{ sajuResultId, lastAnalysisType, currentAnalysisData, isAnalyzing }

// analysisStore: 분석 결과 캐싱
{ careerTiming, consultation, compatibility }

// consultationStore: 8탭 입력값 캐싱 (persist enabled)
{ fieldCache: { [tabId]: value }, selectedTabIndex }

// errorStore: 전역 에러 + 토스트
{ globalError, toastQueue: Toast[] }
```

### 1.4 스타일링 & 디자인 시스템

| 도구 | 버전 | 설정 |
|------|---------|---------------|
| **Tailwind CSS** | 3.3+ | Utility-first CSS only (no CSS Modules, no styled-components) |
| **Custom Colors** | - | night-900: #0a0e27, night-800: #1a1f3a, night-700: #2a3050, star-500: #ffd700, star-400: #ffed4e, star-300: #fff8a8 |
| **Typography** | Pretendard Sans (body), Garamond Serif (headings) | Font sizes: desktop 16-32px, tablet 15-24px, mobile 14-20px |
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
  solarType: z.enum(['SOLAR', 'LUNAR']),
  birthCity: z.string().optional(),
  gender: z.enum(['M', 'F', 'UNKNOWN']).optional()
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
| **Custom Wrapper** | - | Error handling, auth token injection, Q5 retry policy |
| **Environment Variable** | - | `NEXT_PUBLIC_API_BASE_URL` (e.g., `http://localhost:8080`) |

**apiFetch Signature**:
```typescript
async function apiFetch<T>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
    body?: any;
    timeout?: number;  // Default: 10s
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
| **Prettier** | Latest | Code formatting |
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
| `/api/career/consultation` | POST | 15s | AI 컨설팅 (비용 많음) |
| `/api/company/autocomplete` | POST | 5s | 회사명 자동완성 (Q2) |
| `/api/company/compatibility` | POST | 10s | 기업 궁합 |
| `/api/analysis/{type}/save` | POST | 10s | 분석 결과 저장 |
| `/api/analysis/records` | POST | 10s | 마이페이지 무한 스크롤 |
| `/api/analysis/{recordId}` | POST | 5s | 상세 조회 |
| `/api/analysis/{recordId}` | DELETE | 10s | 기록 삭제 |
| `/api/feedback` | POST | 5s | 피드백 제출 |
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
│   ├── page.tsx                      # Home page
│   ├── career/
│   │   └── timing/page.tsx           # Career timing form + result
│   ├── consultation/[id]/page.tsx    # 8-tab consultation
│   ├── company/page.tsx              # Company compatibility
│   ├── my-page/page.tsx              # My page + infinite scroll
│   └── layout.tsx                    # Root layout (header, footer)
│
├── components/
│   ├── LoginButton.tsx               # OAuth buttons
│   ├── ProfileMenu.tsx               # Logged-in user menu
│   ├── TimingForm.tsx                # Career timing input
│   ├── DisclaimerOverlay.tsx         # 1.5s + 500ms animation
│   ├── CareerTimingResult.tsx        # H1/H2 + confidence + save
│   ├── ConsultationTabs.tsx          # 8-tab nav + content
│   ├── ConsultationTabContent.tsx    # Single tab content
│   ├── CompanyForm.tsx               # Company input + autocomplete
│   ├── CompatibilityResult.tsx       # Score + job matching + calendar
│   ├── AnalysisRecordCard.tsx        # My-page list item
│   ├── MyPageTabs.tsx                # 3-tab my-page
│   ├── LoadingSpinner.tsx            # Loading indicator
│   ├── ErrorMessage.tsx              # Error + retry
│   ├── FeedbackModal.tsx             # Satisfaction + comment
│   └── shared/
│       ├── Header.tsx                # Navigation + login
│       ├── Footer.tsx                # Footer links
│       └── Toast.tsx                 # Sonner toast
│
├── hooks/
│   ├── useCareerTiming.ts            # { data, loading, error, submit }
│   ├── useConsultation.ts            # Tab switching + caching
│   ├── useCompatibility.ts           # Company analysis
│   ├── useAnalysisRecords.ts         # My-page + pagination
│   ├── usePageExitGuard.ts           # beforeunload + beforePopState
│   ├── useDisclaimerTiming.ts        # 1.5s + 500ms animation
│   ├── useAuthStore.ts               # Auth state (Zustand)
│   ├── useSessionStore.ts            # Session state (Zustand)
│   ├── useAnalysisStore.ts           # Analysis results (Zustand)
│   ├── useConsultationStore.ts       # Consultation cache (Zustand)
│   └── useErrorStore.ts              # Global errors (Zustand)
│
├── lib/
│   ├── api/
│   │   ├── client.ts                 # apiFetch<T>() wrapper
│   │   ├── career.ts                 # fetchCareerTiming, fetchConsultation
│   │   ├── company.ts                # fetchCompatibility
│   │   ├── analysis.ts               # fetchAnalysisRecords, deleteRecord
│   │   ├── feedback.ts               # submitFeedback
│   │   ├── auth.ts                   # OAuth callback
│   │   └── schemas.ts                # All Zod schemas
│   │
│   ├── stores/
│   │   ├── auth.ts                   # authStore (Zustand)
│   │   ├── session.ts                # sessionStore (Zustand)
│   │   ├── analysis.ts               # analysisStore (Zustand)
│   │   ├── consultation.ts           # consultationStore (Zustand persist)
│   │   └── error.ts                  # errorStore (Zustand)
│   │
│   └── utils/
│       ├── validation.ts             # Input validation helpers
│       ├── formatting.ts             # Date/time formatting
│       └── constants.ts              # APP_TIMEOUT, etc.
│
├── types/
│   ├── api.ts                        # ApiResponse<T>, request types
│   ├── domain.ts                     # FavoredPeriod, SajuData, etc.
│   └── component.ts                  # Component prop interfaces
│
├── styles/
│   └── globals.css                   # @tailwind directives only
│
├── __tests__/
│   ├── unit/                         # Component, Hook tests
│   ├── integration/                  # API flow tests (MSW)
│   └── fixtures/                     # Mock data
│
└── jest.config.ts, tsconfig.json, tailwind.config.ts, etc.
```

---

## 3. 데이터 모델 & 상태 흐름

### 3.1 핵심 엔티티

```
User (로그인/비로그인)
  ├─ authStore: { isLoggedIn, user, accessToken, provider }
  ├─ sessionStore: { sajuResultId, currentAnalysisData }
  └─ Analysis (1...N)
      ├─ CareerTimingAnalysis { sajuResultId, favoredPeriod, confidenceScore }
      ├─ ConsultationAnalysis { sajuResultId, tabs[8], selectedTabIndex }
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
   └─ useDisclaimerTiming() setTimeout 1500ms
   └─ CSS transition opacity 500ms ease-in-out
   
4. CareerTimingResult displays
   └─ showLoginNudgeCard() if !isLoggedIn
   
5. User clicks "로그인하기"
   └─ OAuth popup (cakaotalk/google)
   └─ authStore.setLogin(user, token)
   └─ Q1: Auto-save analysis to backend
   └─ Sonner toast: "분석 결과가 저장되었습니다"
   
6. User navigates to /my-page
   └─ Hook: useAnalysisRecords('CAREER')
   └─ API: POST /api/analysis/records
   └─ Display saved record in list
```

#### 여정 2: 컨설팅 8탭 전환 (Q4)

```
1. User on consultation page
   └─ Hook: useConsultation(sajuResultId)
   └─ consultationStore: { fieldCache, selectedTabIndex }
   
2. User types in Tab 0 input
   └─ onChange: consultationStore.setFieldValue('CAREER', value)
   └─ Persist to localStorage (Zustand persist)
   
3. Click Tab 1
   └─ consultationStore.selectTab(1)
   └─ Cache hit: display cached value immediately (<200ms)
   └─ No loading spinner
   
4. API fetch only on cache miss
   └─ submitTab(1): POST /api/career/consultation
   └─ Receive result, cache it
   └─ Display result
   
5. Page refresh
   └─ Zustand persist: restore fieldCache from localStorage
   └─ selectedTabIndex restored
   └─ All tabs available without re-fetching
```

#### 여정 3: 마이페이지 무한 스크롤 (Q3, threshold 0.5)

```
1. User navigates to /my-page
   └─ Hook: useAnalysisRecords('CAREER')
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
   └─ No more records available
   └─ Remove load more trigger
```

### 3.3 저장소 전략 (Q1 명확화)

| 데이터 | 저장소 | 범위 | 지속시간 | 보안 |
|------|---------|-------|----------|------|
| **authStore (로그인 토큰)** | HttpOnly Cookie (Q1) | Current session | Until logout | ✅ XSS 방지 |
| **sessionStore (분석 상태)** | Zustand (memory) | Current session | Cleared on logout/page close | - |
| **sajuResultId** | sessionStorage | Track analysis across refresh | Until page close | ⚠️ 비민감정보 |
| **Consultation inputs** | Zustand + localStorage (persist) | Current & next session | persist enabled | - |
| **Analysis results** | analysisStore (memory) | Current session | Memory only (no persist) | - |
| **Current tab index** | Zustand (memory) | Current session | Memory only | - |

**Q1 명확화**:
- **로그인 토큰**: HttpOnly 쿠키 기반만 사용하여 XSS 방지. sessionStorage 토큰 저장 제거.
- **sajuResultId**: 민감하지 않은 분석 추적 정보이므로 sessionStorage 사용 (페이지 새로고침 시 복원 필요).
- **Authorization 헤더**: 개발 환경에서만 선택적 사용 (로깅/디버깅용, 인증에는 미사용).

---

## 4. 컴포넌트 계층 & Props 흐름

### 4.1 페이지 컴포넌트

```
app/career/timing/page.tsx
├─ useCareerTiming() hook
├─ State: formData, showDisclaimer, showResult
└─ Components:
    ├─ Header (ProfileMenu or LoginButton)
    ├─ DisclaimerOverlay (visible={showDisclaimer})
    ├─ TimingForm (isLoading, onSubmit)
    ├─ CareerTimingResult (analysis, isLoggedIn, onSave)
    └─ FeedbackModal (visible, onSubmit)
```

### 4.2 Props 패턴

```typescript
// Component Props Interface
interface TimingFormProps {
  onSubmit: (formData: CareerTimingRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  onError?: (error: string) => void;
}

// Hook Return Pattern
interface UseCareerTimingReturn {
  data: CareerTimingAnalysis | null;
  loading: boolean;
  error: string | null;
  submit: (formData: CareerTimingRequest) => Promise<void>;
  reset: () => void;
}

// Zustand Store Pattern
interface AuthStore {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  setLogin: (user: User, token: string) => void;
  setLogout: () => void;
}
```

---

## 5. API 클라이언트 & 에러 처리

### 5.1 Q5 재시도 정책이 있는 apiFetch 래퍼 (Q1 명확화)

```typescript
// lib/api/client.ts
// Q1 결정: HttpOnly 쿠키 기반, sessionStorage 제거, Authorization 헤더 선택사항

async function apiFetch<T>(
  path: string,
  options?: FetchOptions
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);  // 10s timeout
  
  let lastError: Error | null = null;
  const maxAttempts = 3;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`,
        {
          method: options?.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Q1: Authorization 헤더는 선택사항 (로깅/디버깅용)
            // 실제 인증은 HttpOnly 쿠키에만 의존
            ...(process.env.NODE_ENV === 'development' && {
              'Authorization': `Bearer ${getAccessTokenForLogging()}`
            })
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
          credentials: 'include'  // HttpOnly 쿠키 자동 전송
        }
      );
      
      clearTimeout(timeoutId);
      
      const json = await response.json();
      
      // Validate response with Zod
      const validatedData = responseSchema.parse(json.data);
      
      if (!response.ok) {
        throw new ApiError(json.error.code, json.error.message);
      }
      
      return validatedData as T;
      
    } catch (error) {
      lastError = error;
      
      // Q5: Only retry on timeout or network error
      const isRetryable = (
        error instanceof TypeError ||  // Network error
        (error as any).name === 'AbortError'  // Timeout
      );
      
      if (!isRetryable || attempt === maxAttempts) {
        clearTimeout(timeoutId);
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  throw lastError || new Error('Unknown API error');
}
```

**Q1 명확화 적용**:
- **HttpOnly Cookie**: 백엔드가 설정, 브라우저 자동 포함 (`credentials: 'include'`)
- **sessionStorage**: 제거 (XSS 위험성으로 인해 불필요)
- **Authorization 헤더**: 개발 환경에서만 선택사항으로 제공 (로깅/디버깅)

### 5.2 에러 처리 전략

```typescript
// Q5: Retry policy
- Timeout (>10s): Retry up to 3 times (1s, 2s, 4s backoff)
- Network error: Retry up to 3 times (same backoff)
- 400/401/403/404/500: Fail immediately, no retry
- Business logic error: Fail immediately, no retry

// Error UI
- Network/timeout: "네트워크 오류. 다시 시도해주세요." + Retry button
- 401 Unauthorized: "로그인이 필요합니다. 다시 로그인해주세요."
- 500 Server Error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
- Generic error: "요청 처리 중 오류가 발생했습니다."
```

---

## 6. Zustand 스토어 아키텍처

### 6.1 authStore (인증, Q1 명확화)

```typescript
// lib/stores/auth.ts
// Q1 결정: HttpOnly 쿠키 기반, sessionStorage 제거

interface User {
  userId: string;
  provider: 'KAKAO' | 'GOOGLE';
  email: string;
  nickname: string;
  createdAt: string;
}

interface AuthStore {
  // State
  isLoggedIn: boolean;
  user: User | null;
  provider: 'KAKAO' | 'GOOGLE' | null;
  loginError: string | null;
  
  // Actions
  setLogin: (user: User) => void;  // token은 HttpOnly 쿠키에만 저장
  setLogout: () => void;
  setLoginError: (error: string) => void;
  checkToken: () => Promise<boolean>;  // Validate token on app init
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,  // 페이지 로드 시 서버 검증 필요
  user: null,
  provider: null,
  loginError: null,
  
  setLogin: (user) => {
    // Token은 백엔드가 HttpOnly 쿠키로 설정 (자동)
    set({ isLoggedIn: true, user });
  },
  
  setLogout: () => {
    set({ isLoggedIn: false, user: null, provider: null });
  },
  
  // ... rest of actions
}));
```

**Q1 명확화 적용**:
- **HttpOnly Cookie**: 백엔드가 설정, 모든 요청에 자동 포함
- **sessionStorage 제거**: accessToken 저장 불필요 (XSS 위험)
- **setLogin()**: token 파라미터 제거 (저장 불필요)
- **인증 확인**: 앱 초기화 시 서버에 검증 요청 (`/api/auth/check`)

### 6.2 sessionStore (현재 세션)

```typescript
interface SessionStore {
  // State
  sajuResultId: string | null;
  lastAnalysisType: 'CAREER' | 'CONSULTATION' | 'COMPANY' | null;
  currentAnalysisData: any | null;
  isAnalyzing: boolean;
  
  // Actions
  setSajuResultId: (id: string) => void;
  setCurrentAnalysis: (data: any) => void;
  setIsAnalyzing: (loading: boolean) => void;
  clearSession: () => void;
}
```

### 6.3 consultationStore (Q4 캐싱)

```typescript
interface ConsultationStore {
  // State
  fieldCache: { [tabId: string]: string };  // e.g., { 'CAREER': '개발자...', 'LOVE': '... }
  selectedTabIndex: number;
  
  // Actions
  setFieldValue: (tabId: string, value: string) => void;
  getFieldValue: (tabId: string) => string | undefined;
  selectTab: (index: number) => void;
  clearCache: () => void;
}

// WITH PERSIST MIDDLEWARE
export const useConsultationStore = create<ConsultationStore>()(
  persist(
    (set, get) => ({
      fieldCache: {},
      selectedTabIndex: 0,
      setFieldValue: (tabId, value) => set(state => ({
        fieldCache: { ...state.fieldCache, [tabId]: value }
      })),
      // ... rest of actions
    }),
    {
      name: 'consultation-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 6.4 errorStore (전역 에러 & 토스트)

```typescript
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ErrorStore {
  // State
  globalError: { message: string; code: string } | null;
  toastQueue: Toast[];
  
  // Actions
  setGlobalError: (error: { message: string; code: string }) => void;
  clearError: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

---

## 7. 애니메이션 & 타이밍 사양

### 7.1 고지 문구 오버레이 (FR-048, FR-049, Q1)

```
Timeline:
  0ms    ─ Display overlay (fade-in starts)
  0ms    ─ Opacity: 0 → 1 (CSS transition)
  ~50ms  ─ Fully opaque
  1500ms ─ Start fade-out (1.5s exact)
  1500ms ─ Loading spinner fade-in starts (simultaneous)
  2000ms ─ Overlay fully transparent, removed from DOM
  2000ms ─ Loading spinner fully visible

CSS:
  .disclaimer-overlay {
    opacity: 1;  // Rendered immediately
    transition: opacity 500ms ease-in-out;
  }
  
  .loading-spinner {
    opacity: 0;  // Hidden initially
    transition: opacity 500ms ease-in-out;
    &.visible { opacity: 1; }
  }

Implementation (Hook: useDisclaimerTiming):
  1. Set visible=true (render overlay, opacity: 1)
  2. setTimeout 1500ms:
     ├─ Set isFadingOut=true
     ├─ CSS class added: trigger fade-out transition
     └─ Simultaneous: show loading spinner (fade-in)
  3. setTimeout 2000ms (total):
     ├─ Remove overlay from DOM
     └─ Fire onComplete() callback

Rendering (Component: DisclaimerOverlay):
  - Full-screen overlay (z-index: high)
  - Dark background (opacity: 0.5)
  - Centered white text: "본 사주는 재미로 보는 것이니 참고만 바랍니다"
  - Font: responsive (desktop 28px, tablet 24px, mobile 20px)
  - User input blocked: pointer-events: none
  - Accessibility: role="alert", aria-live="assertive"
```

### 7.2 탭 전환 (FR-018, Q4)

```
Target: <200ms visual update (0.2s)

Trigger: User clicks tab
  ├─ Click handler: consultationStore.selectTab(index)
  ├─ Update selectedTabIndex immediately (state change)
  └─ Re-render component with new tab content

Cache Logic:
  - Check cache: consultationStore.fieldCache[tabId]
  - Cache HIT: Display cached data immediately
    └─ Time: <100ms (no network latency)
  - Cache MISS: Fetch from API
    ├─ Show loading spinner
    ├─ POST /api/career/consultation (15s timeout)
    ├─ Cache result
    └─ Display result (~1-2s)

Measurement:
  - Performance.now() at click
  - Performance.now() when new content visible
  - Assert: elapsed < 200ms (for cached tabs)
```

---

## 8. 사용자 스토리 구현 전략

### 8.1 US1: 인증 & 사용자 관리

**Components**:
- LoginButton (OAuth popup)
- ProfileMenu (logged-in state)
- LoginModal (alternative: modal instead of popup)

**Hooks**:
- useAuthStore (global state)

**API**:
- GET /api/auth/callback (OAuth)
- POST /api/auth/logout

**Success Criteria**:
- OAuth popup opens (not redirect)
- Token saved in httpOnly Cookie + sessionStorage
- Header changes based on isLoggedIn
- Auto-save on login (Q1)

---

### 8.2 US2: 마이페이지 & 히스토리

**컴포넌트**:
- MyPageTabs (3 tabs)
- AnalysisRecordCard (list item)
- DeleteConfirmModal

**Hooks**:
- useAnalysisRecords (pagination + infinite scroll)

**API**:
- POST /api/analysis/records (pagination)
- POST /api/analysis/{recordId} (detail)
- DELETE /api/analysis/{recordId}

**Success Criteria**:
- 3 tabs load independently
- Infinite scroll (threshold 0.5)
- 0.1s instant replay of saved results
- Delete with confirmation

---

### 8.3 US3: 관운 분석

**컴포넌트**:
- TimingForm (date + time picker)
- DisclaimerOverlay (1.5s + 500ms)
- CareerTimingResult (H1/H2 + progress bar)

**Hooks**:
- useCareerTiming
- useDisclaimerTiming (Q1)

**API**:
- POST /api/career/timing (10s timeout)

**Success Criteria**:
- Disclaimer 1.5s auto-display
- 500ms fade transition
- H1/H2 with confidence score
- Auto-save on login (Q1)

---

### 8.4 US4: AI 컨설팅 (8개 탭, Q4)

**컴포넌트**:
- ConsultationTabs (8 tabs)
- ConsultationTabContent (single tab)
- MonthlyCalendar (for月別运势)

**Hooks**:
- useConsultation (caching + 0.2s switching)

**API**:
- POST /api/career/consultation (15s timeout)

**Success Criteria**:
- All 8 tabs loaded (cached)
- <200ms tab switching (Q4)
- Input value persistence (Q4)
- Page refresh restores state

---

### 8.5 US5: 기업 궁합 (Q2 명확화)

**컴포넌트**:
- CompanyForm (input + autocomplete)
- CompatibilityResult (score + job cards + calendar)

**Hooks**:
- useCompatibility
- useCompanyAutocomplete (Q2: 백엔드 의존)

**API** (Q2: 백엔드 `/api/company/autocomplete` 사용):
- POST `/api/company/autocomplete` (5s timeout)
  - Request: `{ query: string }`
  - Response: `{ suggestions: string[] }`
- POST `/api/company/compatibility` (10s timeout)

**Success Criteria**:
- 사용자 입력 시 자동완성 목록 표시 (5s 타임아웃)
- Score + job matching 표시
- Calendar layout 반응형
- 자동완성 API 실패 시 수동 입력 폴백

---

### 8.6 US6: 피드백 모달

**컴포넌트**:
- FeedbackModal (satisfaction + comment)

**Hooks**:
- useFeedback

**API**:
- POST /api/feedback (5s timeout)

**Success Criteria**:
- Modal appears on all result screens
- Satisfaction selection (radio)
- Character counter (max 500)
- Submit success message

---

## 9. 구현 단계 (9개 단계, 137개 작업)

| 단계 | 목표 | 작업 | 예상시간 | 차단 |
|-------|------|-------|----------|----------|
| Phase 1 | Setup & Infrastructure | T001-T010 | 1-2 days | Everything |
| Phase 2 | Foundation (Zustand, API, Validation) | T011-T036 | 2-3 days | US1-US6 |
| Phase 3 | US1: Authentication | T037-T050 | 1-2 days | US2, US6 |
| Phase 4 | US3: Career Timing | T051-T070 | 2-3 days | US4, US5, US6 |
| Phase 5 | US5: Company Compatibility | T071-T085 | 1-2 days | (independent) |
| Phase 6 | US4: Consultation (8 tabs) | T086-T100 | 3-4 days | US3 (depends sajuResultId) |
| Phase 7 | US2: My Page | T101-T112 | 2-3 days | US1, US3, US5, US6 |
| Phase 8 | US6: Feedback & Error Handling | T113-T120 | 1 day | All result screens |
| Phase 9 | Responsive, A11y, Testing, Polish | T121-T137 | 2-3 days | All |

**중요 경로**: 단계 1 → 단계 2 → 단계 3 → 단계 4 → 단계 6 → 단계 7 → 단계 8 → 단계 9

---

## 10. 테스트 전략

### 10.1 단위 테스트

```
Coverage Target: 80% (src/)

Components:
  - TimingForm: input validation, submit handler
  - DisclaimerOverlay: timing (1.5s + 500ms)
  - ConsultationTabs: tab switching, caching
  - AnalysisRecordCard: click, delete
  - LoginButton: OAuth flow

Hooks:
  - useCareerTiming: submit, error handling, reset
  - useConsultation: tab selection, cache restore
  - useAnalysisRecords: pagination, infinite scroll
  - Zustand stores: state updates, persist

API Functions:
  - apiFetch: success, error, timeout, retry (Q5)
  - fetchCareerTiming, etc.: response validation (Zod)
```

### 10.2 통합 테스트 (MSW)

```
Scenarios:
  1. Full login flow (OAuth callback)
  2. Career timing analysis + auto-save on login (Q1)
  3. Consultation tab switching + caching (Q4)
  4. My-page pagination + infinite scroll (Q3)
  5. Company compatibility + fallback
  6. API retry policy (Q5): timeout, network, success
  7. Feedback submission
  8. Page exit guard (beforeunload, beforePopState)

MSW Setup:
  - Mock all POST endpoints
  - Simulate timing (3-5s for analysis)
  - Simulate failures (timeout, 500 error)
  - Test error recovery paths
```

### 10.3 E2E 테스트 (Playwright)

```
Critical Paths:
  1. DisclaimerOverlay timing (1.5s exact ±50ms, 500ms fade)
  2. Tab switching performance (<200ms cached)
  3. Infinite scroll threshold (50% visible)
  4. beforeunload modal for unsaved data
  5. Full user journey (login → analysis → save → my-page)

Measurements:
  - Performance.now() for timing assertions
  - Visual regression testing
  - Accessibility (axe-core)
```

---

## 11. 성능 최적화

### 11.1 번들 크기

| 목표 | 현재 (예상) | 최적화 |
|--------|---------------------|--------------|
| Initial JS | <100KB | Code splitting (dynamic imports) |
| CSS | <50KB | Tailwind purge (unused styles) |
| Fonts | <100KB | Pretendard + Garamond (web fonts) |
| Total | <250KB | gzip compression |

### 11.2 렌더링 성능

| 지표 | 목표 | 접근 방식 |
|--------|--------|----------|
| **LCP** (Largest Contentful Paint) | <3s | Lazy load images, critical CSS inline |
| **FID** (First Input Delay) | <100ms | Debounce handlers, async API calls |
| **CLS** (Cumulative Layout Shift) | <0.1 | Fixed heights for images, skeletons |
| **Tab Switching** | <200ms | Zustand cache (in-memory) |

### 11.3 캐싱 전략

```
캐시 계층:
  1. Browser cache: HTTP 304 (my-page detail)
  2. Zustand persist: localStorage (consultation inputs)
  3. sessionStorage: sajuResultId across page refresh
  4. Memory cache: analysisStore (current session)
```

---

## 12. 보안 & 개인정보 보호

### 12.1 인증

- **HttpOnly Cookie**: Server validation (CSRF protection)
- **sessionStorage Token**: Frontend logic only (XSS exposure, but mitigated by httpOnly)
- **Q2 Decision**: OAuth popup (not redirect)
- **Token Refresh**: Q5 retry policy on timeout/network only

### 12.2 입력 검증

- **Frontend**: Zod schemas (UX feedback)
- **Backend**: Double validation (security)
- **Sanitization**: No HTML in feedback text (max 500 chars)

### 12.3 데이터 개인정보 보호

- **Non-logged-in Analysis**: sessionMemory only (volatile)
- **Logged-in Analysis**: Backend persistent (user-owned)
- **PII**: Birth date stored (required), no SSN
- **Feedback**: Anonymous OK (no user ID required)

---

## 13. 위험 관리 & 대응책

| 위험 | 확률 | 영향 | 완화책 |
|------|-------------|--------|-----------|
| **OAuth failure** | Medium | High | Fallback to email login (Phase 2) |
| **API timeout** | Medium | Medium | Q5 retry policy (3 attempts) |
| **Large dataset (my-page)** | Low | Medium | Pagination + infinite scroll |
| **Browser back button** | High | Medium | beforePopState guard (US6) |
| **Disclaimer timing drift** | Low | Medium | setTimeout ±50ms, E2E test |
| **Zustand persist corruption** | Low | Low | Clear localStorage fallback |

---

## 14. 의존성 & 서드파티 통합

### 14.1 NPM 의존성

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "zustand": "^4.4.0",
    "zod": "^3.22.0",
    "recharts": "^2.10.0",
    "sonner": "^1.0.0",
    "react-intersection-observer": "^9.5.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "jest": "^29.0.0",
    "react-testing-library": "^14.0.0",
    "msw": "^1.3.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### 14.2 백엔드 API (Spring Boot)

- **Base URL**: `http://localhost:8080` (dev), TBD (production)
- **All endpoints**: POST, return `ApiResponse<T>`
- **Authentication**: HttpOnly Cookie + Authorization header (optional)
- **CORS**: Enable localhost:3000 (dev), configure production origin

### 14.3 OAuth 제공자

- **Kakao Login API**: OAuth 2.0, popup flow
- **Google Login API**: OAuth 2.0, popup flow
- **Callback Handler**: `/api/auth/callback?code=X&state=Y`

---

## 15. 배포 & 릴리스 전략

### 15.1 사전 릴리스 체크리스트

```
코드 품질:
  ☐ npm run build (0 errors)
  ☐ npm run lint (0 violations)
  ☐ npm test -- --coverage (≥80%)
  ☐ TypeScript strict mode (0 errors)
  
Testing:
  ☐ Unit tests pass
  ☐ Integration tests (MSW) pass
  ☐ E2E tests (critical paths) pass
  ☐ Manual testing: all 6 user stories
  
Performance:
  ☐ Lighthouse score ≥80
  ☐ Bundle size <250KB (gzip)
  ☐ LCP <3s, FID <100ms, CLS <0.1
  
Accessibility:
  ☐ axe-core audit: no critical issues
  ☐ Screen reader testing
  ☐ Keyboard navigation working
  
Documentation:
  ☐ README.md updated
  ☐ API contract documented
  ☐ Component storybook (nice-to-have)
  ☐ Git commit messages follow convention
```

### 15.2 CI/CD 파이프라인

```yaml
# .github/workflows/build-and-test.yml
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - npm install
      - npm run lint
      - npm run build
      - npm test -- --coverage
      - npx playwright test  # E2E
```

### 15.3 프로덕션 배포

1. **Build**: `npm run build`
2. **Deploy**: Next.js to Vercel / AWS Amplify / custom server
3. **Environment**: Set `NEXT_PUBLIC_API_BASE_URL=https://api.production.com`
4. **Health Check**: Verify OAuth, API endpoints, database connectivity
5. **Monitoring**: Sentry (error tracking), Datadog (performance)

---

## 16. 용어사전 & 용어

| 용어 | 정의 | 약어 |
|------|-----------|------------------|
| **Saju** (사주) | Korean astrology based on birth date/time | - |
| **Timing (관운)** | Favorable/unfavorable career periods (H1/H2) | Career Timing |
| **Consultation (컨설팅)** | 8-tab AI-powered career advice | Consultation |
| **Compatibility (궁합)** | Company-user astrological matching | Compatibility |
| **Disclaimer** | Legal notice: "재미로만 참고" (for entertainment only) | - |
| **Zustand** | State management library | Store, Global State |
| **MSW** | Mock Service Worker (API mocking) | API Mock |
| **E2E** | End-to-End testing | Integration Test |
| **Q1-Q5** | 5 clarification sessions (2026-05-11) | Clarification |

---

## 요약

이 계획은 SSAju 프론트엔드 구현을 위한 **완전한 로드맵**을 제공합니다:
- **137개 작업** (9개 단계)
- **6개 사용자 스토리** (P1: 3, P2: 3)
- **65개 이상의 기능 요구사항**
- **5개 Zustand 스토어** (명확한 상태 관리)
- **Q1-Q5 명확화** (전체에 통합됨)
- **80% 테스트 커버리지** (성공 기준)
- **성능 목표**: <3s LCP, <200ms 탭 전환, <0.1 CLS
- **보안**: HttpOnly 쿠키 + Zod 검증
- **접근성**: WCAG 2.1 AA (axa-core)

**다음 단계**: 단계 3 구현 (US1: 인증)

---

**생성됨**: 2026-05-11  
**버전**: 1.0  
**총 줄 수**: 1,047  
**상태**: 구현 준비 완료
