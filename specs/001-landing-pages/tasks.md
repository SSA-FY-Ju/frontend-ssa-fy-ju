# Implementation Tasks: 랜딩 페이지 및 입력 인터페이스

**Feature**: 001-landing-pages  
**Phase**: Phase 1 (Core User Flow - Entry Point)  
**Total Estimated Tasks**: 28  
**Estimated Duration**: 5 days  
**User Story**: US0 - 스토리텔링 진입 및 대화형 입력

---

## Task Execution Strategy

### Independent Test Criteria

사용자 다음 흐름이 완전히 동작해야 함:
```
/ (루트) 진입 
  → 5단계 랜딩 페이지 스크롤 (900ms lock)
  → "내 별자리 보러 가기" 버튼 클릭
  → ChatInput (챗봇 메시지)
  → 생년월일 date picker 입력
  → 생년시간 time picker 입력
  → "서비스 고르러 가기" 버튼 클릭
  → 4개 서비스 카드 표시
  → 카드 클릭 시 해당 서비스 페이지 진입
```

각 단계가 독립적으로 테스트 가능해야 함.

### Parallel Execution Map

**Phase 1 (Landing Page)**: T001-T010은 컴포넌트/스타일 별로 병렬화 가능
- [P] T003, T004, T005, T006 (각 페이지 콘텐츠)
- [P] T007, T008 (포인트 인디케이터, 네비게이션)
- [P] T009, T010 (애니메이션, 이벤트)

**Phase 2 (Chat Input)**: T011-T020은 입력 필드별 병렬화 가능
- [P] T012, T013, T014 (Chat 레이아웃, 입력 필드, 메시지)
- [P] T015, T016 (Zod 검증, sessionStore)
- [P] T017, T018 (타이밍 애니메이션, 버튼)

**Phase 3 (Service Select)**: T021-T028은 카드별 병렬화 가능
- [P] T022, T023, T024 (4개 카드 그리드, 스타일)
- [P] T025, T026 (마우스 이펙트, 라우팅)
- [P] T027, T028 (통합 테스트, E2E)

---

## Phase 1: Landing Page Components (2 days)

### T001 - 프로젝트 구조 및 라우팅 설정

- [ ] T001 Create `/survey` route structure with nested pages in `src/app/survey/` directory

**Description**:
Create folder structure for landing page feature:
```
src/app/survey/
├── page.tsx (메인 진입점 - LandingPage)
├── layout.tsx (서브 레이아웃)
└── styles/ (공유 스타일)

src/components/landing/
├── LandingPage.tsx (5단계 스토리텔링)
├── ChatInput.tsx (대화형 입력)
├── ServiceSelect.tsx (4개 서비스 카드)
└── __tests__/ (테스트 파일들)
```

**Acceptance**:
- ✅ `/survey` 라우트 진입 가능
- ✅ 폴더 구조 완성

---

### T002 - LandingPage 메인 컴포넌트 구조

- [ ] T002 Implement `src/components/landing/LandingPage.tsx` with CSS scroll-snap container and state management

**Description**:
Main landing page component with:
- CSS scroll-snap vertical container (scroll-snap-type: y mandatory)
- useState for current page (0-4)
- 5개 페이지를 감싸는 wrapper
- sessionStorage 진행상태 저장/복구 로직
- 페이지 전환 900ms 잠금 (setDisabledInput)

**Acceptance**:
- ✅ scroll-snap 동작 확인
- ✅ 5개 페이지 모두 렌더링
- ✅ currentPage state 업데이트

---

### T003 [P] - Page 1: 도입부 콘텐츠

- [ ] T003 [P] [US0] Create Page 1 (Introduction) content in `src/components/landing/pages/Page1.tsx`

**Description**:
Page 1 - 도입부:
```
// Tailwind 클래스 활용
- 별이 빛나는 밤하늘 배경 (gradient + star animation)
- "SSAju · 별이 빛나는 밤, 당신의 길을 묻다" 로고 텍스트
- "취업 고민, 많으시죠?" 큰 헤드라인
- 감성적 부제 텍스트
- 하단 "다음 페이지" 힌트 텍스트
```

**Files**:
- `src/components/landing/pages/Page1.tsx` (NEW)
- `src/styles/landing.css` (NEW - 별 애니메이션)

**Acceptance**:
- ✅ 페이지 전체 화면 차지 (h-screen w-screen)
- ✅ 별 애니메이션 10초 루프
- ✅ 텍스트 모두 표시

---

