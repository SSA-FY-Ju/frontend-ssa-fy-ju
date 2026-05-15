# Implementation Plan: 라우트 가드 및 비정상 접근 방어

**Feature**: 008-route-guards  
**Phase**: Phase 9 (Polish & Security)  
**Created**: 2026-05-15  
**Status**: Ready for Implementation  

---

## Executive Summary

사용자의 비정상적인 접근(미입력 건너뛰기, 세션 조작, 만료된 URL, 권한 없는 접근)을 4가지 라우트 가드 메커니즘으로 방어합니다. 이를 통해 데이터 무결성 보호, 세션 일관성 유지, 안정적인 UX 제공을 달성합니다.

### Key Metrics
- **Redirect Latency**: < 300ms (비정상 접근 감지 후 리다이렉트)
- **Session Validation**: 100% Zod schema compliance
- **Error Recovery**: 3초 이내 자연스러운 복구 UX

---

## Technical Context

### Architecture Overview

```
app/layout.tsx (useSessionRehydration 호출)
  ↓
pages/* (useRouteGuard + useAuthGuard 호출)
  ↓
hooks/{useSessionRehydration, useRouteGuard, useAuthGuard}
  ↓
stores/sessionStore + authStore
  ↓
lib/validation/schemas (SessionDataSchema)
```

### Key Technologies & Constraints

| 항목 | 선택 | 이유 |
|------|------|------|
| 세션 검증 | Zod schema | Runtime type safety 보장 |
| 라우팅 | Next.js useRouter() | App Router 네이티브 기능 |
| 상태 관리 | Zustand (sessionStore, authStore) | Constitution IV 준수 |
| 스토리지 | sessionStorage (클라이언트만) | HttpOnly Cookie와 함께 사용 |
| 리다이렉트 | useRouter().push() + useEffect() | SSR 오버헤드 방지 |
| 모달 | ExpiredResultModal (Custom) | 컴포넌트 라이브러리 금지 |

### Data Model

#### SessionDataSchema (Zod)

```typescript
// lib/validation/schemas.ts
const SessionDataSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'HH:mm 형식').optional().default('12:00'),
  // 나머지 필드는 선택적 (업데이트 가능성 대비)
});

type SessionData = z.infer<typeof SessionDataSchema>;
```

#### Rehydration Pattern

```typescript
// hooks/useSessionRehydration.ts
export function useSessionRehydration() {
  const { initSession } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sessionData');
      if (!raw) {
        // 첫 방문 또는 세션 초기화
        return;
      }
      const data = SessionDataSchema.parse(JSON.parse(raw));
      initSession(data);
    } catch (err) {
      // Validation 실패 → 세션 초기화 + 리다이렉트
      sessionStorage.removeItem('sessionData');
      router.push('/survey');
      toast.error('세션이 만료되었습니다. 다시 시작해주세요');
    }
  }, []);
}
```

---

## Implementation Phases

### Phase 1: Foundation Hooks (2-3 days)

**Goal**: Core guard hooks 구현 및 검증 로직 완성

**Tasks**:

1. **T130-1**: useSessionRehydration 구현
   - sessionStorage에서 데이터 로드
   - Zod로 검증
   - 실패 시 초기화 + 토스트
   - `app/layout.tsx`에서 호출

2. **T130-2**: SessionDataSchema 완성
   - birthDate: YYYY-MM-DD 정규식
   - birthTime: HH:mm 정규식 (기본 12:00)
   - 에러 메시지 다국어화

3. **T131-1**: useRouteGuard(required: boolean) 구현
   - sessionStore에서 birthDate 확인
   - 없으면 `/survey`로 리다이렉트
   - 토스트: "먼저 기본 정보를 입력해주세요"
   - `usePathname()` 사용해 현재 경로 파악 (선택적)

4. **T131-2**: useRouteGuard 통합 테스트
   - `/services` 접근 → 리다이렉트 확인
   - `/result/*` 접근 → 리다이렉트 확인
   - 데이터 있으면 정상 렌더링

5. **T132-1**: useAuthGuard(required: boolean) 구현
   - authStore의 `isLoggedIn` 확인
   - 로그인 미확인 시 `/`로 리다이렉트
   - 루트에서 로그인 유도 메시지 표시

6. **T132-2**: useAuthGuard 통합 테스트
   - `/my-page` 비로그인 접근 → 리다이렉트 확인
   - 로그인 후 접근 → 정상 렌더링

**Acceptance Criteria**:
- ✅ Zod schema validation 100% coverage
- ✅ 3초 이내 리다이렉트 완료
- ✅ 리다이렉트 토스트 메시지 표시
- ✅ Jest 단위 테스트 통과 (80% 이상 coverage)

**Parallel Tasks [P]**: T131 및 T132는 독립적이므로 병렬 실행 가능

---

### Phase 2: UI Components & Integration (2-3 days)

**Goal**: 모달 및 모든 페이지에 가드 적용

**Tasks**:

