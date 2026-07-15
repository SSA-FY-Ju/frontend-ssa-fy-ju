---

description: "Task list for feature implementation"
---

# Tasks: 모바일·태블릿 반응형 UI 및 PWA 전환

**Input**: Design documents from `/specs/009-mobile-tablet-pwa/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: spec.md은 TDD를 요구하지 않는다. plan.md의 테스트 전략(research.md §8)에 따라 신규 공유 로직(`useBreakpoint` 훅)과 대표 컴포넌트 2개에 한해 경량 단위 테스트를 포함한다 — 65개 전 컴포넌트에 대한 전수 테스트는 아니다. 시각적 검증은 Storybook viewport와 `quickstart.md` 수동 매트릭스로 수행한다.

**Organization**: 태스크는 User Story별로 그룹화되어 있으며, Tailwind의 mobile-first 구조를 그대로 반영한다 — US1은 기본(prefix 없음) 모바일 클래스를, US2는 같은 파일에 `md:` 태블릿 클래스를 추가한다. `lg:` 이상 기존 데스크톱 클래스는 어떤 태스크에서도 수정하지 않는다(FR-006).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능(다른 파일, 선행 의존성 없음)
- **[Story]**: 해당 태스크가 속한 사용자 스토리(US1/US2/US3)
- 모든 경로는 저장소 루트(`frontend-ssa-fy-ju/`) 기준 `ssaju-frontend/`부터 시작

## Path Conventions

이 저장소는 단일 Next.js 14 App Router 프론트엔드다. 모든 구현 파일은 `ssaju-frontend/src/` 또는 `ssaju-frontend/public/` 하위에 위치한다(plan.md Project Structure 참조). 신규 백엔드/다른 프로젝트는 없다.

---

## Phase 1: Setup

**Purpose**: 반응형 작업을 시각적으로 검증할 도구 준비

- [ ] T001 [P] `@storybook/addon-viewport`를 devDependencies에 추가하고 모바일(360×640)/태블릿(768×1024)/데스크톱(1280×800) viewport 프리셋을 `ssaju-frontend/.storybook/preview.ts`(또는 `preview.tsx`)에 등록한다 (research.md §8) — `ssaju-frontend/package.json`, `ssaju-frontend/.storybook/preview.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 User Story가 공유하는 인프라. 이 phase가 끝나기 전에는 어떤 스토리 작업도 시작하지 않는다.

**⚠️ CRITICAL**: T002~T005 완료 전에는 Phase 3 이후 작업을 시작할 수 없다.

- [ ] T002 `viewport` 메타 태그에 `viewport-fit=cover`를 추가한다(FR-010, contracts/pwa-manifest.contract.md 연관 메타 태그 절) — `ssaju-frontend/src/app/layout.tsx`
- [ ] T003 [P] `env(safe-area-inset-top/right/bottom/left)` 기반 `.safe-top`, `.safe-bottom` 유틸리티 클래스를 추가한다(FR-010, research.md §7) — `ssaju-frontend/src/app/globals.css`
- [ ] T004 [P] `tailwind.config.ts`의 `screens`(xs 360 / sm 640 / md 768 / lg 1024)와 정확히 일치하는 `mobile`/`tablet`/`desktop` 3구간을 반환하는 `useBreakpoint` 훅을 생성한다(data-model.md §1 Breakpoint Tier, `matchMedia` 기반, SSR 안전 초기값 처리 포함) — `ssaju-frontend/src/hooks/useBreakpoint.ts`
- [ ] T005 [P] `useBreakpoint` 훅에 대해 `matchMedia`를 모킹해 360px/767px/768px/1023px/1024px 경계값을 포함한 3구간 분기를 검증하는 단위 테스트를 작성한다 — `ssaju-frontend/src/__tests__/unit/hooks/useBreakpoint.test.ts`

**Checkpoint**: Foundation 완료 — User Story 구현 시작 가능

---

## Phase 3: User Story 1 - 모바일 화면에서 핵심 화면이 깨지지 않고 예쁘게 보인다 (Priority: P1) 🎯 MVP

**Goal**: 360px~767px 모바일 뷰포트에서 모든 화면(랜딩~마이페이지, 인증 모달, 에러 화면)이 가로 스크롤·요소 겹침 없이 표시되고, 버튼은 44×44px 이상의 터치 영역을 가지며 서로 겹치지 않는다.

**Independent Test**: 360px~767px 뷰포트로 아래 각 화면에 접속해 가로 스크롤이 없고 모든 버튼이 개별적으로 조작 가능한지 확인한다(quickstart.md §1).

