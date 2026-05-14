# Research & Design Decisions: SSAju Frontend (001-ssaju-complete)

**Created**: 2026-05-11 | **Updated**: 2026-05-13  
**Phase**: 0 (Research) → 1 (Design)  
**Basis**: Spec clarifications Q1-Q5 (2026-05-11), Q6 fullpage.js (2026-05-13), Constitution v2.6.0, CLAUDE.md architecture

---

## Summary of Clarifications (Q1-Q5)

All critical ambiguities resolved via 5 clarification sessions (documented in `/Users/glory/.claude/projects/-Users-glory/memory/clarification_result_2026_05_11.md`). No further research blockers.

---

## Design Decisions

### D1: Global State Management (Zustand vs Props-only)

**Decision**: Zustand 4.4+ with 5 separate stores  
**Why Chosen**:
- FR-018: AI consultation 8탭 중 1개만 로드 + 7개 캐시 → 0.2초 탭 전환 (useConsultationStore)
- sessionStore: sajuResultId 영속성 보증 (페이지 새로고침 후 복원)
- authStore: OAuth 토큰 관리 (HttpOnly Cookie + sessionStorage 이중화)
- analysisStore: 현재 분석 결과 상태 (분석 중 → 완료 → 저장 대기)
- errorStore: 전역 에러 메시지 + 토스트 (Sonner 토스트 발동)

**Alternatives Considered**:
- Props 올리기: 70층 계층 복잡도 (불가능)
- Redux: 보일러플레이트 과다, 팀 선호도 낮음
- Context API: 성능 최적화 어려움 (FR-018의 0.2s 달성 불가)

**Rationale**: Zustand는 가볍고 성능이 우수하며, Spec의 성능 요구사항(0.2s 탭 전환)을 충족하는 유일한 솔루션.

**Note**: Constitution v1.0 "No global state libraries (Phase 1)" 제약을 override (정당한 이유: 성능 + 기능 요구사항)

---

### D2: API Client Architecture (Centralized apiFetch<T>)

**Decision**: `lib/api/client.ts` 중앙화 래퍼 + 5가지 모듈 분리  
**Why Chosen**:
- 에러 처리 통일 (ApiResponse<T> 타입 검증)
- 인증 토큰 자동 주입 (Authorization 헤더)
- Q5 재시도 정책: timeout/network 에러만 재시도 (exponential backoff 1s-2s-4s)
- 로깅/모니터링 통일점 제공
- 타입 안전성 (Zod 런타임 검증)

**Module Structure**:
- `lib/api/client.ts`: apiFetch<T>() wrapper (base)
- `lib/api/career.ts`: fetchCareerTiming(), fetchConsultation()
- `lib/api/company.ts`: fetchCompatibility()
- `lib/api/feedback.ts`: submitFeedback()
- `lib/api/auth.ts`: OAuth callback handling

**Alternatives Considered**:
- 직접 fetch 호출: 에러 처리 불일치, 인증 토큰 누락 위험
- axios: 번들 크기 증가, 팀 선호도 낮음 (Phase 1 제약)
- React Query: 초기 학습 곡선, Phase 1 제약 (no third-party HTTP libraries)

**Rationale**: Next.js 내장 fetch API + 커스텀 래퍼는 최소 의존성으로 최대 제어 가능.

---

### D3: Authentication: OAuth + HttpOnly Cookie + sessionStorage

**Decision**: Dual-storage strategy
- **HttpOnly Cookie**: 백엔드 검증용 (CSRF 보호, 서버 인증)
- **sessionStorage**: 프론트엔드 로직용 (useAuthStore)
- **Q1 명확화**: 비로그인→로그인 전환 시 현재 분석 결과 자동 저장

**Why Chosen**:
- Security: HttpOnly Cookie는 XSS 공격으로부터 보호
- UX: sessionStorage로 즉시 로그인 상태 반영 (새로고침 후에도 복원)
- OAuth: 카카오/구글 팝업 (redirect 아님, Q2 명확화)
- Token Refresh: Q5 정책 적용 (timeout/network만 재시도)

**Alternatives Considered**:
- localStorage: XSS 공격 취약점
- 로컬 변수: 새로고침 시 상태 손실
- OAuth redirect flow: UX 저하 (팝업이 더 우수)

**Rationale**: HttpOnly + sessionStorage 조합이 security + UX 최적화 솔루션.

---

### D4: Form Validation: Zod Runtime Schemas

**Decision**: Zod 3.22+ for all API request/response validation  
**Why Chosen**:
- 런타임 타입 검증 (TypeScript 타입만으로는 불충분)
- 깔끔한 API (z.object, z.string, z.coerce.date 등)
- 에러 메시지 한국화 가능
- 모든 API 요청 스키마 정의 (request/response)

**Schema Locations**:
- `lib/api/schemas.ts`: 모든 공통 스키마
- `types/api.ts`: 추출된 TypeScript 타입

**Alternatives Considered**:
- Manual validation: 보일러플레이트 과다
- joi: Node.js 라이브러리 (브라우저 미지원)
- TypeScript-only: 런타임 검증 불가

**Rationale**: Zod는 TypeScript-first validation으로 DX + 타입 안전성 제공.

---

### D5: Styling: Tailwind CSS + Custom Color Palette (Starry Night Theme)

**Decision**: Tailwind 3.3+ with custom `tailwind.config.ts` color extension  
**Color Palette**:
```
night-900: #0a0e27 (deepest background)
night-800: #1a1f3a (secondary background)
night-700: #2a3050 (tertiary)
star-500: #ffd700 (gold accent - bright)
star-400: #ffed4e (gold accent - medium)
star-300: #fff8a8 (gold accent - light)
```

**Why Chosen**:
- FR-049, FR-050, FR-051: "별이 빛나는 밤" 테마 시각적 일관성
- Tailwind utility-first approach: CSS Modules 없이 빠른 개발
- 반응형 디자인: sm/md/lg 브레이크포인트 자동 지원

**Typography**:
- **Font Family**: Pretendard Sans (본문), Garamond Serif (제목)
- **Font Sizes**:
  - 데스크톱: 본문 16px, 제목 28-32px
  - 태블릿: 본문 15px, 제목 24px
  - 모바일: 본문 14px, 제목 20px

**Alternatives Considered**:
- CSS Modules: 유지보수 복잡, Tailwind 성능 우수
- Styled-components: 런타임 오버헤드
- UnocSS: Next.js 생태계 미성숙

**Rationale**: Tailwind는 Next.js 표준 선택 + 번들 최적화 + 팀 역량.

---