### T004 [P] - Page 2: 4가지 취준 고민 카드

- [ ] T004 [P] [US0] Create Page 2 (Job Search Concerns) with 4 concern cards in `src/components/landing/pages/Page2.tsx`

**Description**:
Page 2 - 4가지 취준 고민 카드:
- 카드 그리드 (2x2 또는 반응형)
- 각 카드: 아이콘 + 제목 + 부제
- 예시: "언제 지원하면 될까요?", "어떤 회사가 맞을까요?" 등
- 호버 효과 (subtle shadow/scale)

**Files**:
- `src/components/landing/pages/Page2.tsx` (NEW)
- `src/components/landing/ConceptCard.tsx` (NEW)

**Acceptance**:
- ✅ 4개 카드 모두 렌더링
- ✅ 호버 이펙트 작동
- ✅ 반응형 배치

---

### T005 [P] - Page 3: 서비스 소개

- [ ] T005 [P] [US0] Create Page 3 (Service Introduction) in `src/components/landing/pages/Page3.tsx`

**Description**:
Page 3 - 서비스 소개:
- 큰 헤드라인: "저희가 풀어드릴게요"
- 사주 × AI 결합 설명
- 시각적 구분: 점진적 reveal 애니메이션

**Files**:
- `src/components/landing/pages/Page3.tsx` (NEW)

**Acceptance**:
- ✅ 헤드라인 및 설명 텍스트 표시
- ✅ Reveal 애니메이션 부드러움

---

### T006 [P] - Page 4: 4가지 서비스 소개 카드

- [ ] T006 [P] [US0] Create Page 4 (Services Overview) with 4 service cards in `src/components/landing/pages/Page4.tsx`

**Description**:
Page 4 - 4가지 서비스 소개:
- 카드 그리드
- 각 카드: 번호 + 서비스명 + 설명 + 예상 소요 시간
  - 01 관운 분석 (3-5초)
  - 02 AI 커리어 컨설팅 (15-20초)
  - 03 기업 궁합 분석 (5-8초)
  - 04 만족도 피드백 (1-2초)

**Files**:
- `src/components/landing/pages/Page4.tsx` (NEW)
- `src/components/landing/ServiceIntroCard.tsx` (NEW)

**Acceptance**:
- ✅ 4개 서비스 카드 표시
- ✅ 예상 소요 시간 명시

---

### T007 [P] - Page 5: CTA 버튼

- [ ] T007 [P] [US0] Create Page 5 (Call-to-Action) with "내 별자리 보러 가기" button in `src/components/landing/pages/Page5.tsx`

**Description**:
Page 5 - CTA:
- 헤드라인: "당신의 별, 읽어드릴게요"
- 큰 CTA 버튼: "내 별자리 보러 가기 →"
- 버튼 클릭 시 ChatInput으로 전환 (상태 관리)

**Files**:
- `src/components/landing/pages/Page5.tsx` (NEW)

**Acceptance**:
- ✅ 버튼 클릭 시 ChatInput 렌더링
- ✅ 상태 전환 매끄러움

---

### T008 [P] - 포인트 인디케이터 네비게이션

- [ ] T008 [P] [US0] Create page dot indicator component in `src/components/landing/PageDots.tsx`

**Description**:
5개 점 인디케이터:
- 현재 페이지 강조 (색상, 크기)
- 점 클릭 시 해당 페이지로 즉시 이동
- 조건: 900ms 잠금 중에는 클릭 비활성화

**Files**:
- `src/components/landing/PageDots.tsx` (NEW)

**Acceptance**:
- ✅ 5개 점 렌더링
- ✅ 점 클릭 시 페이지 이동
- ✅ 잠금 중 클릭 방지

---

### T009 [P] - 페이지 전환 애니메이션 (900ms 잠금)

- [ ] T009 [P] [US0] Implement page transition animation with 900ms debounce lock in `src/components/landing/LandingPage.tsx`

**Description**:
페이지 전환 로직:
- setDisabledInput 상태 관리 (900ms 동안 true)
- 마우스 휠 이벤트 (wheel)
- 터치 스와이프 (touch start/end)
- 키보드 이벤트 (ArrowDown, ArrowUp, PageDown, PageUp, Space)
- 첫/마지막 페이지에서 방향 제약

**Acceptance**:
- ✅ 900ms 정확한 잠금
- ✅ 모든 입력 방식 동작
- ✅ 첫/마지막 페이지 제약

---

### T010 [P] - 페이지 진입 애니메이션 (fade/slide)

