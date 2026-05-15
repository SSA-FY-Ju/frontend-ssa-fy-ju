# Implementation Tasks: Phase 9 - 라우트 가드 및 비정상 접근 방어

**Feature**: 008-route-guards  
**Phase**: Phase 9 (Polish & Security)  
**Total Estimated Tasks**: 24  
**Estimated Duration**: 5-8 days  

---

## Task Execution Order & Phases

```
Phase 1: Foundation Hooks (Setup → Tests → Core)
├── T130: useSessionRehydration Hook
├── T131: useRouteGuard Hook  
├── T132: useAuthGuard Hook
└── [P] T131, T132 can run in parallel

Phase 2: UI & Integration (Components → Pages)
├── T133: ExpiredResultModal Component
├── T134: Route Guards Integration to All Pages
└── Error Boundary Setup

Phase 3: Testing & Validation (E2E → Performance → Docs)
├── T135: E2E Tests (4 scenarios)
├── Performance Testing
├── MSW Mock Scenarios
└── Documentation
```

---

## Phase 1: Foundation Hooks

### T130: useSessionRehydration Hook Implementation

**Priority**: CRITICAL (Foundation)  
**Dependencies**: None (Session initialization, runs in app/layout.tsx)  
**Estimated Time**: 1 day  
**Files to Create/Modify**:
- `src/hooks/useSessionRehydration.ts` (NEW)
- `src/lib/validation/schemas.ts` (NEW)
- `src/types/api.ts` (MODIFY - add SessionData type)
- `src/app/layout.tsx` (MODIFY - add hook call)

**Task Breakdown**:

#### T130-1: SessionDataSchema 구현 (2 hours)
```typescript
// src/lib/validation/schemas.ts
const SessionDataSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'HH:mm 형식').optional().default('12:00'),
});
```

**Acceptance**:
- ✅ Zod schema 정의 완료
- ✅ TypeScript type inference 확인
- ✅ 에러 메시지 명확성 확인

#### T130-2: useSessionRehydration Hook (3 hours)
```typescript
// src/hooks/useSessionRehydration.ts
export function useSessionRehydration() {
  const { initSession, clearSession } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sessionData');
      if (!raw) return; // No data, first visit or cleared
      const data = SessionDataSchema.parse(JSON.parse(raw));
      initSession(data);
    } catch (err) {
      // Validation failed - session corrupted
      console.error('Session validation failed:', err);
      sessionStorage.removeItem('sessionData');
      clearSession();
      router.push('/survey');
      toast.error('세션이 만료되었습니다. 다시 시작해주세요');
    }
  }, []);
}
```

**Acceptance**:
- ✅ sessionStorage 데이터 로드 및 검증
- ✅ 실패 시 초기화 및 리다이렉트
- ✅ 토스트 메시지 표시
- ✅ useRouter() 및 useSessionStore 호출 확인