### D6: Testing Strategy: Jest 80% + MSW Mocking

**Decision**: Jest 29+ with React Testing Library + MSW (Mock Service Worker)  
**Why Chosen**:
- **Unit Tests**: Components, Hooks, API functions 개별 테스트
- **Integration Tests**: 전체 API flow (MSW mock) 검증
- **E2E Tests** (Manual/Playwright later): Animation timing (1.5s disclaimer, 500ms fade)
- **Coverage Goal**: 80% minimum (src/ 기준)

**MSW Configuration**:
- `lib/mocks/handlers.ts`: API endpoint mocks
- `lib/mocks/server.ts`: MSW server setup
- `jest.config.ts`: Jest + Next.js config

**Alternatives Considered**:
- No mocking (real backend): 테스트 속도 저하, flakiness
- Sinon/Nock: MSW가 더 현대적, 관리 용이
- Cypress (E2E only): Jest 단위 테스트 불가

**Rationale**: Jest + MSW는 빠른 개발 속도 + 신뢰할 수 있는 테스트 조합.

---

### D7: Animation Timing (1.5s Disclaimer + 500ms Fade)

**Decision**: Fixed timing with CSS transitions + setTimeout orchestration  
**Spec Requirements** (FR-055, FR-056):
- 고지 문구 오버레이: 1.5초 자동 노출 (페이드 인)
- 전환 애니메이션: 500ms ease-in-out (고지 페이드 아웃 + 로딩 페이드 인 동시)
- 사용자 입력 차단: 고지 문구 노출 중 터치/클릭 불가
- 반응형 폰트:
  - 데스크톱: 28px
  - 태블릿: 24px
  - 모바일: 20px

**Implementation Approach**:
- `components/DisclaimerOverlay.tsx`: Overlay 렌더링 + CSS transition
- `hooks/useDisclaimerTiming.ts`: setTimeout 1500ms 타이머 (1.5s 경과 시 fadeOut 발동)
- CSS transition: `transition: opacity 500ms ease-in-out`

**Why Chosen**:
- Native CSS transitions: 60fps 성능 보장 (GPU 가속)
- setTimeout 정확도: 1500ms ± 50ms 허용 범위
- 브라우저 호환성: 모든 최신 브라우저 지원

**Alternatives Considered**:
- Framer Motion: 과도한 라이브러리 (Tailwind로 충분)
- requestAnimationFrame: 복잡도 증가 (CSS transition이 더 간단)

**Rationale**: CSS transition + setTimeout 조합이 가장 단순하고 성능이 우수함.

---

### D8: Infinite Scroll (Q3 명확화: threshold 0.5)

**Decision**: Intersection Observer API + `react-intersection-observer` 라이브러리  
**Specification**:
- Threshold: 0.5 (요소의 50% 이상이 viewport에 진입 시 발동)
- 마이페이지 분석 기록 리스트: 페이지 하단 근처에서 자동 로드
- 로딩 상태: "더 불러오는 중..." 스피너 표시

**Why Chosen**:
- 성능: 폴링이 아닌 event-driven (CPU 절약)
- UX: 자동 로드로 사용자 클릭 불필요
- Q3 명확화: 0.5 threshold가 최적 (너무 이르지 않으면서도 자연스러움)

**Alternatives Considered**:
- Manual scroll listener: 성능 저하 (throttling 필요)
- Pagination buttons: Q3 결정에 위배
- 자동 로드 100% 도달: threshold 1.0은 늦음 (0.5가 더 우수)

**Rationale**: Intersection Observer + threshold 0.5는 성능 + UX 최적화.

---

### D9: Consultation Field Caching (Q4 명확화)

**Decision**: useConsultationStore에 8개 탭별 입력값 캐싱  
**Specification**:
- 각 탭(직업, 연애, 건강 등)별로 사용자 입력 저장
- 탭 전환 시 캐시에서 복원 (0.2초 즉시 표시)
- 페이지 새로고침 후 Zustand persist 플러그인으로 복원
- 입력값: 텍스트, 선택지, 슬라이더 등

**Why Chosen**:
- UX: 탭 전환 시 입력 손실 없음
- 성능: 캐시된 데이터 즉시 렌더링 (0.2s)
- 사용자 편의: 여러 탭 입력 후 한 번에 제출 가능

**Alternatives Considered**:
- 입력값 즉시 서버 저장: 지연 + 네트워크 부하
- 탭 전환 시 입력값 제거: UX 저하
- 세션 스토리지만 사용: 페이지 새로고침 후 손실

**Rationale**: Zustand 캐싱 + persist는 로컬 상태 지속성 보장.

---

### D10: Token Refresh Policy (Q5 명확화)

**Decision**: apiFetch<T>() 래퍼에 조건부 재시도 정책  
**Rules**:
- **재시도 대상**: timeout (10s 초과) 또는 network 에러만
- **재시도 횟수**: 최대 3회
- **Backoff 전략**: Exponential backoff (1s, 2s, 4s)
- **재시도 제외**: 
  - API 비즈니스 에러 (401 Unauthorized, 400 Bad Request 등)
  - 사용자 입력 검증 에러

**Why Chosen**:
- 신뢰성: 일시적 네트워크 오류 자동 복구
- UX: 사용자 대기 시간 최소화 (총 7초 이내)
- 안정성: 불필요한 재시도 제거 (비즈니스 에러는 즉시 실패)

**Alternatives Considered**:
- 모든 에러 재시도: 사용자 혼동 (401은 재시도 불가)
- 재시도 없음: 신뢰성 저하
- 무제한 재시도: 무한 대기 가능성

**Rationale**: Q5에서 확정된 정책 (timeout/network만 재시도)은 최적 균형.

---

## Decision Summary Table

| # | Area | Decision | Status | Evidence |
|---|------|----------|--------|----------|
| D1 | State Management | Zustand 5 stores | ✅ Confirmed (override justified) | Constitution override rationale |
| D2 | API Architecture | Centralized apiFetch<T> + 5 modules | ✅ Confirmed | plan.md Technical Context |
| D3 | Authentication | OAuth popup + HttpOnly + sessionStorage | ✅ Confirmed (Q1, Q2) | clarification_result_2026_05_11.md |
| D4 | Validation | Zod runtime schemas | ✅ Confirmed | spec.md FR-010 (validation) |
| D5 | Styling | Tailwind + Starry Night theme | ✅ Confirmed | spec.md FR-049~051 |
| D6 | Testing | Jest 80% + MSW mocking | ✅ Confirmed | plan.md Performance Goals |
| D7 | Animations | CSS transitions + setTimeout | ✅ Confirmed (Q1~5 integration) | clarification_result_2026_05_11.md FR-055/056 |
| D8 | Infinite Scroll | Intersection Observer (0.5 threshold) | ✅ Confirmed (Q3) | clarification_result_2026_05_11.md |
| D9 | Consultation Caching | useConsultationStore + Zustand persist | ✅ Confirmed (Q4) | clarification_result_2026_05_11.md |
| D10 | API Retry Policy | Q5 conditional retry (timeout/network) | ✅ Confirmed (Q5) | clarification_result_2026_05_11.md |