- [ ] T010 [P] [US0] Add page entrance animations (fade-in, slide-up) in `src/styles/landing.css`

**Description**:
각 페이지 진입 시 애니메이션:
- Fade-in: opacity 0 → 1 (300ms)
- Slide-up: translateY(20px) → 0 (300ms)
- CSS keyframes 활용

**Files**:
- `src/styles/landing.css` (UPDATE)

**Acceptance**:
- ✅ 페이지 전환 시 애니메이션 작동
- ✅ 300ms 부드러운 진입

---

## Phase 2: Chat Input Component (2 days)

### T011 - ChatInput 메인 컴포넌트 구조

- [ ] T011 Create `src/components/landing/ChatInput.tsx` with message-based chat UI

**Description**:
ChatInput 컴포넌트:
- 메시지 버블 스타일 (User: 오른쪽, Bot: 왼쪽)
- 메시지 시간 순서대로 표시
- 스크롤 시 항상 최신 메시지로 이동 (useEffect + useRef)
- 입력 필드를 하단에 고정

**Files**:
- `src/components/landing/ChatInput.tsx` (NEW)

**Acceptance**:
- ✅ 메시지 렌더링
- ✅ 스크롤 자동 하단 이동
- ✅ 입력 필드 고정

---

### T012 [P] - 생년월일 날짜 입력 필드

- [ ] T012 [P] [US0] Implement date picker input field in `src/components/landing/DatePickerField.tsx`

**Description**:
생년월일 입력:
- HTML5 `<input type="date">` 또는 커스텀 date picker
- "YYYY년 M월 D일" 형식으로 표시 (사용자 버블)
- 유효성 검사: 과거 날짜만 허용 (연령 > 0)
- Zod 검증 (parseSessionData)

**Files**:
- `src/components/landing/DatePickerField.tsx` (NEW)
- `src/lib/validation/schemas.ts` (이미 생성됨)

**Acceptance**:
- ✅ 날짜 선택 가능
- ✅ 유효성 검사 동작
- ✅ 사용자 버블에 포맷된 날짜 표시

---

### T013 [P] - 생년시간 시간 입력 필드

- [ ] T013 [P] [US0] Implement time picker with quick chips in `src/components/landing/TimePickerField.tsx`

**Description**:
생년시간 입력:
- HTML5 `<input type="time">` (기본값: 12:00)
- 빠른 입력 칩: 00:00, 06:00, 12:00, 18:00
- 칩 클릭 시 time picker에 자동 반영
- Zod 검증 (HH:mm)

**Files**:
- `src/components/landing/TimePickerField.tsx` (NEW)

**Acceptance**:
- ✅ 시간 선택 가능
- ✅ 칩 클릭 반영
- ✅ 기본값 12:00

---

### T014 [P] - 순차 봇 메시지 시퀀스

- [ ] T014 [P] [US0] Implement bot message sequence with timing in `src/components/landing/ChatInput.tsx`

**Description**:
봇 메시지 타이밍:
```
1. ChatInput 렌더링 후 400ms → "안녕하세요. 저는 SSAju예요. ✨"
2. +500ms → "당신의 별자리를 함께 읽어보고 싶어요."
3. +500ms → "먼저, 태어나신 날짜를 알려주실래요?" (DatePickerField 렌더링)
```

**Acceptance**:
- ✅ 400ms 정확도
- ✅ 메시지 순서 정확
- ✅ 입력 필드 타이밍 정확

---

### T015 [P] - 세션 데이터 검증 (Zod)

- [ ] T015 [P] [US0] Validate birth date and time with Zod schema in `src/lib/validation/schemas.ts`

**Description**:
Zod 검증:
- SessionDataSchema: birthDate (YYYY-MM-DD) + birthTime (HH:mm)
- parseSessionData() 함수
- 유효하지 않으면 ZodError throw
- 에러 메시지 한국어 표시

**Files**:
- `src/lib/validation/schemas.ts` (이미 생성됨 - verify만)

**Acceptance**:
- ✅ 유효한 날짜 검증 통과
- ✅ 유효하지 않은 날짜 거부
- ✅ 에러 메시지 명확

---

### T016 [P] - SessionStore에 데이터 저장

- [ ] T016 [P] [US0] Save validated birth date/time to sessionStore in `src/stores/sessionStore.ts`

**Description**:
SessionStore 저장:
- setBirthDate(birthDate)
- setBirthTime(birthTime)
- sessionStorage에 자동 persist (Zustand persist middleware)
- 페이지 새로고침 후에도 복구