각 태스크는 `contracts/breakpoint-layout.contract.md`의 규칙(불연속 클래스만 사용, Flexbox 우선, 44px 터치 타깃, 버튼 겹침 금지, `lg:` 이상 미변경)을 기본 Tailwind variant(prefix 없음, 필요 시 `xs:`)로 적용한다.

### Implementation for User Story 1

- [ ] T006 [P] [US1] 랜딩 화면 모바일 레이아웃 적용(FR-001, FR-003, FR-004, FR-015) — `ssaju-frontend/src/app/page.tsx`, `ssaju-frontend/src/components/landing/LandingPage.tsx`, `StarryBackground.tsx`, `StoryLandingExperience.tsx`, `Brand.tsx`, `ConceptCard.tsx`, `PageDots.tsx`, `ServiceCard.tsx`, `ServiceIntroCard.tsx`, `pages/Page1.tsx`, `pages/Page2.tsx`, `pages/Page3.tsx`, `pages/Page4.tsx`, `pages/Page5.tsx`
- [ ] T007 [P] [US1] 서비스 선택 및 채팅 입력 화면 모바일 레이아웃 적용(FR-001, FR-003, FR-004, FR-015) — `ssaju-frontend/src/app/select/page.tsx`, `ssaju-frontend/src/app/chat/page.tsx`, `ssaju-frontend/src/components/landing/ServiceSelect.tsx`, `ChatInput.tsx`, `TypingIndicator.tsx`, `DatePickerField.tsx`, `TimePickerField.tsx`
- [ ] T008 [P] [US1] 커리어 타이밍 화면 모바일 레이아웃 적용(FR-001, FR-003, FR-004, FR-015) — `ssaju-frontend/src/app/career-timing/page.tsx`, `ssaju-frontend/src/components/forms/InputForm.tsx`, `CompanyAutocomplete.tsx`, `CompanyForm.tsx`, `FoundingDatePicker.tsx`, `ssaju-frontend/src/components/results/CareerTimingResult.tsx`, `LoadingProgress.tsx`, `DisclaimerOverlay.tsx`, `ssaju-frontend/src/components/visualization/MonthlyCalendar.tsx`, `OHangChart.tsx`, `ConfidenceBar.tsx`, `JobMatchingCards.tsx`
- [ ] T009 [P] [US1] 궁합 화면 모바일 레이아웃 적용(FR-001, FR-003, FR-004, FR-015) — `ssaju-frontend/src/app/compatibility/page.tsx`, `ssaju-frontend/src/app/compatibility/result/page.tsx`, `ssaju-frontend/src/components/compatibility/CompatibilityForm.tsx`, `FullPageCompatibility.tsx`, `CompatibilityScrollDetail.tsx`, `ssaju-frontend/src/components/results/CompatibilityResult.tsx`, `ssaju-frontend/src/components/visualization/CompatibilityScore.tsx`
- [ ] T010 [P] [US1] 상담 화면 모바일 레이아웃 적용(FR-001, FR-003, FR-004, FR-015) — `ssaju-frontend/src/app/consultation/page.tsx`, `ssaju-frontend/src/components/consultation/FullPageConsultation.tsx`, `ConsultationScrollDetail.tsx`, `SectionNavigator.tsx`, `SignupPromptModal.tsx`, `FeedbackNudge.tsx`, `FeedbackPromptCard.tsx`, `ssaju-frontend/src/components/results/ConsultationLoading.tsx`, `FeedbackButton.tsx`, `ssaju-frontend/src/components/modals/FeedbackModal.tsx`
- [ ] T011 [P] [US1] 마이페이지 화면 모바일 레이아웃 적용(FR-001, FR-003, FR-004, FR-015) — `ssaju-frontend/src/app/my-page/page.tsx`, `ssaju-frontend/src/app/my-page/[id]/page.tsx`, `ssaju-frontend/src/components/history/HistoryCard.tsx`, `HistoryTabs.tsx`, `InfiniteScroll.tsx`, `EmptyState.tsx`, `Pagination.tsx`, `ProfileCard.tsx`, `DeleteConfirmModal.tsx`, `ssaju-frontend/src/components/results/HistoryDetailPage.tsx`, `SaveButton.tsx`
- [ ] T012 [P] [US1] 공통 헤더/내비게이션/모달 shell 모바일 레이아웃 적용(FR-001, FR-003, FR-015) — `ssaju-frontend/src/components/common/Header.tsx`, `BaseModal.tsx`, `PageExitModal.tsx`, `ssaju-frontend/src/components/navigation/TabNavigation.tsx`, `ssaju-frontend/src/components/ui/dialog.tsx`, `ssaju-frontend/src/components/modals/CompanyConfirmModal.tsx`
- [ ] T013 [P] [US1] 인증 모달 모바일 레이아웃 적용(FR-001, FR-011, FR-015) — `ssaju-frontend/src/components/auth/AuthModal.tsx`, `LoginModal.tsx`, `LoginButton.tsx`, `ProfileMenu.tsx`, `WithdrawalModal.tsx`
- [ ] T014 [P] [US1] 에러/404 화면 모바일 레이아웃 적용(FR-001, FR-011) — `ssaju-frontend/src/app/error.tsx`, `ssaju-frontend/src/app/not-found.tsx`, `ssaju-frontend/src/components/errors/ErrorBoundary.tsx`, `ErrorMessage.tsx`
- [ ] T015 [US1] 채팅 입력창이 가상 키보드 노출 시에도 가려지지 않도록 `.safe-bottom`(T003) 유틸리티와 하단 고정 배치를 적용한다(Acceptance Scenario 3, 의존: T003, T007) — `ssaju-frontend/src/components/landing/ChatInput.tsx`
- [ ] T016 [P] [US1] `ChatInput`, `ServiceSelect`에 대해 모바일 구간 클래스 분기(스냅샷/클래스 존재 검증)를 확인하는 대표 단위 테스트를 작성한다 — `ssaju-frontend/src/__tests__/unit/components/ChatInput.mobile.test.tsx`, `ssaju-frontend/src/__tests__/unit/components/ServiceSelect.mobile.test.tsx`