---

---

## 🛡️ 1. 보안 및 인증 (Security & Auth) 리서치

### R1: Next.js 14 App Router에서 HttpOnly 쿠키 + Authorization 헤더 혼용 패턴

**목표**: D3 결정 (HttpOnly + sessionStorage)을 안전하게 구현하되, 서버/클라이언트 컴포넌트 간 토큰 전달

**핵심 요구사항**:
- 로그인 토큰은 HttpOnly 쿠키만 사용 (자동 전송)
- Authorization 헤더는 개발 환경에서만 선택적 (로깅/디버깅)
- 서버 컴포넌트에서는 쿠키 직접 읽기 가능 (next/headers)
- 클라이언트 컴포넌트에서는 apiFetch만 사용

**구현 패턴**:

```typescript
// lib/api/client.ts - 중앙 apiFetch 래퍼
async function apiFetch<T>(
  path: string,
  options?: FetchOptions
): Promise<T> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`,
    {
      method: options?.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Q1: Authorization 헤더는 개발 환경에서만 선택사항
        ...(process.env.NODE_ENV === 'development' && {
          'Authorization': `Bearer ${getAccessTokenForLogging()}`
        })
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include',  // HttpOnly 쿠키 자동 포함
      signal: controller.signal
    }
  );
  
  // Zod 검증 + 에러 처리
  return validateAndThrow<T>(response);
}

// app/api/auth/callback.ts - OAuth 콜백 (서버)
// 백엔드에서 HttpOnly 쿠키 설정 후 프론트로 리다이렉트
export async function GET(request: NextRequest) {
  const { code, state } = Object.fromEntries(
    new URL(request.url).searchParams
  );
  
  // 백엔드 /api/auth/callback으로 code 전달
  // 백엔드가 HttpOnly 쿠키 설정하고 리다이렉트 응답
  const response = await apiFetch('/auth/callback', {
    method: 'POST',
    body: { code, state }
  });
  
  // 프론트에서는 쿠키 설정 안 함 (백엔드가 처리)
  return NextResponse.redirect(new URL('/career/timing', request.url));
}

// hooks/useAuthStatus.ts - 로그인 상태 확인
export function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // apiFetch 호출 시 HttpOnly 쿠키 자동 포함
    // 401 응답 = 비로그인, 200 응답 = 로그인됨
    apiFetch('/auth/check', { method: 'POST' })
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);
  
  return { isLoggedIn };
}
```

**주의사항**:
- ❌ 절대 sessionStorage/localStorage에 토큰 저장 금지 (XSS 취약)
- ❌ apiFetch 외부에서 Authorization 헤더 수동 추가 금지
- ✅ 모든 API 호출은 apiFetch<T>() 사용 (자동 credentials: 'include')

**참고 자료**:
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- HttpOnly 쿠키 보안: https://owasp.org/www-community/attacks/xss/

---

### R2: Spring Boot API와의 credentials: 'include' 시 CORS/SameSite 이슈 해결

**목표**: 외부 Spring Boot API (http://localhost:8080)와 안전하게 통신

**주요 이슈**:
1. **CORS 정책**: 프론트(localhost:3000) ≠ 백엔드(localhost:8080) → Preflight 요청 필수
2. **SameSite 쿠키**: credentials: 'include'는 SameSite=None; Secure 필요
3. **로컬 개발**: Secure 플래그는 HTTPS만 가능 → 개발 시 SameSite=Lax 대안

**해결 패턴**:

```typescript
// lib/api/client.ts - 환경별 fetch 옵션
async function apiFetch<T>(
  path: string,
  options?: FetchOptions
): Promise<T> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`,
    {
      method: options?.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Preflight 요청을 위한 필수 헤더
        'Accept': 'application/json',
      },
      // ✅ 크로스 오리진 요청에서 쿠키 포함
      credentials: 'include',
      
      // 타임아웃 설정 (Q5 정책)
      signal: AbortSignal.timeout(
        isProduction ? 10000 : 20000  // 개발: 20s, 프로덕션: 10s
      )
    }
  );
  
  // 응답 검증 및 에러 처리
  return validateAndThrow<T>(response);
}
```

**백엔드 (Spring Boot) 설정**:

```java
// WebConfig.java - CORS 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "https://yourdomain.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)  // ✅ 쿠키 허용
            .maxAge(3600);  // Preflight 캐시 1시간
    }
}

// OAuth 콜백 응답에 HttpOnly 쿠키 설정
@PostMapping("/api/auth/callback")
public ResponseEntity<?> callback(@RequestBody OAuthCallbackRequest req) {
    // ... OAuth 처리 ...
    
    ResponseCookie cookie = ResponseCookie
        .from("auth_token", accessToken)
        .httpOnly(true)  // ✅ XSS 방지
        .secure(isProduction)  // 프로덕션에서만 HTTPS 강제
        .sameSite(isProduction ? "Strict" : "Lax")  // 개발: Lax, 프로덕션: Strict
        .path("/")
        .maxAge(Duration.ofDays(7))
        .build();
    
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(new OAuthCallbackResponse(userId, name));
}
```

**트러블슈팅**:

| 증상 | 원인 | 해결책 |
|------|------|--------|
| 쿠키 전송 안 됨 | credentials 누락 | apiFetch에서 'include' 설정 확인 |
| CORS 에러 (OPTIONS 실패) | 백엔드 CORS 미설정 | Spring Boot CORS 설정 추가 |
| 쿠키 저장 안 됨 | SameSite=Strict (개발 환경) | SameSite=Lax로 변경 |
| Secure 플래그 오류 | HTTP + Secure 쿠키 | 개발 환경에서 Secure 제거 또는 HTTPS 사용 |

**최종 검증**:

```bash
# 개발 환경 테스트
curl -X POST http://localhost:3000/api/auth/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "xxx", "state": "yyy"}' \
  -v

# 쿠키 확인: Set-Cookie 헤더 검색
# Cookie: auth_token=...; Path=/; SameSite=Lax; HttpOnly
```