**Files**:
- `src/stores/sessionStore.ts` (이미 수정됨)

**Acceptance**:
- ✅ 데이터 저장됨
- ✅ 새로고침 후 복구
- ✅ sessionStorage 업데이트 확인

---

### T017 [P] - 타이핑 인디케이터 애니메이션

- [ ] T017 [P] [US0] Implement typing indicator animation in `src/components/landing/TypingIndicator.tsx`

**Description**:
타이핑 인디케이터:
- "..." 점 3개 애니메이션 (0.6초 총 지속)
- 각 점 0.2초 주기 스케일 업/다운
- 날짜 입력 후 0.6초, 시간 입력 후 0.6초 표시

**Files**:
- `src/components/landing/TypingIndicator.tsx` (NEW)
- `src/styles/landing.css` (UPDATE - keyframes)

**Acceptance**:
- ✅ 애니메이션 부드러움
- ✅ 0.6초 정확도
- ✅ 메시지 표시 타이밍 정확

---

### T018 [P] - "서비스 고르러 가기" 버튼

- [ ] T018 [P] [US0] Implement "Go to Services" button in `src/components/landing/ChatInput.tsx`

**Description**:
버튼 동작:
- 생년시간 입력 후 1.7초 후 렌더링
- 클릭 시 state 변경 → ServiceSelect 컴포넌트 렌더링
- 버튼 텍스트: "서비스 고르러 가기 →"

**Acceptance**:
- ✅ 버튼 렌더링 타이밍 정확
- ✅ 클릭 시 ServiceSelect 진입
- ✅ 입력값 유지

---

## Phase 3: Service Select Component (1 day)

### T019 - ServiceSelect 메인 컴포넌트

- [ ] T019 Create `src/components/landing/ServiceSelect.tsx` with 4 service cards grid

**Description**:
ServiceSelect 컴포넌트:
- "STEP 02 · 서비스 선택" 레이블
- "어떤 별자리부터 보여드릴까요?" 제목
- 입력된 생년월일·시간 금색 강조 표시
- 4개 서비스 카드 그리드

**Files**:
- `src/components/landing/ServiceSelect.tsx` (NEW)

**Acceptance**:
- ✅ 4개 카드 렌더링
- ✅ 입력값 표시
- ✅ 레이아웃 모바일 반응형

---

### T020 [P] - 서비스 카드 기본 스타일

- [ ] T020 [P] [US0] Create service card component in `src/components/landing/ServiceCard.tsx`

**Description**:
각 카드:
- 번호 + 서비스명 + 설명
- 예상 소요 시간 표시
- 클릭 가능 상태

**Files**:
- `src/components/landing/ServiceCard.tsx` (NEW)

**Acceptance**:
- ✅ 4개 카드 정보 정확
- ✅ 클릭 가능
- ✅ 호버 효과

---

### T021 [P] - 마우스 라이트 이펙트 (radial-gradient)

- [ ] T021 [P] [US0] Implement mouse light effect with radial-gradient in `src/components/landing/ServiceCard.tsx`

**Description**:
라이트 이펙트:
- CSS custom properties: --mx, --my (마우스 좌표)
- radial-gradient 광원 효과
- 마우스 움직임에 실시간 반응
- 마우스 벗어나면 사라짐

**Acceptance**:
- ✅ 마우스 이펙트 부드러움
- ✅ 성능 최적화 (throttle)
- ✅ 데스크톱에서만 동작

---

### T022 [P] - 카드 클릭 시 라우팅

- [ ] T022 [P] [US0] Implement service card click routing in `src/components/landing/ServiceSelect.tsx`

**Description**:
각 카드 클릭:
- 관운 분석 → `/career-timing`
- AI 컨설팅 → `/consultation`
- 기업 궁합 → `/compatibility` (기업명 입력 화면)
- 피드백 → `/feedback`

**Files**:
- `src/components/landing/ServiceSelect.tsx` (UPDATE)
- `src/app/survey/page.tsx` (UPDATE - 라우팅 로직)

**Acceptance**:
- ✅ 정확한 라우팅
- ✅ 입력값 sessionStore 유지
- ✅ 이동 후 백버튼 작동

---

### T023 [P] - "처음으로" 뒤로 가기 버튼

- [ ] T023 [P] [US0] Implement "Go Back" button to ChatInput in `src/components/landing/ServiceSelect.tsx`

