# SSAju

사주 기반 커리어 컨설팅 플랫폼의 Next.js 프론트엔드

---

## 리포지토리 구조

```
SSAju/
├── ssaju-frontend/   # Next.js 프론트엔드 앱
├── docs/             # API 명세·UI 레이아웃·아키텍처 가이드
├── specs/            # 기능별 스펙·플랜·태스크 문서
└── sample/           # 샘플 데이터
```

---

## 서비스 소개

생년월일·태어난 시간을 입력하면 사주를 분석해 커리어 방향을 제시합니다.

| 기능             | 설명                                             |
| ---------------- | ------------------------------------------------ |
| 관운 분석        | H1/H2 관운 주기·신뢰도 점수 시각화               |
| AI 커리어 컨설팅 | 사주 프로필 기반 8개 섹션 맞춤 조언              |
| 기업 궁합 분석   | 기업명 입력 → 종합 궁합 점수·오행 차트·월별 운세 |
| 분석 히스토리    | 로그인 후 결과 저장·조회·삭제                    |

---

## 구현된 기능

### 랜딩 (`/`)
- 스토리형 랜딩 애니메이션 (StoryLandingExperience)
- 생년월일·태어난 시간 입력 폼
- 서비스 소개 카드

### 서비스 선택 (`/select`)
- 로그인 사용자만 접근 (`useAuthGuard`)
- 관운 분석 / AI 컨설팅 / 기업 궁합 선택 UI

### 관운 분석 (`/career-timing`)
- 생년월일·시간 기반 H1/H2 관운 주기 분석
- 신뢰도 점수 게이지 시각화 (`ConfidenceBar`)
- 분석 결과 저장 (`SaveButton`), 만족도 피드백 (`FeedbackModal`)
- 분석 중 페이지 이탈 방지 (`PageExitModal`)

### AI 커리어 컨설팅 (`/consultation`)
- 사주 프로필·추천 산업·직무 매칭·파워 키워드·멘탈 케어 등 8개 섹션
- Swiper 기반 풀페이지 스크롤 (`FullPageConsultation`)
- 섹션 네비게이터 (`SectionNavigator`)
- 로딩 중 단계별 프로그레스 표시 (`ConsultationLoading`)

### 기업 궁합 분석 (`/compatibility`)
- DART 기업 검색 자동완성 
- 직군 카테고리 12종 선택
- 창업일 선택 (선택 입력)
- 종합 궁합 점수·오행 레이더 차트·직군별 궁합·월별 운세 결과 

### 마이페이지 (`/my-page`)
- 탭별 분석 히스토리 (관운 / AI 컨설팅 / 기업 궁합)
- 히스토리 삭제 (`DeleteConfirmModal`)
- 분석 상세 재열람 (`/my-page/[id]`)
- 회원 탈퇴 (`WithdrawalModal`, 비밀번호 확인)

### 인증
- 이메일/패스워드 회원가입·로그인
- 토큰 자동 갱신 (401 → refresh → 재요청)
- 비로그인 접근 시 로그인 모달 표시 


---

## 기술 스택

| 분류       | 기술                                     |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 14 
| Language   | TypeScript 5               |
| Styling    | Tailwind CSS 3                           |
| 전역 상태  | Zustand 4                                |
| 서버 상태  | TanStack Query 5                         |
| 입력 검증  | Zod 3                                    |
| 차트       | Recharts 2                               |
| 애니메이션 | Framer Motion 10                         |
| 토스트     | Sonner 1                                 |
| 테스트     | Jest 29 + React Testing Library 14 + MSW |

---

## 시작하기

### 요구 사항

- Node.js 18.17+
- npm 10+

### 설치

```bash
cd ssaju-frontend
npm install
```

### 환경 변수

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### 실행

```bash
npm run dev         # 개발 서버 :3000
npm run build       # tsc + next build (TypeScript·ESLint 포함)
npm run start       # 프로덕션 서버
npm run lint        # ESLint (max-warnings=0)
npm test            # Jest (커버리지 포함)
npm run test:watch  # Jest 감시 모드
```