---

## 🚀 2. 상태 관리 및 성능 (State & Performance) 리서치

### R3: Zustand로 20개 필드 대형 객체의 리렌더링 최적화 및 탭 전환 0.2초 달성

**목표**: D9 (consultationStore)에서 19개 필드를 효율적으로 관리하고, 탭 전환을 <200ms로 보증

**문제**:
- 19개 필드 전체를 하나의 상태로 관리 → 1개 필드 변경 시 19개 모두 리렌더링
- 선택적 구독(Selector)을 사용하면 필드 변경 시 해당 필드만 리렌더링

**해결 패턴 - Selector 기반 구독**:

```typescript
// lib/stores/consultation.ts - consultationStore
interface ConsultationState {
  // 19개 필드
  recommendedIndustries: string[];
  interviewTips: string[];
  strengths: string[];
  sajuProfile: SajuProfile;
  wealthStyle: WealthStyle;
  careerRoadmap: CareerRoadmap;
  branding: Branding;
  monthlyForecast: MonthlyForecast[12];
  
  // 메타데이터
  lastFetchedId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setConsultation: (data: ConsultationState) => void;
  getFieldValue: <K extends keyof ConsultationState>(key: K) => ConsultationState[K];
  clearData: () => void;
}

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  // 초기 상태
  recommendedIndustries: [],
  interviewTips: [],
  strengths: [],
  sajuProfile: {} as SajuProfile,
  wealthStyle: {} as WealthStyle,
  careerRoadmap: {} as CareerRoadmap,
  branding: {} as Branding,
  monthlyForecast: [],
  lastFetchedId: null,
  isLoading: false,
  error: null,
  
  setConsultation: (data) => set(data),
  getFieldValue: (key) => get()[key],
  clearData: () => set({
    recommendedIndustries: [],
    interviewTips: [],
    // ... 모든 필드 리셋
    lastFetchedId: null,
  }),
}));

// Selector 정의 - 특정 필드만 구독
export const selectRecommendedIndustries = (state: ConsultationState) => 
  state.recommendedIndustries;

export const selectSajuProfile = (state: ConsultationState) => 
  state.sajuProfile;

export const selectMonthlyForecast = (state: ConsultationState) => 
  state.monthlyForecast;

export const selectIsLoading = (state: ConsultationState) => 
  state.isLoading;
```

**컴포넌트에서 사용 - 선택적 구독**:

```typescript
// components/consultation/IndustriesTab.tsx - 추천산업 탭만 렌더링
export function IndustriesTab() {
  // ✅ 추천산업 필드만 변경될 때 리렌더링
  const industries = useConsultationStore(selectRecommendedIndustries);
  
  return (
    <div>
      {industries.map((industry) => (
        <div key={industry}>{industry}</div>
      ))}
    </div>
  );
}

// components/consultation/SajuProfileTab.tsx - 사주프로필 탭만 렌더링
export function SajuProfileTab() {
  // ✅ 사주프로필 필드만 변경될 때 리렌더링
  const sajuProfile = useConsultationStore(selectSajuProfile);
  
  return (
    <div>
      <h3>{sajuProfile.dayPillar} (천간)</h3>
      <p>{sajuProfile.personality}</p>
    </div>
  );
}

// 성능 최적화: 여러 필드를 하나의 객체로 결합 (필요시)
export const selectProfileAndForecast = (state: ConsultationState) => ({
  profile: state.sajuProfile,
  forecast: state.monthlyForecast,
});

export function CombinedTab() {
  // 두 필드 중 하나라도 변경 시 리렌더링 (이상적이 아님)
  const { profile, forecast } = useConsultationStore(selectProfileAndForecast);
  // ...
}
```

**탭 전환 성능 보증 (<200ms)**:

```typescript
// hooks/useConsultation.ts - 초기 로드 및 탭 관리
export function useConsultation(sajuResultId: string) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const setConsultation = useConsultationStore((s) => s.setConsultation);
  const lastFetchedId = useConsultationStore((s) => s.lastFetchedId);
  
  // 초기 로드: 한 번의 API 호출로 19개 필드 전체 수신
  useEffect(() => {
    if (lastFetchedId === sajuResultId) {
      // ✅ 이미 로드됨 (캐시 히트)
      return;
    }
    
    setLoading(true);
    apiFetch<ConsultationData>('/api/career/consultation', {
      method: 'POST',
      body: { sajuResultId },
      timeout: 20000  // 20초 (AI 분석)
    })
      .then((data) => {
        // ✅ 19개 필드를 한 번에 저장
        setConsultation({
          recommendedIndustries: data.recommendedIndustries,
          interviewTips: data.interviewTips,
          strengths: data.strengths,
          sajuProfile: data.sajuProfile,
          wealthStyle: data.wealthStyle,
          careerRoadmap: data.careerRoadmap,
          branding: data.branding,
          monthlyForecast: data.monthlyForecast,
          lastFetchedId: sajuResultId,
          isLoading: false,
        });
      })
      .catch((error) => {
        setLoading(false);
        // 에러 처리
      });
  }, [sajuResultId]);
  
  // 탭 전환: 메모리에서 즉시 조회
  const handleTabChange = (index: number) => {
    // ✅ <100ms (메모리 접근만)
    setSelectedTabIndex(index);
  };
  
  return {
    selectedTabIndex,
    loading,
    handleTabChange,
  };
}

// 성능 측정
export function ConsultationPage() {
  const { selectedTabIndex, handleTabChange } = useConsultation(sajuResultId);
  const startTime = useRef(0);
  
  const onTabChangeWithMetrics = (index: number) => {
    startTime.current = performance.now();
    handleTabChange(index);
    
    requestAnimationFrame(() => {
      const duration = performance.now() - startTime.current;
      console.log(`탭 전환: ${duration.toFixed(2)}ms`);
      // 목표: <200ms
    });
  };
  
  return <TabNavigation onTabChange={onTabChangeWithMetrics} />;
}
```

**성능 검증 (E2E 테스트)**:

```typescript
// __tests__/e2e/consultation.performance.spec.ts
import { test, expect } from '@playwright/test';

test('탭 전환이 200ms 이내에 완료되어야 함', async ({ page }) => {
  await page.goto('/consultation/saju123');
  await page.waitForLoadState('networkidle');
  
  // 각 탭으로 전환하며 성능 측정
  const metrics: number[] = [];
  
  for (let i = 0; i < 8; i++) {
    const startTime = Date.now();
    
    // i번째 탭 클릭
    await page.locator(`[data-tab-index="${i}"]`).click();
    
    // 탭 콘텐츠가 보여질 때까지 대기 (하지만 대부분은 즉시)
    await page.locator(`[data-content-index="${i}"]`).isVisible();
    
    const duration = Date.now() - startTime;
    metrics.push(duration);
    
    // ✅ 각 탭 전환이 200ms 이내
    expect(duration).toBeLessThan(200);
  }
  
  // 평균도 확인
  const avgDuration = metrics.reduce((a, b) => a + b, 0) / metrics.length;
  console.log(`평균 탭 전환: ${avgDuration.toFixed(2)}ms`);
  expect(avgDuration).toBeLessThan(150);
});
```

---

### R4: 비로그인 사용자의 휘발성 데이터 안전한 초기화 패턴

**목표**: sessionStore의 분석 결과를 메모리에만 보관하고, 로그아웃/페이지 종료 시 안전하게 초기화

**요구사항**:
- 비로그인 분석 데이터는 sessionStorage에 저장하지 않음 (Q1)
- 페이지 새로고침 시 데이터 소실되지만, 피드백은 sajuResultId로 추적 가능
- 로그아웃 시 모든 분석 데이터 초기화
- 페이지 이탈 시 확인 모달 (미저장 데이터 경고)

**구현 패턴**:

```typescript
// lib/stores/analysis.ts - analysisStore (메모리 전용)
interface AnalysisState {
  careerTiming: {
    inputs: CareerTimingRequest | null;
    result: CareerTimingResult | null;
    loading: boolean;
    error: string | null;
  };
  compatibility: {
    inputs: CompatibilityRequest | null;
    result: CompatibilityResult | null;
    loading: boolean;
    error: string | null;
  };
  
  // 액션
  setCareerTiming: (data: CareerTimingResult) => void;
  setCompatibility: (data: CompatibilityResult) => void;
  reset: () => void;  // 로그아웃 시 호출
}

const initialState = {
  careerTiming: { inputs: null, result: null, loading: false, error: null },
  compatibility: { inputs: null, result: null, loading: false, error: null },
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  ...initialState,
  
  setCareerTiming: (result) => set(state => ({
    careerTiming: { ...state.careerTiming, result, loading: false }
  })),
  
  setCompatibility: (result) => set(state => ({
    compatibility: { ...state.compatibility, result, loading: false }
  })),
  
  // ✅ 안전한 전체 초기화
  reset: () => set(initialState),
}));
```

**로그아웃 시 초기화**:

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const logout = useCallback(async () => {
    try {
      // 백엔드에 로그아웃 요청
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      // 모든 상태 초기화 (성공 여부 상관없이)
      useAuthStore.setState({ isLoggedIn: false, user: null });
      useAnalysisStore.getState().reset();  // ✅ 분석 데이터 초기화
      useSessionStore.getState().clearSession();  // sessionStore도 초기화
      useConsultationStore.getState().clearData();  // consultation 캐시도 초기화
      
      // 로그인 페이지로 리다이렉트
      router.push('/');
    }
  }, [router]);
  
  return { logout };
}
```

**페이지 이탈 확인 모달 (비로그인만)**:

```typescript
// hooks/usePageExitGuard.ts
export function usePageExitGuard() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const analysisData = useAnalysisStore((s) => s.careerTiming.result);
  
  useEffect(() => {
    if (isLoggedIn) return;  // 로그인되면 경고 없음
    if (!analysisData) return;  // 분석 데이터 없으면 경고 없음
    
    // ✅ beforeunload: 탭 종료, 새로고침
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoggedIn, analysisData]);
  
  // ✅ beforePopState: 라우터 변경 (뒤로가기 등)
  useEffect(() => {
    if (isLoggedIn || !analysisData) return;
    
    const handleBeforePopState = () => {
      const confirmed = window.confirm(
        '지금 나가시면 분석 결과가 삭제됩니다. 정말 나가시겠습니까?'
      );
      
      if (!confirmed) {
        // 라우터 변경 취소
        router.push(router.asPath);
        return false;
      }
      
      // 확인 시 분석 데이터 초기화
      useAnalysisStore.getState().reset();
      return true;
    };
    
    router.events.on('beforePopState', handleBeforePopState);
    
    return () => {
      router.events.off('beforePopState', handleBeforePopState);
    };
  }, [isLoggedIn, analysisData]);
}

// app/layout.tsx에서 호출
export default function RootLayout({ children }) {
  usePageExitGuard();
  return <>{children}</>;
}
```

**테스트 시나리오**:

```typescript
// __tests__/integration/analysis-volatility.spec.ts
import { render, screen } from '@testing-library/react';
import { useAnalysisStore } from '@/lib/stores/analysis';

describe('비로그인 휘발성 데이터 관리', () => {
  it('페이지 새로고침 시 분석 데이터가 소실되어야 함', () => {
    // 1. 분석 데이터 저장
    useAnalysisStore.setState({
      careerTiming: {
        result: { timing: 'H1', confidence: 85 },
      },
    });
    
    // 2. sessionStorage 확인 (저장되지 않아야 함)
    expect(sessionStorage.getItem('analysisStore')).toBeNull();
    
    // 3. 메모리에만 존재
    expect(useAnalysisStore.getState().careerTiming.result).toBeDefined();
  });
  
  it('로그아웃 시 모든 데이터가 초기화되어야 함', () => {
    // 1. 데이터 저장
    useAnalysisStore.setState({
      careerTiming: {
        result: { timing: 'H1', confidence: 85 },
      },
    });
    
    // 2. 로그아웃 호출
    useAnalysisStore.getState().reset();
    
    // 3. 모든 데이터 초기화
    expect(useAnalysisStore.getState().careerTiming.result).toBeNull();
  });
  
  it('로그인 시 비로그인 분석 결과가 자동 저장되어야 함', async () => {
    // 1. 비로그인 상태에서 분석
    useAnalysisStore.setState({
      careerTiming: {
        result: { timing: 'H1', confidence: 85 },
      },
    });
    
    // 2. 로그인 (useAutoSaveOnLogin 훅 발동)
    const mockSave = jest.fn();
    // ... 로그인 시뮬레이션 ...
    
    // 3. 백엔드에 저장됨
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        timing: 'H1',
        confidence: 85,
      });
    });
  });
});
```

---

## 🎨 3. 시각적 경험 및 애니메이션 (Visuals & Animation) 리서치

### R5: Framer Motion으로 1.5초 고지 문구 → 로딩 바 Smooth Transition

**목표**: FR-055/056 (고지 문구 오버레이 1.5초) + FR-057 (로딩 바)의 부드러운 전환

**타이밍 시퀀스**:
```
0ms     → 고지 문구 fade-in (opacity 0→1, 500ms)
0-1500ms → 고지 문구 표시 유지
1500ms  → 동시에 고지 fade-out + 로딩 spinner fade-in (500ms, ease-in-out)
2000ms  → 고지 제거, 로딩 spinner 완전 표시
```

**구현 패턴 (Framer Motion)**:

```typescript
// hooks/useDisclaimerTimer.ts - 타이밍 관리
export function useDisclaimerTimer(onComplete?: () => void) {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  useEffect(() => {
    // 1500ms 후 페이드 아웃 시작
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);  // CSS 클래스 추가
      setShowLoading(true);  // 로딩 스피너 표시 시작
    }, 1500);
    
    // 2000ms 후 고지 문구 제거
    const removeTimer = setTimeout(() => {
      setShowDisclaimer(false);
      onComplete?.();
    }, 2000);
    
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);
  
  return { showDisclaimer, showLoading, isFadingOut };
}