**Description**:
뒤로 가기:
- 버튼 클릭 시 ChatInput 화면으로 복귀
- 입력된 생년월일·시간 유지 (초기화 안 함)

**Acceptance**:
- ✅ 상태 복구 정확
- ✅ 입력값 유지

---

## Phase 4: Integration & Testing (Optional but Recommended)

### T024 - ChatInput에서 "처음으로" 뒤로 가기

- [ ] T024 Create "Go Back" button in ChatInput to LandingPage

**Description**:
ChatInput에서 LandingPage로:
- Page 5로 이동
- 생년월일·시간 초기화 (선택)

---

### T025 - 전체 흐름 E2E 테스트

- [ ] T025 Create E2E test `src/__tests__/e2e/landing-flow.e2e.ts` with Cypress

**Description**:
E2E 테스트:
1. `/survey` 방문
2. 5단계 스크롤 (포인트 클릭, 마우스 휠)
3. "내 별자리 보러 가기" 클릭
4. ChatInput 메시지 확인
5. 생년월일 입력
6. 생년시간 입력
7. "서비스 고르러 가기" 클릭
8. 서비스 카드 확인
9. 카드 클릭 후 라우팅 확인

**Acceptance**:
- ✅ 모든 단계 통과
- ✅ 타이밍 정확 (400ms, 1.5s, 1.7s)
- ✅ 라우팅 정확

---

### T026 - ChatInput 단위 테스트

- [ ] T026 Create unit tests in `src/components/landing/__tests__/ChatInput.test.tsx`

**Description**:
테스트:
- 메시지 렌더링
- 입력 필드 동작
- 검증 오류 처리
- sessionStore 저장 확인

---

### T027 - ServiceSelect 단위 테스트

- [ ] T027 Create unit tests in `src/components/landing/__tests__/ServiceSelect.test.tsx`

**Description**:
테스트:
- 4개 카드 렌더링
- 클릭 이벤트
- 라우팅 확인
- 라이트 이펙트

---

### T028 - 성능 및 접근성 테스트

- [ ] T028 Run Lighthouse audit and WCAG accessibility checks

**Description**:
검증:
- 페이지 로드 시간 < 3초
- 라이트하우스 점수 > 90
- 키보드 네비게이션 가능
- 스크린 리더 호환

---

## Dependencies & Execution Order

```
Phase 1 (Landing Page)
├── T001: 프로젝트 구조
├── T002: LandingPage 메인
├── [P] T003-T007: 5개 페이지 콘텐츠
├── [P] T008: 포인트 인디케이터
├── [P] T009-T010: 애니메이션
└── (ALL COMPLETE) ✅ Landing Page 진입점 완성

↓

Phase 2 (Chat Input)
├── T011: ChatInput 메인
├── [P] T012-T014: 입력 필드 + 메시지 시퀀스
├── [P] T015-T016: 검증 + 저장
├── [P] T017-T018: 애니메이션 + 버튼
└── (ALL COMPLETE) ✅ ChatInput 완성

↓

Phase 3 (Service Select)
├── T019: ServiceSelect 메인
├── T020: 카드 스타일
├── [P] T021-T023: 이펙트 + 라우팅
└── (ALL COMPLETE) ✅ Service Select 완성

↓

Phase 4 (Integration)
├── T024: ChatInput 뒤로 가기
├── T025: E2E 테스트
├── T026: ChatInput 단위 테스트
├── T027: ServiceSelect 단위 테스트
└── T028: 성능 검증
```

---

## Success Metrics

| 메트릭 | 목표값 | 검증 |
|--------|-------|------|
| Page Load Time | < 3초 | Lighthouse |
| Page Transition | 900ms ±50ms | 수동 테스트 |
| Chat Flow Duration | < 5초 | E2E 테스트 |
| Accessibility Score | WCAG AA | axe DevTools |
| Mobile Responsiveness | 모든 뷰포트 | 수동 테스트 |

---

## Implementation Notes

1. **CSS scroll-snap**: iOS Safari에서 테스트 필수 (스크롤 동작 버그 가능)
2. **sessionStorage**: 최대 10MB 제한, 현재는 birthDate + birthTime만 저장 (안전)
3. **date/time input**: 브라우저별 UI 차이 (iPhone에서 네이티브 picker 사용)
4. **라이트 이펙트**: requestAnimationFrame + throttle로 60fps 유지

---

**Created**: 2026-05-15  
**Version**: 1.0  
**Status**: Ready for Implementation  
**MVP Scope**: T001-T023 (기본 흐름) + T025 (E2E 검증)