> `npm run build` 가 통과해야 커밋 가능합니다. 커밋 메시지에 `[Build Passed]` 를 포함합니다.

---

## 아키텍처

### 4계층 구조

계층을 역방향으로 호출하거나 건너뛰는 것을 금지합니다.

```
Page (app/**/page.tsx)
  훅 1개 호출 + 컴포넌트 조립만 담당 (50–100줄)
    ↓
Component (components/)
  UI 렌더링·사용자 인터랙션만
    ↓
Hook (hooks/)
  상태·비즈니스 로직·API 오케스트레이션
    ↓
API fn (lib/api/)
  apiFetch<T>() 호출만, 실패 시 throw
```

### 디렉토리 구조

```
ssaju-frontend/src/
├── app/                          # Next.js App Router
│   ├── api/                      # Route Handlers (백엔드 프록시)
│   │   ├── auth/                 # 로그인·로그아웃·OAuth 콜백·토큰 갱신·회원탈퇴
│   │   ├── career/               # 관운 분석·AI 컨설팅
│   │   ├── company/              # 기업 궁합·기업 검색·기업 상세
│   │   ├── feedback/             # 만족도 피드백
│   │   ├── mypage/               # 히스토리 목록·상세·삭제
│   │   └── users/                # 내 프로필
│   ├── career-timing/            # 관운 분석 페이지
│   ├── compatibility/            # 기업 궁합 페이지·결과 페이지
│   ├── consultation/             # AI 커리어 컨설팅 페이지
│   ├── my-page/                  # 히스토리 목록·상세 페이지
│   ├── select/                   # 서비스 선택 페이지
│   └── page.tsx                  # 랜딩 페이지
│
├── components/
│   ├── auth/                     # LoginButton·LoginModal·ProfileMenu·WithdrawalModal
│   ├── common/                   # Header·PageExitModal·GlobalLoadingBar·GlobalErrorHandler
│   ├── compatibility/            # FullPageCompatibility·CompatibilityScrollDetail
│   ├── consultation/             # FullPageConsultation·ConsultationScrollDetail·SectionNavigator
│   ├── errors/                   # ErrorBoundary·ErrorMessage
│   ├── forms/                    # InputForm·CompanyForm·CompanyAutocomplete·FoundingDatePicker
│   ├── history/                  # HistoryCard·HistoryTabs·DeleteConfirmModal·InfiniteScroll
│   ├── landing/                  # LandingPage·StoryLandingExperience·서비스 소개 카드 등
│   ├── modals/                   # FeedbackModal·CompanyConfirmModal
│   ├── navigation/               # TabNavigation
│   ├── results/                  # CareerTimingResult·CompatibilityResult·ConsultationLoading
│   │                             #   DisclaimerOverlay·FeedbackButton·SaveButton·LoadingProgress
│   └── visualization/            # CompatibilityScore·ConfidenceBar·OHangChart
│                                 #   MonthlyCalendar·JobMatchingCards
│
├── hooks/
│   ├── useAuth.ts                # 로그인·로그아웃·OAuth 처리
│   ├── useAuthGuard.ts           # 비로그인 접근 차단 + 로그인 모달 오픈
│   ├── useRouteGuard.ts          # 분석 결과 없이 결과 페이지 접근 차단
│   ├── useCareerTiming.ts        # 관운 분석 API 호출·상태 관리
│   ├── useConsultation.ts        # AI 컨설팅 API 호출·섹션 인덱스 관리
│   ├── useCompatibility.ts       # 기업 궁합 API 호출·상태 관리
│   ├── useCompanyAutocomplete.ts # 기업 검색 디바운스 자동완성 (300ms)
│   ├── useFeedback.ts            # 만족도 피드백 제출
│   ├── useSave.ts                # 분석 결과 저장
│   ├── useMyPage.ts              # 히스토리 목록 (React Query 무한 스크롤)
│   ├── useHistoryDetail.ts       # 히스토리 상세 조회
│   ├── useDeleteHistory.ts       # 히스토리 삭제
│   ├── useDeleteAccount.ts       # 회원 탈퇴
│   ├── useInputValidation.ts     # Zod 기반 입력 폼 검증
│   ├── useErrorHandler.ts        # ApiError → 한국어 메시지 변환·재시도 판단
│   ├── usePageExitGuard.ts       # 분석 중 페이지 이탈 방지
│   ├── useDisclaimerTimer.ts     # 면책 오버레이 자동 해제 타이머
│   ├── useSessionRehydration.ts  # sessionStorage → Zustand 재수화
│   └── useTokenExpiry.ts         # accessToken 만료 감지 → 자동 갱신
│
├── stores/                       # Zustand 전역 스토어
│   ├── authStore.ts              # isLoggedIn·user → localStorage 영속
│   │                             #   accessToken → 메모리만 (XSS 방어)
│   ├── errorStore.ts             # 에러·로딩·토스트 큐
│   ├── sessionStore.ts           # 분석 결과 ID (sessionStorage 영속)
│   ├── analysisStore.ts          # 비로그인 분석 결과 (메모리)
│   └── consultationStore.ts      # 컨설팅 섹션 인덱스·결과 캐시
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # apiFetch<T>(): 공통 fetch 래퍼
│   │   │                         #   401 자동 갱신·재요청
│   │   │                         #   네트워크 에러 지수 백오프 재시도 (최대 3회)
│   │   ├── auth.ts               # 로그인·로그아웃·OAuth·토큰 갱신·회원탈퇴
│   │   ├── career.ts             # fetchCareerTiming()·fetchConsultation()
│   │   ├── company.ts            # fetchCompatibility()·searchCompany()
│   │   ├── feedback.ts           # submitFeedback()
│   │   └── mypage.ts             # fetchMyPage()·fetchAnalysisDetail()·deleteAnalysis()
│   ├── analysisCache.ts          # beforeunload로 새로고침/SPA 네비게이션 구분
│   ├── jwt.ts                    # JWT 파싱 유틸리티
│   ├── toast.ts                  # Sonner 토스트 헬퍼
│   ├── config/env.ts             # 환경 변수 타입 안전 접근
│   ├── server/bypass-header.ts   # 서버→백엔드 요청 내부 바이패스 헤더
│   └── validation/schemas.ts     # Zod 스키마 (입력 폼 검증)
│
├── services/
│   ├── auth/oauth.ts             # OAuth 리다이렉트 URL 생성
│   └── utils/
│       ├── formatters.ts         # 날짜·점수 포맷 유틸리티
│       └── validation.ts         # 순수 검증 함수
│
├── types/
│   ├── api.ts                    # ApiResponse<T>·모든 요청·응답 타입
│   ├── domain.ts                 # FavoredPeriod·FeedbackType·SajuData
│   └── errors.ts                 # ApiErrorCode enum·ERROR_MESSAGES 테이블
│
└── __tests__/                    # Jest 테스트
    ├── components/
    ├── hooks/
    ├── lib/
    ├── services/
    ├── stores/
    ├── types/
    └── utils/
```