**Checkpoint**: User Story 1 완료 — 모바일에서 전체 서비스가 독립적으로 사용 가능해야 한다.

---

## Phase 4: User Story 2 - 태블릿 화면에서 여백을 활용한 레이아웃이 제공된다 (Priority: P2)

**Goal**: 768px~1023px 태블릿 뷰포트에서 모바일 레이아웃의 단순 확대가 아닌, 태블릿 폭을 활용한 별도 구성(다단 배치 등)을 제공하고 회전 시에도 깨지지 않는다.

**Independent Test**: 768px~1023px 뷰포트(세로/가로)로 각 화면에 접속해 모바일과 다른 다단 배치가 적용되고 회전 시 레이아웃이 재조정되는지 확인한다(quickstart.md §1).

각 태스크는 US1에서 만든 동일 파일에 `md:` variant를 추가하는 작업이며, 기존 모바일(prefix 없음)·데스크톱(`lg:`) 클래스는 변경하지 않는다.

### Implementation for User Story 2

- [ ] T017 [P] [US2] 랜딩 화면 태블릿(`md:`) 레이아웃 추가(FR-002, FR-013) — T006과 동일 파일 목록
- [ ] T018 [P] [US2] 서비스 선택/채팅 화면 태블릿(`md:`) 레이아웃 추가(FR-002, FR-013) — T007과 동일 파일 목록
- [ ] T019 [P] [US2] 커리어 타이밍 화면 태블릿(`md:`) 레이아웃 추가(FR-002, FR-013) — T008과 동일 파일 목록
- [ ] T020 [P] [US2] 궁합 화면 태블릿(`md:`) 레이아웃 추가(FR-002, FR-013) — T009와 동일 파일 목록
- [ ] T021 [P] [US2] 상담 화면 태블릿(`md:`) 레이아웃 추가(FR-002, FR-013) — T010과 동일 파일 목록
- [ ] T022 [P] [US2] 마이페이지 화면 태블릿(`md:`) 레이아웃 추가(FR-002, FR-013) — T011과 동일 파일 목록
- [ ] T023 [P] [US2] 공통 헤더/내비게이션/모달 shell 태블릿(`md:`) 레이아웃 추가(FR-002, FR-013) — T012와 동일 파일 목록
- [ ] T024 [US2] T017~T023 전 화면에 대해 세로↔가로 회전 및 767px↔768px, 1023px↔1024px 경계 전환을 DevTools로 점검하고 즉시 전환(비유동)되는지 확인한다(FR-005, FR-014, quickstart.md §1, 의존: T017-T023)
- [ ] T025 [P] [US2] `ServiceSelect`에 대해 태블릿 구간 클래스 분기를 검증하는 대표 단위 테스트를 추가한다 — `ssaju-frontend/src/__tests__/unit/components/ServiceSelect.tablet.test.tsx`

