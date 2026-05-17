# Implementation Plan: 랜딩 페이지 및 입력 인터페이스

**Feature**: 001-landing-pages  
**Phase**: Phase 1 (Core User Flow)  
**Created**: 2026-05-15  
**Status**: Ready for Implementation  

---

## Executive Summary

사주 기반 커리어 컨설팅의 첫 진입점으로, 5단계 스토리텔링 랜딩 페이지에서 사용자 생년월일/시간을 수집하고, 챗봇을 통한 대화형 상담, 그리고 4개 분석 서비스 선택 카드를 제공합니다.

### Key Metrics
- **Onboarding Completion**: > 80% (5단계 완료율)
- **Chat Interaction**: 평균 3-5 메시지 (대화형 수집)
- **Service Selection**: 모든 선택지 명확성 확인

---

## Technical Context

### Architecture Overview

```
Landing Page (5-stage scroll)
  ├── Stage 1: 관운 분석 소개
  ├── Stage 2: 커리어 타이밍 설명
  ├── Stage 3: AI 컨설팅 설명
  ├── Stage 4: 기업 궁합 소개
  └── Stage 5: 서비스 선택 UI

Chat Input (대화형 입력)
  ├── 생년월일 수집
  ├── 생년시간 수집 (선택)
  └── 입력값 검증 → sessionStore 저장

Service Select (4개 카드 그리드)
  ├── 관운 분석
  ├── AI 커리어 컨설팅
  ├── 기업 궁합 분석
  └── 피드백 제출
```

### Key Technologies & Constraints

| 항목 | 선택 | 이유 |
|------|------|------|
| 스크롤 방식 | CSS scroll-snap (900ms lock) | Fullpage.js 대체, 모바일 최적화 |
| 입력 수집 | ChatInput (대화형) | 단순 폼보다 engaging |
| 상태 관리 | Zustand (sessionStore) | Constitution IV 준수 |
| 스타일링 | Tailwind CSS | 컴포넌트 라이브러리 금지 |
| 검증 | Zod (클라이언트) | 런타임 타입 안전성 |

### Data Model

#### BirthDateInput

```typescript
{
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm (default: 12:00)
}
```

#### ServiceSelection

```typescript
type AnalysisType = 
  | 'CAREER_TIMING'
  | 'CONSULTATION'
  | 'COMPATIBILITY'
  | 'FEEDBACK';
```

---

## Implementation Phases

### Phase 1: Landing Page (2 days)

**Goal**: 5단계 스토리텔링 + 시각적 매력

**Tasks**:
1. LandingPage 컴포넌트 구조 (scroll-snap)
2. Stage 1-4 콘텐츠 레이아웃 (각 900ms lock)
3. Stage 5로 자동 진행 또는 수동 스크롤
4. 모바일 반응형 테스트

**Acceptance Criteria**:
- ✅ 5개 Stage 모두 시각적으로 완성
- ✅ 900ms lock 시간 검증
- ✅ 모바일에서 smooth scroll

---

### Phase 2: Chat Input (2 days)

**Goal**: 대화형 생년월일/시간 수집

**Tasks**:
1. ChatInput 컴포넌트 (메시지 레이아웃)
2. 생년월일 입력 필드 (Zod YYYY-MM-DD)
3. 생년시간 입력 필드 (Zod HH:mm)
4. sessionStore 저장 + 검증
5. 에러 메시지 및 재시도

**Acceptance Criteria**:
- ✅ 입력값 Zod 검증 100% 통과
- ✅ 유효하지 않은 입력 시 에러 메시지
- ✅ sessionStorage에 자동 저장

---

### Phase 3: Service Select (1 day)

**Goal**: 4개 분석 서비스 선택 UI

**Tasks**:
1. ServiceSelect 컴포넌트 (4개 카드 그리드)
2. 각 카드의 설명 및 CTA 버튼
3. 버튼 클릭 시 해당 페이지로 이동
4. 네비게이션 통합 (/career-timing, /consultation, /compatibility, /feedback)

**Acceptance Criteria**:
- ✅ 4개 카드 모두 클릭 가능
- ✅ 정확한 라우팅 확인
- ✅ 모바일 카드 배치 최적화

---

## Success Criteria

| 기준 ID | 측정 기준 | 목표값 | 검증 방법 |
|---------|---------|------|---------|
| S-001 | 5단계 완료율 | > 80% | 사용성 테스트 |
| S-002 | 평균 대화 메시지 수 | 3-5개 | Analytics |
| UX-001 | Landing 로딩 시간 | < 2s | Lighthouse |

---

## Testing Strategy

### Unit Tests

```typescript
// components/__tests__/ChatInput.test.tsx
- Should accept valid birthDate (YYYY-MM-DD)
- Should accept valid birthTime (HH:mm)
- Should reject invalid dates
- Should save to sessionStore

// components/__tests__/ServiceSelect.test.tsx
- Should render 4 service cards
- Should navigate on card click
```

### Integration Tests

```typescript
// e2e/landing-flow.e2e.ts
- User scrolls through 5 stages
- User enters birth date/time
- User selects service
- Redirect confirmed
```

---

## Risk Management

| Risk | Mitigation |
|------|-----------|
| 대화형 입력 UX 혼동 | 명확한 프롬프트 텍스트 + 가이드 |
| 모바일 scroll-snap 버그 | iOS/Android 브라우저 테스트 |
| sessionStorage 상한선 | 최소한의 데이터만 저장 |

---

## File Structure

### New Files

```
src/components/landing/
├── LandingPage.tsx
├── ChatInput.tsx
└── ServiceSelect.tsx

src/components/landing/__tests__/
├── ChatInput.test.tsx
└── ServiceSelect.test.tsx

src/app/survey/
├── page.tsx (메인 진입점)
└── [step]/page.tsx (다단계 진입)
```

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1 (Landing) | 2 days | Ready |
| Phase 2 (Chat Input) | 2 days | Ready |
| Phase 3 (Service Select) | 1 day | Ready |
| **Total** | **5 days** | **On Track** |

---

**Plan Version**: 1.0  
**Status**: Ready for Implementation