// components/results/DisclaimerOverlay.tsx - Framer Motion 애니메이션
import { motion, AnimatePresence } from 'framer-motion';

export function DisclaimerOverlay({
  isVisible,
  onFadeOutComplete,
}: DisclaimerOverlayProps) {
  const { showDisclaimer, showLoading, isFadingOut } = useDisclaimerTimer(
    onFadeOutComplete
  );
  
  return (
    <AnimatePresence mode="wait">
      {showDisclaimer && (
        <motion.div
          key="disclaimer"
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
            isFadingOut ? 'fade-out' : ''
          }`}
          // ✅ 초기: opacity 0
          initial={{ opacity: 0 }}
          // ✅ 진입: 500ms ease-in-out
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
          }}
          // ✅ 퇴출: 500ms ease-in-out (isFadingOut 시)
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center"
            // ✅ 텍스트도 함께 페이드 아웃
            animate={isFadingOut ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {/* 반응형 폰트 크기 (Tailwind) */}
            <p className="text-lg md:text-xl lg:text-2xl text-white font-garamond">
              본 사주는 재미로 보는 것이니 참고만 바랍니다
            </p>
          </motion.div>
        </motion.div>
      )}
      
      {/* ✅ 동시에 로딩 스피너 fade-in */}
      {showLoading && (
        <motion.div
          key="loading"
          // 초기: opacity 0
          initial={{ opacity: 0 }}
          // 진입: 500ms ease-in-out
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
          }}
          className="fixed inset-0 flex items-center justify-center z-40"
        >
          <LoadingSpinner />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// components/results/LoadingSpinner.tsx - 로딩 바
export function LoadingSpinner() {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      // ✅ 무한 회전 애니메이션
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ✅ 별 아이콘 회전 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="text-star-500 text-4xl"
      >
        ★
      </motion.div>
      
      {/* ✅ 진행 바 */}
      <motion.div className="w-48 h-2 bg-night-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-star-300 via-star-400 to-star-500"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
      
      {/* ✅ 로딩 문구 */}
      <p className="text-white text-sm">AI 분석 중입니다...</p>
    </motion.div>
  );
}
```

**CSS Fallback (Framer Motion 없이)**:

```css
/* styles/animations.css */

/* 고지 문구: 페이드 인 */
@keyframes disclaimerFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 고지 문구: 페이드 아웃 */
@keyframes disclaimerFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 로딩 스피너: 페이드 인 */
@keyframes spinnerFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 로딩 바: 무한 슬라이드 */
@keyframes barSlide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.disclaimer-overlay {
  animation: disclaimerFadeIn 0.5s ease-in-out forwards;
}

.disclaimer-overlay.fade-out {
  animation: disclaimerFadeOut 0.5s ease-in-out forwards;
}

.loading-spinner {
  animation: spinnerFadeIn 0.5s ease-in-out forwards;
}

.progress-bar {
  animation: barSlide 1.5s ease-in-out infinite;
}

.spinner-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

**성능 최적화**:

```typescript
// 60fps 보장을 위한 최적화
// 1. will-change 속성으로 GPU 가속 강제
const disclaimerStyle = {
  willChange: 'opacity',  // ✅ GPU 가속
};

// 2. Framer Motion에서 transform 사용 (left/width 아님)
<motion.div
  animate={{ opacity: 1, x: 0 }}  // ✅ 빠름
  // animate={{ opacity: 1, left: '0px' }}  // ❌ 느림
/>

// 3. 불필요한 리렌더링 방지 (useMemo)
const MemoizedLoadingSpinner = memo(LoadingSpinner);
```

**성능 측정**:

```typescript
// E2E 테스트
test('고지 문구 애니메이션이 1500ms±50ms에 완료되어야 함', async ({
  page,
}) => {
  const startTime = Date.now();
  
  await page.goto('/career/timing');
  await page.fill('[name="birthDate"]', '1990-10-10');
  await page.click('button:has-text("분석하기")');
  
  // 고지 문구 표시 확인
  await page.locator('.disclaimer-overlay').waitFor({ state: 'visible' });
  
  // 1500ms 후 페이드 아웃 시작 확인
  await page.waitForTimeout(1400);
  let opacity = await page.evaluate(
    () => getComputedStyle(document.querySelector('.disclaimer-overlay')).opacity
  );
  expect(parseFloat(opacity)).toBe(1);  // 아직 보임
  
  // 1600ms 후 페이드 아웃 진행 중
  await page.waitForTimeout(200);
  const animationTime = Date.now() - startTime;
  expect(animationTime).toBeLessThan(1600);  // 1.5초 + 여유
  
  // 로딩 스피너 페이드 인 확인
  await page.locator('.loading-spinner').waitFor({
    state: 'visible',
    timeout: 500,
  });
});
```

---

### R6: Tailwind + Framer Motion으로 별 입자(Particle) 배경의 GPU 가속 구현

**목표**: '별이 빛나는 밤' 테마의 배경 애니메이션을 60fps로 유지

**문제**:
- 수십~수백 개의 별 요소 → DOM 무거움
- CSS 애니메이션으로 각 별을 제어 → CPU 부하 증가
- 솔루션: Canvas 또는 제한된 수의 요소 + GPU 가속

**해결 방법 1: Canvas 기반 배경 (권장)**:

```typescript
// components/shared/StarfieldBackground.tsx - Canvas 기반
export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Canvas 크기 = 윈도우 크기
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 별 데이터
    const stars: Star[] = [];
    const starCount = 200;  // 수백 개도 무겁지 않음
    
    // 별 생성
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    
    // ✅ RequestAnimationFrame으로 부드러운 60fps
    let animationFrameId: number;
    
    const animate = (timestamp: number) => {
      // 배경 초기화 (밤 하늘 색상)
      ctx.fillStyle = '#0a0e27';  // night-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 각 별 렌더링
      stars.forEach((star) => {
        // ✅ 반짝임 효과 (twinkle animation)
        const twinkle =
          Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
        
        ctx.fillStyle = `rgba(255, 237, 74, ${star.opacity * twinkle})`;  // star-400
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    // 윈도우 리사이즈 처리
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

// app/layout.tsx에서 사용
export default function RootLayout({ children }) {
  return (
    <div className="bg-night-900">
      <StarfieldBackground />
      {children}
    </div>
  );
}
```

**해결 방법 2: Tailwind + Framer Motion (제한된 수의 별)**:

```typescript
// components/shared/StarBackground.tsx - DOM 기반 (50개 정도만)
import { motion } from 'framer-motion';

export function StarBackground() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 3 + 2,  // 2-5초
    delay: Math.random() * 2,
  }));
  
  return (
    <div className="fixed inset-0 bg-night-900 pointer-events-none" style={{ zIndex: -1 }}>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute w-1 h-1 rounded-full bg-star-400"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            // ✅ willChange로 GPU 가속 강제
            willChange: 'opacity',
          }}
          // ✅ 반짝임 애니메이션
          animate={{
            opacity: [0.3, 1, 0.3],  // 어둡게 → 밝게 → 어둡게
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
```

**성능 프로파일링**:

```typescript
// 성능 측정 (Chrome DevTools와 동일)
function measureStarfieldPerformance() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
  
  // 프레임 레이트 측정
  performance.mark('star-animation-start');
  
  requestAnimationFrame(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = (frameCount * 1000) / (currentTime - lastTime);
        console.log(`FPS: ${fps.toFixed(1)}`);  // 목표: 60fps
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFrame);
    };
    
    measureFrame();
  });
}
```

**최종 선택**: Canvas 방식 권장
- ✅ 수백 개 별도 부드럽게 렌더링
- ✅ 60fps 안정적 유지
- ✅ CPU 부하 최소화
- ❌ 약간의 복잡도 증가 (JavaScript 코드)

---

## 🧪 4. 테스트 및 워크플로우 (Testing & Workflow) 리서치

### R7: Next.js 14 + MSW v2.0 + Jest + React Testing Library 통합

**목표**: 헌법 v2.5.1의 테스트 우선 개발 워크플로우 ([목업 → 테스트 → API])

**최종 구성**:
```
jest.config.ts
├─ jest.preset.js (jest-environment-jsdom)
├─ jest.setup.ts (MSW 초기화, @testing-library/jest-dom 로드)
├─ tsconfig.json (jest 경로 매핑)
└─ mocks/
   ├─ server.ts (MSW 서버)
   ├─ handlers/ (엔드포인트별 핸들러)
   └─ data/ (목업 데이터)