1. **T133-1**: ExpiredResultModal 컴포넌트 구현
   - 제목: "분석 결과가 만료되었습니다"
   - 설명: "24시간 후 삭제되는 임시 결과입니다. 새 분석을 시작해주세요"
   - "새 분석 시작" 버튼 → `/survey`로 이동
   - 애니메이션: 200ms fade-in

2. **T133-2**: ExpiredResultModal 톤 및 스타일
   - 경고색 (황색 또는 주황색) 아이콘
   - Tailwind 기반 디자인
   - 모바일 반응형 확인

3. **T134-1**: 페이지별 가드 적용 - 입력 페이지들
   - `/survey` → 가드 없음 (entry point)
   - `/survey/[step]` → 가드 없음

4. **T134-2**: 페이지별 가드 적용 - 결과 페이지들
   - `/services` → useRouteGuard(true)
   - `/result/*` → useRouteGuard(true)
   - API 404 시 ExpiredResultModal 표시

5. **T134-3**: 페이지별 가드 적용 - 계정 페이지
   - `/my-page` → useAuthGuard(true)
   - `/my-page/[tab]` → useAuthGuard(true)

6. **T134-4**: 에러 경계 및 Fallback
   - Error Boundary 추가 (런타임 에러 캐치)
   - Fallback UI: 에러 메시지 + 홈으로 이동 버튼

**Acceptance Criteria**:
- ✅ ExpiredResultModal 표시 및 동작 확인
- ✅ 모든 보호 페이지에서 리다이렉트 동작 확인
- ✅ 토스트 메시지 3개 (만료, 세션, 정보 입력) 정상 표시
- ✅ E2E 테스트 통과

**Parallel Tasks [P]**: T133-2, T134-1~3은 병렬 실행 가능

---

### Phase 3: Testing & Validation (1-2 days)

**Goal**: 모든 시나리오 검증 및 성능 최적화

**Tasks**:

1. **T135-1**: 정상 흐름 E2E 테스트
   - 시나리오: 입력 → 서비스 선택 → 결과 조회 → 히스토리 저장
   - Cypress 또는 Playwright 사용

2. **T135-2**: 비정상 접근 E2E 테스트 (4가지 시나리오)
   - T135-2a: `/services` 직접 접근 (미입력) → `/survey` 리다이렉트
   - T135-2b: `/my-page` 직접 접근 (비로그인) → `/` 리다이렉트
   - T135-2c: sessionStorage 수정 → 검증 실패 → `/survey` 리다이렉트
   - T135-2d: 만료된 `/result/timing?id=abc` → ExpiredResultModal 표시

3. **T135-3**: 성능 테스트
   - 리다이렉트 지연 < 300ms 확인
   - 모달 렌더링 < 200ms 확인
   - 메모리 누수 확인 (devtools)

4. **T135-4**: MSW mock 시나리오 추가
   - 404 응답 모킹 (ExpiredResultModal 트리거)
   - 인증 상태 모킹 (로그인/로그아웃)

5. **T135-5**: 문서화 및 QA
   - README: 가드 메커니즘 설명
   - 개발자 가이드: hook 사용 방법
   - QA 체크리스트 작성

**Acceptance Criteria**:
- ✅ 모든 E2E 테스트 통과
- ✅ 리다이렉트 성능 < 300ms
- ✅ Jest coverage 80% 이상
- ✅ 문서 완성 및 리뷰

---

## Success Criteria

| 기준 ID | 측정 기준 | 목표값 | 검증 방법 |
|---------|---------|------|---------|
| S-003 | 비정상 접근 리다이렉트 지연 | < 300ms | Lighthouse/DevTools |
| UX-011 | 사용자 만족도 (리다이렉트 명확성) | > 4/5 | 사용성 테스트 피드백 |
| SEC-008 | Zod validation 통과율 | 100% | 자동화 테스트 |
| COV-001 | 가드 로직 테스트 커버리지 | 80% | Jest 리포트 |

---

## Testing Strategy

### Unit Tests (hooks/)

```typescript
// hooks/__tests__/useSessionRehydration.test.ts
describe('useSessionRehydration', () => {
  it('should initialize session from valid sessionStorage', () => {
    const { result } = renderHook(() => useSessionRehydration());
    // sessionStore 상태 확인
  });

  it('should redirect and clear on invalid data', () => {
    // sessionStorage 오염 시뮬레이션
    // 리다이렉트 확인
  });
});

// hooks/__tests__/useRouteGuard.test.ts
describe('useRouteGuard', () => {
  it('should allow access when birthDate exists', () => {
    // birthDate 설정 후 렌더링
    // 에러 없음 확인
  });

  it('should redirect to /survey when birthDate missing', () => {
    // birthDate 제거 후 리다이렉트 확인
  });
});
```

### Integration Tests (components/)

```typescript
// components/__tests__/ExpiredResultModal.test.tsx
describe('ExpiredResultModal', () => {
  it('should render with correct message', () => {
    render(<ExpiredResultModal />);
    expect(screen.getByText(/분석 결과가 만료되었습니다/)).toBeInTheDocument();
  });

  it('should redirect on button click', async () => {
    render(<ExpiredResultModal />);
    const button = screen.getByRole('button', { name: /새 분석 시작/ });
    await userEvent.click(button);
    expect(mockRouter.push).toHaveBeenCalledWith('/survey');
  });
});
```