**Checkpoint**: User Story 1과 2가 함께 독립적으로 동작해야 한다.

---

## Phase 5: User Story 3 - 앱처럼 설치하고 실행할 수 있다 (Priority: P3)

**Goal**: 지원 브라우저에서 서비스를 홈 화면에 설치하고, 설치된 아이콘 실행 시 브라우저 주소창 없이 standalone으로 동작한다.

**Independent Test**: 지원 브라우저에서 설치 후 홈 화면 아이콘 실행 시 standalone 화면으로 열리는지 확인한다(quickstart.md §3).

### Implementation for User Story 3

- [ ] T026 [P] [US3] `contracts/pwa-manifest.contract.md` §"필수 인스턴스"에 따라 아이콘 자산을 생성한다: `icon-192.png`(any), `icon-512.png`(any), `icon-maskable-512.png`(maskable), `apple-touch-icon.png`(180×180) — `ssaju-frontend/public/icons/`
- [ ] T027 [US3] `contracts/pwa-manifest.contract.md` 스펙대로 Next.js `MetadataRoute.Manifest`를 반환하는 매니페스트를 작성한다(`display: "standalone"` 고정, `background_color`/`theme_color`를 `night.900`(`#0a0e27`)과 일치, T026 아이콘 참조, 의존: T026) — `ssaju-frontend/src/app/manifest.ts`
- [ ] T028 [US3] `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon` 메타/링크 태그를 추가한다(contracts/pwa-manifest.contract.md 연관 메타 태그 절, 의존: T002, T026) — `ssaju-frontend/src/app/layout.tsx`
- [ ] T029 [P] [US3] 캐싱 없이 모든 요청을 그대로 통과시키는 최소 서비스 워커를 작성한다. 기존 `public/mockServiceWorker.js`(MSW, 개발/테스트 전용)와 스코프·파일명이 겹치지 않아야 한다(research.md §4) — `ssaju-frontend/public/sw.js`
- [ ] T030 [US3] 프로덕션 빌드에서만(`process.env.NODE_ENV === 'production'`) `navigator.serviceWorker.register('/sw.js')`를 호출하도록 등록 로직을 추가한다(의존: T029) — `ssaju-frontend/src/app/providers.tsx`
- [ ] T031 [P] [US3] Android(`beforeinstallprompt` 캡처 후 설치 버튼 노출)와 iOS Safari(공유 → 홈 화면에 추가 안내) 분기를 갖는 설치 안내 배너 컴포넌트를 작성한다(research.md §5, SC-003) — `ssaju-frontend/src/components/common/InstallPromptBanner.tsx`
- [ ] T032 [US3] `InstallPromptBanner`를 루트 레이아웃에 통합한다(의존: T031) — `ssaju-frontend/src/app/layout.tsx`
- [ ] T033 [P] [US3] `InstallPromptBanner`의 Android/iOS 분기 렌더링을 검증하는 단위 테스트를 작성한다 — `ssaju-frontend/src/__tests__/unit/components/InstallPromptBanner.test.tsx`

**Checkpoint**: User Story 1, 2, 3 모두 독립적으로 동작해야 한다.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 전체 스토리에 걸친 최종 검증