```

**설정 파일**:

```javascript
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/__tests__/**',
  ],
  // ✅ 커버리지 임계값 (헌법: 80%)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
```

```typescript
// src/__tests__/setup.ts - MSW + Jest 초기화
import '@testing-library/jest-dom';
import { server } from '@/mocks/server';

// ✅ 모든 테스트 전에 MSW 서버 시작
beforeAll(() => server.listen());

// ✅ 각 테스트 후 핸들러 초기화 (상태 격리)
afterEach(() => server.resetHandlers());

// ✅ 모든 테스트 후 서버 종료
afterAll(() => server.close());
```

```typescript
// src/mocks/server.ts - MSW 2.0 서버
import { setupServer } from 'msw/node';
import * as handlers from './handlers';

export const server = setupServer(
  // 모든 핸들러 등록
  ...Object.values(handlers)
    .flatMap((h) => Array.isArray(h) ? h : [h])
);
```

```typescript
// src/mocks/handlers/index.ts
export * from './career';
export * from './company';
export * from './auth';
export * from './feedback';

// src/mocks/handlers/career.ts
import { http, HttpResponse } from 'msw';
import { mockCareerTimingData, mockConsultationData } from '@/mocks/data';

export const careerHandlers = [
  // ✅ POST /api/career/timing
  http.post(`${API_BASE}/api/career/timing`, async ({ request }) => {
    // 요청 검증
    const body = await request.json() as CareerTimingRequest;
    
    // 검증 실패 시뮬레이션
    if (!body.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate)) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'INVALID_DATE_FORMAT', message: '...' },
        },
        { status: 400 }
      );
    }
    
    // ✅ 성공 응답
    return HttpResponse.json(
      {
        success: true,
        data: mockCareerTimingData,
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  }),
  
  // ✅ POST /api/career/consultation (타임아웃 시뮬레이션)
  http.post(`${API_BASE}/api/career/consultation`, async ({ request }) => {
    // 20초 지연으로 타임아웃 테스트
    await new Promise((resolve) => setTimeout(resolve, 20000));
    
    return HttpResponse.json({
      success: true,
      data: mockConsultationData,
    });
  }),
];
```

**테스트 예제**:

```typescript
// src/__tests__/integration/career-timing.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CareerTimingPage } from '@/app/career/timing/page';

describe('CareerTiming 통합 테스트', () => {
  it('올바른 입력으로 분석이 성공해야 함', async () => {
    const user = userEvent.setup();
    render(<CareerTimingPage />);
    
    // ✅ 테스트 시나리오: 1. 입력 → 2. 고지 문구 표시 → 3. 로딩 → 4. 결과
    
    // 1. 입력
    await user.type(screen.getByLabelText(/생년월일/i), '1990-10-10');
    await user.type(screen.getByLabelText(/시간/i), '14:30');
    
    // 2. 제출
    await user.click(screen.getByRole('button', { name: /분석하기/i }));
    
    // 3. 고지 문구 표시 확인
    expect(screen.getByText(/본 사주는 재미로/i)).toBeInTheDocument();
    
    // 4. 1500ms 후 고지 문구 사라짐 + 로딩 시작
    await waitFor(
      () => {
        expect(screen.getByText(/AI 분석 중/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    
    // 5. 결과 표시
    await waitFor(
      () => {
        expect(screen.getByText(/H1|H2/)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
  
  it('잘못된 입력으로 검증 에러를 표시해야 함', async () => {
    const user = userEvent.setup();
    render(<CareerTimingPage />);
    
    // ✅ 잘못된 날짜 형식
    await user.type(screen.getByLabelText(/생년월일/i), '10-10-1990');
    await user.click(screen.getByRole('button', { name: /분석하기/i }));
    
    // ✅ 에러 메시지
    expect(screen.getByText(/형식이 올바르지 않습니다/i)).toBeInTheDocument();
  });
  
  it('타임아웃 시 재시도 정책이 작동해야 함', async () => {
    // ✅ MSW 핸들러로 20초 지연 설정
    server.use(
      http.post(`${API_BASE}/api/career/timing`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 20000));
        return HttpResponse.json({ success: true, data: {} });
      })
    );
    
    // ... 테스트 ...
  });
});
```

**커버리지 리포트**:

```bash
npm test -- --coverage

# ✅ 출력 예
# ─────────────────────────────────────────────────────────────
# File                      | % Stmts | % Branch | % Funcs | % Lines
# ─────────────────────────────────────────────────────────────
# hooks/useCareerTiming.ts  | 85.3   | 82.1    | 90.0    | 85.5
# components/TimingForm.tsx | 78.5   | 75.0    | 80.0    | 78.9
# lib/api/client.ts         | 92.1   | 88.5    | 95.0    | 92.3
# ─────────────────────────────────────────────────────────────
# All files                 | 82.4   | 80.1    | 85.2    | 82.8  ✅
```

---

### R8: Husky + Pre-commit 훅으로 무결성 커밋 파이프라인

**목표**: 헌법 조항 IV (Build Passed) 강제 - `npm test` + `npm run build` 실패 시 커밋 중단

**설정**:

```bash
# 1. Husky 설치
npm install husky --save-dev
npx husky install

# 2. Pre-commit 훅 생성
npx husky add .husky/pre-commit "npm run test:ci && npm run build"
```

```bash
# .husky/pre-commit 파일
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# ✅ 1단계: 테스트 (빠른 피드백)
npm run test:ci

# ✅ 2단계: 빌드 (TypeScript + ESLint)
npm run build

# ✅ 모두 성공 시에만 커밋 진행
```

```json
// package.json - 스크립트
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "build": "next build",
    "lint": "eslint src --max-warnings 0",
    "precommit": "npm run test:ci && npm run build && npm run lint"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run precommit"
    }
  }
}
```

**동작 예**:

```bash
# ✅ 테스트/빌드 성공
$ git commit -m "feat: 관운 분석 페이지 추가"
  ✓ npm run test:ci (15초)
  ✓ npm run build (10초)
  [main abc1234] feat: 관운 분석 페이지 추가
  2 files changed, 150 insertions(+)

# ❌ 테스트 실패
$ git commit -m "feat: 버그 있는 코드"
  ✗ npm run test:ci (FAIL)
  
  FAIL src/__tests__/hooks/useCareerTiming.test.ts
    ✕ should submit analysis
  
  Test Suites: 1 failed, 2 passed
  Tests:       1 failed, 45 passed
  
  ❌ 커밋 중단. 테스트를 수정하고 다시 시도해주세요.

# ❌ 빌드 실패
$ git commit -m "feat: TypeScript 에러 있는 코드"
  ✓ npm run test:ci (12초)
  ✗ npm run build (FAIL)
  
  Type 'string' is not assignable to type 'number'
  at src/lib/api/client.ts:42:15
  
  ❌ 커밋 중단. 빌드 에러를 수정하고 다시 시도해주세요.
```

**선택적: 테스트/빌드 스킵** (긴급 시에만):

```bash
# Pre-commit 훅 우회 (비추천)
git commit -m "wip: 임시 커밋" --no-verify

# 하지만 CI/CD 파이프라인에서는 반드시 실행됨!
```

**CI/CD와의 이중 검증**:

```yaml
# .github/workflows/test.yml
name: Test & Build

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # ✅ 로컬에서 놓친 것을 CI에서 재검증
      - run: npm ci
      - run: npm run test:ci -- --coverage
      - run: npm run build
      - run: npm run lint
      
      # ✅ 커버리지 리포트
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true
```

**이중 검증의 이점**:
1. **로컬 개발자**: 빠른 피드백 (pre-commit)
2. **팀 리포지토리**: 최종 품질 보증 (CI)
3. **배포 보안**: 테스트/빌드 실패한 코드는 절대 배포 안 됨

---

---

### D7: AI 컨설팅 8섹션 표시 방식 (Q6 — 2026-05-13)

**Decision**: `@fullpage/react-fullpage` — 각 섹션을 100vh 전체화면 슬라이드로 표시  
**Why Chosen**:
- 사용자 명시 요청 (spec US4 2026-05-13 변경)
- 기존 탭 UI → 스크롤 방식으로 전환 중, 단순 스크롤보다 명확한 "1섹션 = 1페이지" UX 전달
- fullpage.js 직접 구현(스냅 스크롤 + 크로스 브라우저 + 접근성) 최소 500줄 + 브라우저 엣지 케이스 다수
- `@fullpage/react-fullpage` 래퍼: React 친화적, TypeScript 타입 지원

**Alternatives Considered**:
- **CSS scroll-snap**: 브라우저 지원 양호하나, 섹션 인식/네비게이션 커스텀 로직 복잡
- **수동 구현 (IntersectionObserver + scroll)**: 500+ 줄, 모바일 터치 처리 별도
- **Framer Motion + AnimatePresence**: 애니메이션 강력하나 라이브러리 크기 크고 fullpage 스냅 지원 제한적

**Rationale**: Constitution IV (외부 UI 라이브러리 제한) 예외 적용. 사용자가 명시적으로 fullpage.js를 요청했고, 직접 구현 시 복잡도와 파일 크기(Constitution I 위반 우려)가 과다. PR에 `[Exception: Principle IV]` 명시 필수.

**fullpage.js 설정 결정**:
- `scrollingSpeed: 700` — 부드러운 전환 (스냅 너무 빠르면 UX 불편)
- `scrollOverflow: true` — 월별운세 캘린더 등 긴 콘텐츠 섹션 내 스크롤 허용
- `responsiveWidth: 768` — 모바일에서 fullpage.js 비활성, 일반 스크롤로 전환
- `prefers-reduced-motion`: afterRender에서 `scrollingSpeed: 0` 적용 (접근성)

**라이선스 주의**:
- fullpage.js: GPL v3 오픈 소스 라이선스
- 상업용 배포 시 유료 라이선스 필요 (확인 후 결정)

---

## No Further Research Blockers

All security, state management, animation, and testing patterns researched and documented.  
Q6 (fullpage.js) 결정 반영 완료.

✅ **Ready for Phase 1 Implementation**