---

## 백엔드 API

### 공통 응답 구조

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; requestId: string } | null;
  timestamp: number;
}
```

### 엔드포인트

모든 엔드포인트는 `POST`입니다.

| 엔드포인트                        | 훅                  | 타임아웃 |
| --------------------------------- | ------------------- | -------- |
| `POST /api/career/timing`         | `useCareerTiming`   | 10s      |
| `POST /api/career/consultation`   | `useConsultation`   | 15s (AI) |
| `POST /api/company/compatibility` | `useCompatibility`  | 10s      |
| `POST /api/feedback/satisfaction` | `useFeedback`       | 10s      |

브라우저는 Next.js Route Handler를 통해 백엔드와 통신합니다. accessToken은 서버에서 헤더에 주입됩니다.

---

## 인증

- 이메일/패스워드 회원가입·로그인 구현
- `accessToken`: Zustand 메모리에만 보관 — XSS 방어
- `refreshToken`: HttpOnly 쿠키 — JS 접근 불가
- `isLoggedIn`, `user`: localStorage 영속 — 새로고침 후 UI 상태 유지
- 미들웨어 리다이렉트 없이 클라이언트(`useAuthGuard`)가 로그인 모달 표시

---

## 에러 처리

**1계층 — `lib/api/client.ts`**
- `ApiError(statusCode, errorCode, message, requestId)` 구조화
- 네트워크·타임아웃: 지수 백오프 재시도 (1s → 2s → 4s, 최대 3회)
- 401 감지 시 자동 토큰 갱신 → 재요청, 갱신 실패 시 로그아웃 + 로그인 모달

**2계층 — `hooks/useErrorHandler.ts`**
- `ApiError.errorCode` → `types/errors.ts` `ERROR_MESSAGES` 테이블 → 한국어 메시지
- `isRetryable()` 로 재시도 가능 여부 판단

**3계층 — 전역**

| 위치 | 역할 |
| ---- | ---- |
| `GlobalErrorHandler` | `window.onerror` + `unhandledrejection` → `errorStore` 기록 |
| `ErrorBoundary` | React 렌더링 에러 캐치 → 재시도·홈 이동 UI |
| `app/error.tsx` | Next.js 라우트 수준 에러 바운더리 |

---

## 성능 최적화

- **`useCallback` / `useMemo`**: 핵심 훅 함수·목록 정렬·탭 필터링 메모이제이션
- **`useRef`**: 중복 요청 방지 플래그(`isRequestingRef`), debounce 타이머 ID
- **Debounce 300ms**: 기업 자동완성 (`useCompanyAutocomplete`)
- **`analysisCache`**: `beforeunload` 이벤트로 새로고침 감지 → sessionStorage 캐시로 API 재호출 방지
- **React Query staleTime 5분**: 마이페이지 재방문 시 캐시 사용
- **Token refresh 잠금**: `refreshPromise` 변수로 동시 401 발생 시 갱신 1회만 실행
- **`next/dynamic`**: `FullPageCompatibility`, `FullPageConsultation` 코드 스플리팅
- **`IntersectionObserver`**: 마이페이지 무한 스크롤

---

## 테스트

```bash
npm test              # 전체 실행 (커버리지 포함)
npm run test:watch    # 감시 모드
```

커버리지 목표: Lines 80% / Branches 50% / Functions 50%

MSW는 사주 분석 API(career, company)에만 적용하며, 인증·피드백은 실제 API를 호출합니다.

---

## 커밋 규칙

```
feat: 관운 분석 페이지 추가