### E2E Tests (cypress/)

```typescript
// cypress/e2e/route-guards.cy.ts
describe('Route Guards', () => {
  it('redirects from /services when birthDate missing', () => {
    cy.visit('/services');
    cy.url().should('include', '/survey');
    cy.contains('기본 정보를 입력해주세요').should('be.visible');
  });

  it('shows ExpiredResultModal on 404', () => {
    cy.visit('/result/timing?id=expired_id');
    cy.contains('분석 결과가 만료되었습니다').should('be.visible');
  });
});
```

---

## Risk Management

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| useRouter() SSR 오류 | Medium | High | `"use client"` directive 확인, layout.tsx에서 호출 지양 |
| sessionStorage race condition | Low | Medium | useEffect 클린업 함수 추가, 동시성 테스트 |
| 무한 리다이렉트 루프 | Low | High | 각 가드에서 현재 경로 확인 (e.g., `/survey`는 가드 없음) |
| 모바일 뒤로가기 버튼 | Medium | Low | useRouter() 뒤로가기 처리 (onbeforeunload 모니터링) |
| 성능 저하 (Zod 검증) | Low | Medium | 검증 결과 캐싱, 필요 시에만 재검증 |

**Mitigation Action Items**:
1. 모든 보호 페이지에 가드 로직 일관성 체크
2. 리다이렉트 경로 검증 (무한 루프 방지)
3. 성능 모니터링 (DevTools Lighthouse)

---

## File Structure & Changes

### New Files

```
src/
├── hooks/
│   ├── useSessionRehydration.ts    # 세션 복원 (app/layout에서 호출)
│   ├── useRouteGuard.ts            # 입력 데이터 검증
│   ├── useAuthGuard.ts             # 로그인 상태 검증
│   └── __tests__/
│       ├── useSessionRehydration.test.ts
│       ├── useRouteGuard.test.ts
│       └── useAuthGuard.test.ts
├── components/
│   └── ExpiredResultModal.tsx      # 404 리다이렉트 모달
└── lib/
    └── validation/
        └── schemas.ts              # SessionDataSchema + types
```

### Modified Files

```
src/
├── app/layout.tsx                  # useSessionRehydration() 호출 추가
├── app/survey/page.tsx             # 가드 없음 (entry point)
├── app/services/page.tsx           # useRouteGuard(true) 추가
├── app/result/*/page.tsx           # useRouteGuard(true) + ExpiredResultModal
├── app/my-page/page.tsx            # useAuthGuard(true) 추가
├── stores/sessionStore.ts          # 초기화 로직 추가 (필요시)
└── types/
    └── api.ts                      # SessionData 타입 추가
```

---

## Dependencies

### Upstream (완료되어야 함)

- ✅ **001-landing-pages**: 입력 단계 페이지들 완성
- ✅ **002-social-login**: 인증 플로우 및 authStore 완성
- ✅ **003-my-page-history**: `/my-page` 페이지 완성
- ✅ **004-career-timing**: `/result/timing` 페이지 완성
- ✅ **005-consultation**: `/result/consultation` 페이지 완성
- ✅ **006-company-compatibility**: `/result/compatibility` 페이지 완성

### Downstream (이후 가능)

- 007-feedback: 사용자 피드백 기능 (가드 불필요)
- Performance optimization phase
- Analytics integration

---

## Deployment & Rollout

### Pre-Deployment Checklist

- [ ] 모든 테스트 통과 (Jest, Cypress)
- [ ] ESLint + TypeScript 검증 (`npm run build`)
- [ ] 커버리지 80% 이상 확인
- [ ] 성능 테스트 < 300ms (리다이렉트)
- [ ] 모바일 반응형 테스트 완료
- [ ] 문서 작성 완료

### Release Notes Template

```
**Phase 9 - Route Guards & Security Hardening**

- 4가지 라우트 가드 메커니즘 추가 (Step, Storage Validation, 404 Fallback, Auth)
- 세션 데이터 Zod 검증으로 보안 강화
- ExpiredResultModal로 우아한 에러 복구 UX 제공
- 리다이렉트 지연 < 300ms로 사용자 경험 최적화

**Security**: 비정상 접근 방어, 세션 조작 탐지, 만료된 URL 처리
```

---

## Timeline

| 마일스톤 | 일정 | 상태 |
|---------|------|------|
| Phase 1 (Foundation Hooks) | 2-3일 | Ready |
| Phase 2 (UI & Integration) | 2-3일 | Blocked on Phase 1 |
| Phase 3 (Testing & Validation) | 1-2일 | Blocked on Phase 2 |
| **Total** | **5-8 days** | **On Track** |

---

**Plan Version**: 1.0  
**Last Updated**: 2026-05-15  
**Prepared By**: Claude Code  
**Status**: Ready for Implementation