#### T130-3: app/layout.tsx 통합 (1 hour)
```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  useSessionRehydration(); // Load and validate session at app boot
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Acceptance**:
- ✅ layout.tsx에서 hook 호출
- ✅ 렌더링 순서 확인 (hydration 전 실행)

#### T130-4: 단위 테스트 (2 hours)
```typescript
// src/hooks/__tests__/useSessionRehydration.test.ts
describe('useSessionRehydration', () => {
  it('should initialize session from valid sessionStorage', () => {
    const validData = { birthDate: '2000-01-01', birthTime: '12:00' };
    sessionStorage.setItem('sessionData', JSON.stringify(validData));
    
    const { result } = renderHook(() => useSessionRehydration());
    expect(mockSessionStore.initSession).toHaveBeenCalledWith(validData);
  });

  it('should redirect and clear on invalid data', () => {
    sessionStorage.setItem('sessionData', JSON.stringify({ birthDate: 'invalid' }));
    
    renderHook(() => useSessionRehydration());
    expect(mockRouter.push).toHaveBeenCalledWith('/survey');
    expect(sessionStorage.getItem('sessionData')).toBeNull();
  });

  it('should handle missing sessionStorage gracefully', () => {
    sessionStorage.clear();
    renderHook(() => useSessionRehydration());
    // No error, normal first visit
  });
});
```

**Acceptance**:
- ✅ 정상 케이스 테스트 (유효한 데이터)
- ✅ 오염 케이스 테스트 (유효하지 않은 데이터)
- ✅ 초기 방문 케이스 (데이터 없음)
- ✅ 커버리지 > 90%

---

### T131: useRouteGuard Hook Implementation

**Priority**: HIGH (Core feature)  
**Dependencies**: T130 (Session initialization must work first)  
**Estimated Time**: 1.5 days  
**Files to Create/Modify**:
- `src/hooks/useRouteGuard.ts` (NEW)
- `src/types/api.ts` (MODIFY - if needed)

**Task Breakdown**:

#### T131-1: useRouteGuard Hook (2 hours)
```typescript
// src/hooks/useRouteGuard.ts
export function useRouteGuard(required: boolean = true) {
  const { birthDate } = useSessionStore();
  const router = useRouter();
  const pathname = usePathname(); // Detect current page

  useEffect(() => {
    if (!required) return;
    
    // Don't guard survey/entry pages
    if (pathname.startsWith('/survey')) return;
    
    // Check if birthDate is missing
    if (!birthDate) {
      router.push('/survey');
      toast.error('먼저 기본 정보를 입력해주세요');
    }
  }, [required, birthDate, pathname]);
}
```

**Acceptance**:
- ✅ sessionStore에서 birthDate 확인
- ✅ 없으면 /survey로 리다이렉트
- ✅ 토스트 메시지 표시
- ✅ /survey 페이지는 무한 루프 방지 (early return)

#### T131-2: useRouteGuard 단위 테스트 (2 hours)
```typescript
// src/hooks/__tests__/useRouteGuard.test.ts
describe('useRouteGuard', () => {
  it('should allow access when birthDate exists', () => {
    // Mock sessionStore with birthDate
    useSessionStore.setState({ birthDate: '2000-01-01' });
    
    renderHook(() => useRouteGuard(true));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should redirect when birthDate is missing', () => {
    useSessionStore.setState({ birthDate: null });
    
    renderHook(() => useRouteGuard(true));
    expect(mockRouter.push).toHaveBeenCalledWith('/survey');
  });

  it('should not guard when required=false', () => {
    useSessionStore.setState({ birthDate: null });
    
    renderHook(() => useRouteGuard(false));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should not guard /survey pages', () => {
    useSessionStore.setState({ birthDate: null });
    mockUsePathname.mockReturnValue('/survey');
    
    renderHook(() => useRouteGuard(true));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
```

**Acceptance**:
- ✅ 정상 케이스 (데이터 있음)
- ✅ 가드 활성화 케이스 (리다이렉트)
- ✅ 가드 비활성화 케이스
- ✅ 진입점 (/survey) 보호 (무한 루프 방지)
- ✅ 커버리지 > 90%

#### T131-3: 통합 테스트 - /services 페이지 (1 hour)
```typescript
// components/__tests__/ServicesPage.integration.test.ts
describe('Services Page Route Guard', () => {
  it('should redirect from /services when birthDate missing', () => {
    useSessionStore.setState({ birthDate: null });
    render(<ServicesPage />);
    expect(mockRouter.push).toHaveBeenCalledWith('/survey');
  });

  it('should render /services when birthDate exists', () => {
    useSessionStore.setState({ birthDate: '2000-01-01' });
    const { container } = render(<ServicesPage />);
    expect(container.querySelector('.services-container')).toBeInTheDocument();
  });
});
```

**Acceptance**:
- ✅ /services 페이지 리다이렉트 확인
- ✅ 정상 렌더링 확인

---

### T132: useAuthGuard Hook Implementation [P]

**Priority**: HIGH (Core feature)  
**Dependencies**: T130 (Session initialization must work)  
**Parallel with**: T131 (Independent feature)  
**Estimated Time**: 1.5 days  
**Files to Create/Modify**:
- `src/hooks/useAuthGuard.ts` (NEW)
- `src/stores/authStore.ts` (MODIFY - if needed)

**Task Breakdown**:

#### T132-1: useAuthGuard Hook (2 hours)
```typescript
// src/hooks/useAuthGuard.ts
export function useAuthGuard(required: boolean = true) {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!required) return;
    
    // Don't guard root or login pages
    if (pathname === '/' || pathname === '/login') return;
    
    // Check if user is not logged in
    if (!isLoggedIn) {
      router.push('/');
      toast.info('로그인 후 이용해주세요');
    }
  }, [required, isLoggedIn, pathname]);
}
```

**Acceptance**:
- ✅ authStore에서 isLoggedIn 확인
- ✅ 로그인 미확인 시 /로 리다이렉트
- ✅ 루트와 로그인 페이지는 무한 루프 방지
- ✅ 정보 메시지 표시 (error 아님)

#### T132-2: useAuthGuard 단위 테스트 (2 hours)
```typescript
// src/hooks/__tests__/useAuthGuard.test.ts
describe('useAuthGuard', () => {
  it('should allow access when logged in', () => {
    useAuthStore.setState({ isLoggedIn: true });
    
    renderHook(() => useAuthGuard(true));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should redirect to / when not logged in', () => {
    useAuthStore.setState({ isLoggedIn: false });
    
    renderHook(() => useAuthGuard(true));
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('should not guard root page', () => {
    useAuthStore.setState({ isLoggedIn: false });
    mockUsePathname.mockReturnValue('/');
    
    renderHook(() => useAuthGuard(true));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
```

**Acceptance**:
- ✅ 로그인 상태 정상 (허용)
- ✅ 비로그인 상태 (리다이렉트)
- ✅ 루트 페이지 보호 (무한 루프 방지)
- ✅ 커버리지 > 90%

#### T132-3: 통합 테스트 - /my-page 페이지 (1 hour)
```typescript
// components/__tests__/MyPage.integration.test.ts
describe('My Page Route Guard', () => {
  it('should redirect from /my-page when not logged in', () => {
    useAuthStore.setState({ isLoggedIn: false });
    render(<MyPage />);
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('should render /my-page when logged in', () => {
    useAuthStore.setState({ isLoggedIn: true });
    const { container } = render(<MyPage />);
    expect(container.querySelector('.my-page-container')).toBeInTheDocument();
  });
});
```

**Acceptance**:
- ✅ /my-page 페이지 리다이렉트 확인
- ✅ 정상 렌더링 확인

---

## Phase 2: UI Components & Integration

### T133: ExpiredResultModal Component

**Priority**: HIGH (UX)  
**Dependencies**: T130 (Session state must be stable)  
**Estimated Time**: 1 day  
**Files to Create/Modify**:
- `src/components/modal/ExpiredResultModal.tsx` (NEW)
- `src/hooks/useExpiredResult.ts` (NEW - optional state manager)

**Task Breakdown**:

#### T133-1: ExpiredResultModal 컴포넌트 (2 hours)
```typescript
// src/components/modal/ExpiredResultModal.tsx
export function ExpiredResultModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const router = useRouter();

  const handleStartNew = () => {
    router.push('/survey');
    onClose();
  };

  return (
    <dialog open={isOpen} className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm">
        {/* 경고 아이콘 */}
        <div className="text-5xl text-yellow-500 mb-4">⚠️</div>
        
        <h2 className="text-2xl font-bold mb-4">분석 결과가 만료되었습니다</h2>
        <p className="text-gray-600 mb-6">
          24시간 후 자동 삭제되는 임시 결과입니다.
          새 분석을 시작해주세요.
        </p>
        
        <button
          onClick={handleStartNew}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          새 분석 시작
        </button>
      </div>
    </dialog>
  );
}
```

**Acceptance**:
- ✅ 제목, 설명, 버튼 렌더링
- ✅ 버튼 클릭 시 /survey로 이동
- ✅ 아이콘 표시 (경고색)

#### T133-2: 스타일링 및 반응형 (1 hour)
- ✅ 모바일에서 너비 제어 (max-w-sm)
- ✅ 버튼 크기 적절 (py-3)
- ✅ 경고색 아이콘 (yellow-500)
- ✅ 다크모드 고려 (필요시)

#### T133-3: 단위 테스트 (1 hour)
```typescript
// src/components/modal/__tests__/ExpiredResultModal.test.tsx
describe('ExpiredResultModal', () => {
  it('should render when isOpen=true', () => {
    render(<ExpiredResultModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/분석 결과가 만료/)).toBeInTheDocument();
  });

  it('should redirect on button click', async () => {
    render(<ExpiredResultModal isOpen={true} onClose={() => {}} />);
    const button = screen.getByRole('button', { name: /새 분석 시작/ });
    await userEvent.click(button);
    expect(mockRouter.push).toHaveBeenCalledWith('/survey');
  });

  it('should not render when isOpen=false', () => {
    const { container } = render(<ExpiredResultModal isOpen={false} onClose={() => {}} />);
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });
});
```

**Acceptance**:
- ✅ 렌더링 조건 확인
- ✅ 버튼 상호작용 확인
- ✅ 커버리지 > 85%

---

### T134: Route Guards Integration to All Pages [P]

**Priority**: CRITICAL (Core feature completion)  
**Dependencies**: T130, T131, T132, T133  
**Estimated Time**: 1.5 days  
**Files to Modify**: All result and protected pages

**Task Breakdown**:

#### T134-1: /services 페이지에 useRouteGuard 적용 (30 min)
```typescript
// src/app/services/page.tsx
"use client";

export default function ServicesPage() {
  useRouteGuard(true); // Guard: require birthDate
  
  return (
    <div className="services-container">
      {/* Services content */}
    </div>
  );
}
```

**Acceptance**:
- ✅ useRouteGuard(true) 호출
- ✅ birthDate 없으면 /survey로 리다이렉트

#### T134-2: /result/* 페이지들에 useRouteGuard 적용 (1 hour)

페이지 목록:
- `src/app/result/timing/page.tsx` → useRouteGuard(true)
- `src/app/result/consultation/page.tsx` → useRouteGuard(true)
- `src/app/result/compatibility/page.tsx` → useRouteGuard(true)

각 페이지에서:
1. useRouteGuard(true) 호출
2. API 404 에러 감지 시 ExpiredResultModal 표시
3. "새 분석 시작" 버튼 클릭 시 /survey로 이동

```typescript
// src/app/result/timing/page.tsx
export default function TimingResultPage() {
  const [showExpired, setShowExpired] = useState(false);
  const router = useRouter();
  
  useRouteGuard(true); // Guard: require birthDate

  useEffect(() => {
    // Fetch result data
    fetchResult()
      .catch((err) => {
        if (err.status === 404) {
          setShowExpired(true);
        }
      });
  }, []);

  return (
    <>
      <div className="result-container">
        {/* Timing result content */}
      </div>
      <ExpiredResultModal
        isOpen={showExpired}
        onClose={() => router.push('/survey')}
      />
    </>
  );
}
```

**Acceptance**:
- ✅ 3개 결과 페이지 모두에 가드 적용
- ✅ API 404 에러 감지
- ✅ ExpiredResultModal 표시

#### T134-3: /my-page 페이지에 useAuthGuard 적용 (30 min)
```typescript
// src/app/my-page/page.tsx
export default function MyPage() {
  useAuthGuard(true); // Guard: require login
  
  return (
    <div className="my-page-container">
      {/* My page content */}
    </div>
  );
}
```

**Acceptance**:
- ✅ useAuthGuard(true) 호출
- ✅ 비로그인 시 /로 리다이렉트

#### T134-4: Error Boundary 설정 (1 hour)
```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">오류가 발생했습니다</h2>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            홈으로 돌아가기
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

```typescript
// src/app/layout.tsx 에 ErrorBoundary 래핑
<ErrorBoundary>
  {children}
</ErrorBoundary>
```

**Acceptance**:
- ✅ ErrorBoundary 설정
- ✅ 오류 발생 시 폴백 UI 표시
- ✅ 홈으로 복구 링크 제공

---

## Phase 3: Testing & Validation

### T135: E2E Tests & Performance Validation

**Priority**: CRITICAL (Feature completion)  
**Dependencies**: T130 ~ T134 (All implementation completed)  
**Estimated Time**: 2 days  
**Tools**: Cypress or Playwright

**Task Breakdown**:

#### T135-1: 정상 흐름 E2E 테스트 (1 hour)
```typescript
// cypress/e2e/normal-flow.cy.ts
describe('Normal Flow - 정상적인 사용 경로', () => {
  it('should complete full journey: survey → services → result', () => {
    cy.visit('/');
    
    // 입력 페이지
    cy.visit('/survey');
    cy.get('input[name="birthDate"]').type('2000-01-01');
    cy.get('button:contains("다음")').click();
    
    // 서비스 선택 페이지
    cy.url().should('include', '/services');
    cy.get('button:contains("관운분석")').click();
    
    // 결과 페이지
    cy.url().should('include', '/result/timing');
    cy.get('.result-container').should('be.visible');
  });
});
```

**Acceptance**:
- ✅ 정상 흐름 완료
- ✅ 리다이렉트 없음
- ✅ 데이터 저장됨

#### T135-2: 비정상 접근 E2E 테스트 - 4가지 시나리오 (2 hours)

**T135-2a**: /services 직접 접근 (미입력 상태)
```typescript
it('should redirect from /services when birthDate missing', () => {
  cy.visit('/services');
  cy.url().should('include', '/survey');
  cy.get('.sonner-toast').should('contain', '기본 정보를 입력해주세요');
});
```

**T135-2b**: /my-page 직접 접근 (비로그인 상태)
```typescript
it('should redirect from /my-page when not logged in', () => {
  cy.visit('/my-page');
  cy.url().should('include', '/');
  cy.get('.sonner-toast').should('contain', '로그인 후 이용해주세요');
});
```

**T135-2c**: sessionStorage 수정 (오염된 데이터)
```typescript
it('should redirect when sessionStorage is corrupted', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('sessionData', JSON.stringify({
      birthDate: 'invalid-date'
    }));
  });
  cy.visit('/services');
  cy.url().should('include', '/survey');
  cy.get('.sonner-toast').should('contain', '세션이 만료되었습니다');
});
```

**T135-2d**: 만료된 결과 URL
```typescript
it('should show ExpiredResultModal on 404', () => {
  // Mock API 404 response
  cy.intercept('GET', '/api/result/timing*', {
    statusCode: 404,
    body: { error: 'Not found' }
  });
  
  cy.visit('/result/timing?id=expired_id');
  cy.get('h2').should('contain', '분석 결과가 만료');
  cy.get('button:contains("새 분석 시작")').click();
  cy.url().should('include', '/survey');
});
```

**Acceptance**:
- ✅ 4가지 비정상 시나리오 모두 통과
- ✅ 적절한 리다이렉트
- ✅ 사용자 메시지 표시

#### T135-3: 성능 테스트 (1 hour)
```typescript
// cypress/e2e/performance.cy.ts
describe('Performance - 성능 기준', () => {
  it('should redirect within 300ms', () => {
    const startTime = Date.now();
    cy.visit('/services');
    cy.url().should('include', '/survey');
    cy.then(() => {
      const duration = Date.now() - startTime;
      expect(duration).to.be.lessThan(300);
    });
  });

  it('should render modal within 200ms', () => {
    const startTime = Date.now();
    cy.visit('/result/timing?id=expired');
    cy.get('h2:contains("분석 결과가 만료")').should('be.visible');
    cy.then(() => {
      const duration = Date.now() - startTime;
      expect(duration).to.be.lessThan(200);
    });
  });
});
```

**Acceptance**:
- ✅ 리다이렉트 < 300ms
- ✅ 모달 렌더링 < 200ms

#### T135-4: MSW Mock 시나리오 업데이트 (1 hour)
```typescript
// src/mocks/handlers/route-guards.ts
import { http, HttpResponse } from 'msw';

export const routeGuardsHandlers = [
  // 404 응답 (ExpiredResultModal 트리거)
  http.get('/api/result/timing/:id', ({ params }) => {
    if (params.id === 'expired') {
      return HttpResponse.json(
        { error: 'Result expired or not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ /* valid result */ });
  }),

  // 인증 상태 모킹
  http.get('/api/auth/me', () => {
    const isLoggedIn = localStorage.getItem('mockAuthToken');
    if (!isLoggedIn) {
      return HttpResponse.json({ authenticated: false }, { status: 401 });
    }
    return HttpResponse.json({ authenticated: true, user: { id: '123' } });
  }),
];

// src/mocks/server.ts에 추가
export const server = setupServer(...routeGuardsHandlers);
```

**Acceptance**:
- ✅ 404 응답 모킹
- ✅ 인증 상태 모킹
- ✅ 개발/테스트 API 일관성

#### T135-5: 문서화 및 QA (1 hour)

**README.md 추가 섹션**:
```markdown
### Route Guards (Phase 9)

4가지 라우트 가드 메커니즘으로 비정상 접근을 방어합니다:

1. **Step Guard** (`useRouteGuard`): 필수 입력값 확인
2. **Storage Validation**: Zod 스키마로 세션 검증
3. **404 Fallback**: 만료된 결과 URL 처리
4. **Auth Guard** (`useAuthGuard`): 로그인 상태 확인

#### 훅 사용 방법

```typescript
// 페이지에서 입력 데이터 필수 확인
export default function Page() {
  useRouteGuard(true); // birthDate 필수
  return <div>...</div>;
}

// 로그인 필수 페이지
export default function MyPage() {
  useAuthGuard(true); // isLoggedIn 필수
  return <div>...</div>;
}
```
```

**QA Checklist**:
- [ ] 4가지 리다이렉트 시나리오 수동 테스트
- [ ] 모바일 브라우저에서 테스트
- [ ] 네트워크 지연 시뮬레이션 (DevTools)
- [ ] 로컬스토리지/세션스토리지 초기화 후 테스트
- [ ] 백버튼 사용 후 동작 확인

**Acceptance**:
- ✅ 문서 작성 완료
- ✅ QA 체크리스트 통과
- ✅ 개발자 가이드 명확성 확인

---

## Cross-Cutting Concerns

### Error Handling

모든 리다이렉트는 다음 패턴 따름:

```typescript
// ❌ 나쁜 예: 조건부 렌더링만
if (!birthDate) return null;

// ✅ 좋은 예: 조기 리다이렉트 + 조건부 렌더링
if (!birthDate) {
  router.push('/survey');
  return null; // Early return to prevent further renders
}
```

### Performance Optimization

- Zod 검증은 앱 부팅 시 1회만 실행 (useSessionRehydration)
- 이후 페이지 네비게이션은 메모리의 상태 사용 (빠름)
- 리다이렉트 지연 최소화 (useRouter 직접 사용, useCallback 없음)

### Testing Strategy Summary

| 테스트 타입 | 도구 | 범위 | 목표 |
|-----------|-----|------|------|
| 단위 테스트 | Jest | hooks, utils | > 90% coverage |
| 통합 테스트 | Jest + RTL | components + pages | 상호작용 검증 |
| E2E 테스트 | Cypress | 전체 흐름 | 사용자 시나리오 |
| 성능 테스트 | Lighthouse | 리다이렉트, 렌더링 | < 300ms, < 200ms |

---

## Task Completion Tracking

```
Phase 1: Foundation Hooks
  [ ] T130: useSessionRehydration (1 day)
  [ ] T131: useRouteGuard (1.5 days) [P with T132]
  [ ] T132: useAuthGuard (1.5 days) [P with T131]

Phase 2: UI & Integration
  [ ] T133: ExpiredResultModal (1 day)
  [ ] T134: Route Guards Integration (1.5 days)

Phase 3: Testing & Validation
  [ ] T135: E2E Tests & Performance (2 days)

Total: 5-8 days
```

---

## Success Metrics

| 메트릭 | 기준 | 검증 방법 |
|--------|------|---------|
| Redirect Latency | < 300ms | Cypress performance hook |
| Test Coverage | > 85% | Jest coverage report |
| E2E Pass Rate | 100% | Cypress run report |
| Modal Render | < 200ms | Lighthouse audit |

---

**Created**: 2026-05-15  
**Phase**: Phase 9 (Polish & Security)  
**Status**: Ready for Implementation  
**Estimated Duration**: 5-8 days