- [ ] T034 [P] `quickstart.md` §1의 대표 해상도 × 화면 조합 매트릭스를 수동으로 전수 점검하고 결과를 기록한다(SC-001, SC-006, SC-007)
- [ ] T035 [P] Chrome DevTools Lighthouse의 Progressive Web App(Installable) 감사를 실행하고 실패 항목을 수정한다(quickstart.md §3, SC-003, SC-004)
- [ ] T036 [P] `npm run test`(`ssaju-frontend/`)로 전체 테스트 스위트를 실행하고 회귀를 수정한다
- [ ] T037 `quickstart.md` §2에 따라 1024px 이상 데스크톱 해상도에서 모든 화면의 레이아웃/동작이 기존과 동일한지 최종 확인한다(FR-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 — 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 이후. T002~T005 완료 전까지 모든 User Story 작업 차단
- **User Story 1 (Phase 3)**: Foundational 완료 후 시작 가능. 다른 스토리에 의존하지 않음
- **User Story 2 (Phase 4)**: Foundational 완료 후 시작 가능하나, US1이 각 화면에 만든 파일을 그대로 확장하므로 **동일 화면 태스크는 US1 이후에 진행**을 권장(예: T017은 T006 이후)
- **User Story 3 (Phase 5)**: Foundational(특히 T002 viewport 메타) 완료 후 시작 가능. US1/US2와 파일이 겹치지 않아 병렬 진행 가능
- **Polish (Phase 6)**: 검증 대상 스토리가 모두 완료된 후 진행

### Within Each User Story

- 화면별 태스크(T006~T014, T017~T023)는 서로 다른 파일이라 `[P]` 병렬 가능
- T015(채팅 입력 세이프 영역)는 T003, T007 이후
- T024(회전/경계 검증)는 T017~T023 이후
- T027(manifest)은 T026(아이콘) 이후, T028(메타 태그)은 T002, T026 이후
- T030(SW 등록)은 T029(SW 파일) 이후, T032(배너 통합)는 T031(배너 컴포넌트) 이후

### Parallel Opportunities

- Foundational: T003, T004, T005는 서로 다른 파일이므로 병렬 가능(T002도 별도 파일)
- US1: T006~T014(9개 화면/shell 태스크)는 모두 다른 파일이므로 전부 병렬 가능
- US2: T017~T023(7개)도 모두 다른 파일이므로 병렬 가능(단, 같은 화면의 US1 태스크가 먼저 끝나야 함)
- US3: T026, T029, T031, T033은 서로 다른 파일이라 병렬 가능
- Foundational 완료 후에는 인력이 있다면 US1/US2/US3를 팀 단위로 동시 진행 가능(단 US2는 화면별로 US1 완료를 선행 조건으로 둘 것)

---

## Parallel Example: User Story 1

```bash
# Foundational(T002-T005) 완료 후, US1의 화면별 태스크를 동시에 진행:
Task: "랜딩 화면 모바일 레이아웃 적용 — ssaju-frontend/src/app/page.tsx 외 landing 컴포넌트"
Task: "서비스 선택/채팅 화면 모바일 레이아웃 적용 — ssaju-frontend/src/app/select, /chat"
Task: "커리어 타이밍 화면 모바일 레이아웃 적용 — ssaju-frontend/src/app/career-timing"
Task: "궁합 화면 모바일 레이아웃 적용 — ssaju-frontend/src/app/compatibility"
Task: "상담 화면 모바일 레이아웃 적용 — ssaju-frontend/src/app/consultation"
Task: "마이페이지 화면 모바일 레이아웃 적용 — ssaju-frontend/src/app/my-page"
Task: "공통 헤더/내비게이션/모달 shell 모바일 레이아웃 적용"
Task: "인증 모달 모바일 레이아웃 적용"
Task: "에러/404 화면 모바일 레이아웃 적용"
```

---

## Implementation Strategy

### MVP First (User Story 1만)

1. Phase 1 Setup 완료
2. Phase 2 Foundational 완료(필수 — 모든 스토리를 막음)
3. Phase 3 User Story 1 완료
4. **STOP and VALIDATE**: quickstart.md §1을 모바일 대표 해상도로만 실행해 독립적으로 검증
5. 필요 시 이 시점에서 배포/데모(모바일 MVP)

### Incremental Delivery

1. Setup + Foundational → 기반 완료
2. User Story 1 추가 → 모바일에서 독립 검증 → 배포/데모(MVP)
3. User Story 2 추가 → 태블릿까지 독립 검증 → 배포/데모
4. User Story 3 추가 → PWA 설치까지 독립 검증 → 배포/데모
5. Phase 6 Polish로 전체 마무리(데스크톱 회귀 없음 최종 확인 포함)

### Parallel Team Strategy

여러 인원이 작업할 경우:

1. Setup + Foundational을 함께 완료
2. Foundational 완료 후:
   - 개발자 A: User Story 1(화면별 태스크를 다시 분담 가능)
   - 개발자 B: User Story 1 완료 대기 후 User Story 2(같은 화면 파일이라 순차 필요)
   - 개발자 C: User Story 3(파일이 겹치지 않아 US1/US2와 완전 병렬 가능)

---

## Notes

- `[P]` 태스크 = 서로 다른 파일, 선행 의존성 없음
- `[Story]` 라벨은 태스크를 특정 사용자 스토리에 매핑해 추적성을 보장
- 각 사용자 스토리는 독립적으로 완료·검증 가능해야 한다
- 태스크 완료마다(또는 논리적 단위로) 커밋
- 체크포인트에서 멈춰 스토리 단위로 독립 검증 가능
- 피할 것: 모호한 태스크, 동일 파일 충돌, 스토리 독립성을 깨는 교차 의존