[Build Passed]
```

- Prefix: `feat` `fix` `refactor` `chore` `docs` `style` `ui`
- 빌드 미통과 WIP 커밋: 제목에 `[WIP]` 추가, push 금지
- 브랜치명: `feat/career-timing-page`, `fix/form-validation` (영어 kebab-case)

---

## 환경 변수

| 변수                              | 용도                    | 예시                                        |
| --------------------------------- | ----------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`        | Spring Boot 백엔드 주소 | `http://localhost:8080`                     |
| `NEXT_PUBLIC_OAUTH_REDIRECT_URI`  | OAuth 콜백 URI          | `http://localhost:3000/api/auth/callback`   |

---

## 문서

| 문서 | 내용 |
| ---- | ---- |
| [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md) | 전체 API 엔드포인트·요청·응답 명세 |
| [docs/FRONTEND_API_GUIDE.md](docs/FRONTEND_API_GUIDE.md) | 프론트엔드 API 연동 가이드 |
| [docs/FRONTEND_UI_LAYOUT.md](docs/FRONTEND_UI_LAYOUT.md) | 페이지별 UI 레이아웃 |
| [docs/architecture-guide.md](docs/architecture-guide.md) | 4계층 아키텍처 원칙 |
| [docs/code-style-guide.md](docs/code-style-guide.md) | TypeScript·React 코드 스타일 |
| [docs/git-workflow.md](docs/git-workflow.md) | Git 브랜치·커밋 규칙 |
