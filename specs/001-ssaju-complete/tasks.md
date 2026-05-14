# 구현 작업 계획 (Tasks): SSAju 프론트엔드 완성

**Feature**: SSAju 프론트엔드 완성 명세서  
**Spec**: `/specs/001-ssaju-complete/spec.md`  
**Plan**: `/specs/001-ssaju-complete/plan.md`  
**Constitution**: `/.specify/memory/constitution.md`  
**Status**: Ready for Implementation  
**Generated**: 2026-05-11 | **Updated**: 2026-05-14 (Swiper.js 마이그레이션 Phase 10 추가)

---

## 📋 목차

1. [Phase 1: Setup](#phase-1-setup---프로젝트-초기화)
2. [Phase 2: Foundational](#phase-2-foundational---개발-기초-인프라)
3. [Phase 3: US1 - 소셜 로그인 및 회원 관리](#phase-3-us1---소셜-로그인-및-회원-관리)
4. [Phase 4: US3 - 관운 기반 채용 시기 분석](#phase-4-us3---관운-기반-채용-시기-분석)
5. [Phase 5: US4 - AI 기반 커리어 컨설팅](#phase-5-us4---ai-기반-커리어-컨설팅)
6. [Phase 6: US5 - 기업 궁합 분석](#phase-6-us5---기업-궁합-분석)
7. [Phase 7: US6 - 만족도 피드백](#phase-7-us6---만족도-피드백)
8. [Phase 8: US2 - 마이페이지 및 분석 히스토리](#phase-8-us2---마이페이지-및-분석-히스토리-조회)
9. [Phase 9: Polish & Cross-cutting](#phase-9-polish--cross-cutting-concerns)
10. [Phase 10: Swiper.js 마이그레이션](#phase-10-swiperjs-마이그레이션---ai-컨설팅-풀페이지-스크롤)
11. [Dependencies & Parallel Execution](#dependencies--parallel-execution)

---

## Phase 1: Setup - 프로젝트 초기화

### 1.1 프로젝트 구조 및 개발 환경 설정

- [x] T001 프로젝트 기본 구조 생성 및 디렉토리 트리 구축 (`src/app`, `src/components`, `src/hooks`, `src/services`)
- [x] T002 TypeScript 설정 (`tsconfig.json` - strict: true 강제)
- [x] T003 ESLint & Prettier 규칙 적용 (헌법 원칙 II: 한국어 주석 의무)
- [x] T004 Next.js App Router 설정 (`layout.tsx` - 모든 페이지에 'use client' 적용)
- [ ] T004b `app/page.tsx` - 홈페이지 구현
  - `/career-timing`으로 자동 리다이렉트 또는 서비스 소개 랜딩 페이지
  - 헤더(Header) + "관운 분석 시작하기" CTA 버튼 최소 구성
  - 메타데이터 설정 (constitution XII: title, description, OG 태그)
- [x] T004a 환경 변수 검증 로직 구현
  - `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_OAUTH_REDIRECT_URI` 필수 확인
  - 누락 시 개발 서버 시작 시 명확한 에러 메시지 표시
  - 참고: `src/lib/config/env.ts` 생성
- [x] T005 [P] `.env.example` 생성 및 환경 변수 가이드 작성 (`.env.local` git 제외)

### 1.2 Tailwind CSS 테마 시스템화

- [x] T006 `tailwind.config.ts` 파일 생성 (plan.md 3.1절 스펙 정확히 반영)
  - 색상: night-900/800/700, star-500/400/300, semantic 색상
  - 폰트: Pretendard (Sans), Garamond (Serif)
  - fontSize: 반응형 크기 체계 (데스크톱/태블릿/모바일)
- [x] T007 [P] Tailwind CSS 전체 빌드 테스트 및 초기 스타일시트 검증
- [x] T007b [P] Sonner 토스트 알림 시스템 초기화
  - Sonner 라이브러리 설치 및 설정
  - `src/app/layout.tsx`에 `<Toaster />` 컴포넌트 배치
  - 글로벌 토스트 유틸리티 함수 작성 (`lib/toast.ts`)
    - `showSuccess()`, `showError()`, `showWarning()` 래퍼
  - 참고: T048, T094 등에서 사용됨

### 1.3 빌드 파이프라인 & Git 관리

- [x] T008 `package.json` scripts 업데이트
  - `npm run dev`, `npm run build`, `npm run start`, `npm test`, `npm run lint`
  - Build 시 TypeScript + ESLint 자동 실행
- [x] T008a [필수] `npm install` - 모든 의존성 설치
  - package.json에 정의된 dependencies와 devDependencies 설치
  - node_modules 디렉토리 생성
  - package-lock.json 자동 생성
- [x] T009 Husky & pre-commit 훅 설정 (`npm run build` 의무 실행)
- [x] T009b 전역 로딩 인디케이터 구현
  - Zustand errorStore에 isLoading 상태 추가 (`stores/errorStore.ts`)
  - 앱 상단에 진행 바 컴포넌트 배치 (`components/common/GlobalLoadingBar.tsx`)
  - apiFetch에서 자동으로 로딩 상태 업데이트 (`lib/api/client.ts`)
  - providers.tsx에 GlobalLoadingBar 통합
- [x] T010 `.gitignore` 확인 (`.env.local`, `node_modules/`, `.next/`, 빌드 산출물 제외)

---

## Phase 2: Foundational - 개발 기초 인프라

### 2.1 API 클라이언트 및 에러 처리 (Q5 명확화 통합)

- [x] T011 `lib/api/client.ts` - apiFetch<T>() 중앙 래퍼 구현
  - HTTP 메서드 (GET, POST), 타입 안전성
  - **Q5 재시도 정책**: 타임아웃/네트워크 에러만 재시도 (400/404 제외)
  - **지수 백오프**: [1000ms, 2000ms, 4000ms] (3회)
  - credentials: 'include' (HttpOnly 쿠키 자동 전송)
  - timeout 관리 (CareerTiming 3-5s, Consultation 15-20s, Compatibility 8s)
- [x] T012 `lib/api/career.ts` - `fetchCareerTiming()`, `fetchConsultation()` 엔드포인트 래퍼
- [x] T013 `lib/api/company.ts` - `fetchCompatibility()`, `fetchCompanyAutocomplete()` 엔드포인트 래퍼
- [x] T014 `lib/api/feedback.ts` - `submitFeedback()` 엔드포인트 래퍼
- [x] T015 `lib/api/auth.ts` - `fetchAuthStatus()`, `logout()` 엔드포인트 래퍼
- [x] T016 `lib/api/mypage.ts` - `fetchAnalysisHistory()`, `fetchAnalysisRecord()`, `deleteAnalysisRecord()` 무한 스크롤 지원
- [x] T017 `types/api.ts` - ApiResponse<T>, 모든 요청/응답 타입 정의
- [x] T018 `types/errors.ts` - API 에러 코드 enum (INVALID_DATE_FORMAT, FASTAPI_TIMEOUT 등)

### 2.2 입력 검증 및 데이터 타입 (Zod)

- [x] T019 `services/utils/validation.ts` - Zod 스키마 정의
  - 생년월일: YYYY-MM-DD 형식, 과거 날짜만 허용
  - 시간: HH:mm 24시간 형식, 미입력 시 12:00 기본값
  - 기업명: 문자열, XSS 방지 처리
  - 피드백: 최대 500자, 만족도 선택 필수
- [x] T020 `services/utils/formatters.ts` - 날짜/시간 파싱 및 표시 함수 (date-fns 활용)

### 2.3 전역 상태 관리 (Zustand - 5개 스토어)

- [x] T021 `stores/authStore.ts` - 사용자 인증, 로그인 상태, isLoggedIn 플래그
  - 로그인 정보 저장 (userId, socialProvider, name, profileImage)
  - logout() 메서드: authStore + analysisStore + consultationStore 모두 reset
- [x] T022 `stores/analysisStore.ts` - 비로그인 유저 분석 데이터 (휘발성, 메모리만)
  - careerTiming: { inputs, result, loading, error }
  - compatibility: { inputs, result, loading, error }
  - reset() 메서드 (beforeunload 가드에서 호출)
- [x] T023 `stores/consultationStore.ts` - AI 컨설팅 캐시 (전체 데이터 메모리 보관, fullpage.js 섹션 인덱스 관리)
  - consultation: 8개 섹션 전체 메모리 저장 (lazy-load 아님)
  - lastFetchedId 추적 (캐시 유효성 검증)
  - **currentSectionIndex**: fullpage.js afterLoad 콜백에서 동기화 (0-based index)
  - getConsultationData(), setConsultation(), clearData(), setCurrentSectionIndex()
- [x] T024 `stores/sessionStore.ts` - 현재 분석 세션 상태 관리 (Zustand in-memory)
  - **상태**: sajuResultId, lastAnalysisType, currentAnalysisData, isAnalyzing
  - **Q1 명확화**: 로그인 토큰은 HttpOnly 쿠키에만 저장, sessionStore는 분석 추적 정보 관리
  - Q3 명확화: threshold 0.5 + isLoadingMore 플래그로 무한 스크롤 중복 요청 방지
  - 로그아웃 시 clearSession() 메서드로 전체 상태 초기화
- [x] T024a Zustand persist 미들웨어로 sessionStore 자동 동기화
  - **persist 대상**: sajuResultId, lastAnalysisType만 sessionStorage에 저장
  - sessionStorage 사용으로 탭 닫으면 자동 삭제
- [x] T025 `stores/errorStore.ts` - 현재 에러 상태 (Error Boundary와 연결) + isLoading 상태

### 2.4 Mock Service Worker (MSW) 설정

- [x] T026 [P] `mocks/server.ts` - MSW 서버 초기화 및 요청 인터셉트 설정
- [x] T027 [P] `mocks/handlers/career.ts` - CareerTiming, Consultation 핸들러
- [x] T028 [P] `mocks/handlers/company.ts` - Compatibility, AutoComplete 핸들러
- [x] T029 [P] `mocks/handlers/feedback.ts` - Feedback 제출 핸들러
- [x] T030 [P] `mocks/handlers/auth.ts` - 인증 상태 확인, 로그아웃 핸들러
- [x] T031 [P] `mocks/data/*.ts` - career, company, auth 목업 데이터
- [x] T032 `jest.config.ts` - MSW 자동 활성화, 테스트 환경 설정

### 2.5 Jest 테스트 인프라 및 초기 커버리지

- [x] T033 `__tests__/setup.ts` - Jest 설정 (MSW, Zustand, localStorage 모킹)
- [x] T034 `__tests__/hooks/useCareerTiming.test.ts` - 기본 훅 테스트 (성공, 타임아웃, 재시도)
- [x] T035 `__tests__/utils/validation.test.ts` - Zod 검증 테스트
- [x] T036 `__tests__/components/InputForm.test.ts` - 폼 렌더링, 검증 에러 표시

---

## Phase 3: US1 - 소셜 로그인 및 회원 관리

**목표**: 사용자가 카카오/구글 소셜 로그인을 통해 계정을 연결하고, 분석 결과를 영구 저장  
**우선순위**: P1 (분석 결과 저장의 전제 조건)  
**독립적 테스트**: 비로그인 → 로그인 → 분석 저장 → 마이페이지 조회 완전 흐름 검증

### 3.1 OAuth 인증 구현

- [x] T037 [US1] `services/auth/oauth.ts` - Kakao, Google OAuth 유틸리티
  - 768px 기준 팝업/리다이렉트, PKCE 플로우, state CSRF 방지
- [x] T038 [US1] `hooks/useAuth.ts` - 로그인 상태 관리 훅
  - fetchAuthStatus() 자동 복원, loginWithKakao/Google(), logout() 전 스토어 초기화
- [ ] T038b [US1] 토큰 갱신 인터셉터 (백엔드 refresh token 미제공 시 스킵)
- [x] T039 [US1] `app/api/auth/callback/route.ts` - OAuth 콜백 라우트
  - authorization_code → 백엔드 전달 → HttpOnly 쿠키 처리
- [x] T040 [US1] `hooks/usePlatformDetect.ts` - 기기별 팝업/리다이렉트 자동 선택

### 3.2 로그인 UI 컴포넌트

- [x] T041 [US1] `components/auth/LoginButton.tsx` - 헤더 로그인 버튼
- [x] T042 [US1] `components/auth/LoginModal.tsx` - 소셜 로그인 모달
- [x] T043 [US1] `components/auth/ProfileMenu.tsx` - 로그인 후 프로필 메뉴

### 3.3 자동 저장 및 로그인 후 데이터 처리 (Q1 명확화)

- [x] T044 [US1] `hooks/useAutoSaveOnLogin.ts` - 비로그인 분석 → 로그인 시 자동 저장
- [x] T045 [US1] `components/auth/LoginNudgeCard.tsx` - 비로그인 경고 카드

### 3.4 로그인 상태 UI 업데이트

- [x] T046 [US1] `components/common/Header.tsx` - 헤더 (비로그인: LoginButton, 로그인: ProfileMenu)
- [x] T047 [US1] `components/results/SaveButton.tsx` - 저장 버튼 (로그인 상태 조건부)

### 3.5 테스트 (Jest, MSW)

- [x] T048 [US1] `__tests__/hooks/useAuth.test.ts` - 5개 테스트 통과
- [x] T049 [US1] `__tests__/hooks/useAutoSaveOnLogin.test.ts` - 6개 테스트 통과
- [x] T050 [US1] `__tests__/components/LoginButton.test.tsx` - 4개 테스트 통과

---

## Phase 4: US3 - 관운 기반 채용 시기 분석

**목표**: 사용자가 생년월일과 시간을 입력하여 H1/H2 분석 결과 조회  
**우선순위**: P1 (핵심 기능, 모든 분석의 진입점)  
**독립적 테스트**: 입력 검증 → 고지 문구 노출(1.5초) → 자동 로딩 전환(500ms 애니메이션) → 결과 표시 완전 흐름

### 4.1 입력 폼 및 검증

- [x] T051 [US3] `components/forms/InputForm.tsx` - 생년월일/시간 입력 폼
  - 생년월일: react-datepicker로 커스텀 캘린더 (밤하늘 테마 적용)
  - 시간: HH:mm 텍스트 입력 또는 타임 피커
  - 검증 에러: 필드 아래 인라인 빨간색 메시지
  - 미입력 시 12:00 기본값 안내 메시지 표시 (FR-003)
  - "분석하기" 버튼 활성화 조건: 생년월일 유효
- [x] T052 [US3] `hooks/useInputValidation.ts` - Zod 검증 훅
  - birthDate: YYYY-MM-DD, 과거 날짜만 (FR-001, FR-004)
  - birthTime: HH:mm 또는 빈값 (FR-002, FR-003)
  - 실시간 검증 + 에러 메시지 매핑

### 4.2 고지 문구 오버레이 (FR-055, FR-056, Q 명확화)

- [x] T053 [US3] `components/results/DisclaimerOverlay.tsx` - 고지 문구 전환 UI
  - **표현**: opacity: 0.5 다크 오버레이 + 중앙 흰색 텍스트
  - **문구**: "본 사주는 재미로 보는 것이니 참고만 바랍니다"
  - **폰트 크기** (반응형):
    - 데스크톱: 28px (Tailwind `text-2xl`)
    - 태블릿: 24px (Tailwind `text-xl`)
    - 모바일: 20px (Tailwind `text-lg`)
  - **지속 시간**: 정확히 1.5초 (setTimeout 1500ms)
  - **페이드 아웃**: 1.5초 후 500ms ease-in-out 페이드 아웃
  - **로딩 페이드 인**: 동시에 500ms ease-in-out 페이드 인 (Framer Motion)
  - **사용자 입력 차단**: `pointer-events: none` (터치/클릭 불가)
  - **접근성**: `role="alert" aria-live="assertive"` (스크린 리더)
  - **성능**: 60fps 이상 애니메이션 (Framer Motion 최적화)
- [x] T054 [US3] `hooks/useDisclaimerTimer.ts` - 고지 문구 타이밍 관리 훅
  - 1.5초 카운트다운 (setTimeout 또는 framer-motion keyframes)
  - 500ms 페이드 트리거
  - 로딩 상태로 자동 전환

### 4.3 분석 API 호출 및 로딩

- [x] T055 [US3] `hooks/useCareerTiming.ts` - 관운 분석 훅 (타이밍 제어)
  - submitAnalysis(birthDate, birthTime)
  - apiFetch로 POST /api/career/timing 호출 (타임아웃 3-5초)
  - 고지 문구 → 로딩 → 결과 UI 자동 연계
  - sajuResultId를 sessionStore에 저장 (피드백용)
  - 비로그인 시 analysisStore에 저장 (휘발성)
  - 로딩, 에러 상태 관리
- [x] T055b [US3] 중복 요청 방지 (Race Condition)
  - loading 상태일 때 "분석하기" 버튼 비활성화 (disabled={loading})
  - submitAnalysis 호출 시 즉시 loading = true 설정
  - useRef로 요청 추적하여 동시 다중 API 호출 방지
  - 참고: useConsultation, useCompatibility도 동일 패턴 적용
- [x] T056 [US3] `components/results/LoadingProgress.tsx` - 로딩 진행 바
  - 부드러운 무한 애니메이션 (진행 바, 별 아이콘 회전)
  - "로딩 중..." 또는 "AI 분석 중입니다..." 메시지
  - 예상 시간 표시 없음 (간결함 유지, FR-058)

### 4.4 결과 표시 및 시각화

- [x] T057 [US3] `components/results/CareerTimingResult.tsx` - 관운 분석 결과 페이지
  - H1 또는 H2 예측 결과 표시 (큰 텍스트, 별 아이콘 강조)
  - 신뢰도 점수 (0-100) + 진행 바 시각화 (Recharts)
  - 분석 근거 텍스트 설명
  - 로그인 상태에 따라 "이 결과 저장하기" 또는 "로그인해주세요" 표시
  - 하단 "피드백" 버튼 (US6과 연계)
- [x] T058 [US3] `components/visualization/ConfidenceBar.tsx` - 신뢰도 진행 바
  - 0-100 점수를 진행 바로 시각화 (Recharts)
  - 색상: 신뢰도에 따라 동적 (높음: 초록, 중간: 주황, 낮음: 빨강)
  - 수치 표시 (예: "85 / 100")

### 4.5 에러 처리 (FR-029, FR-026)

- [x] T059 [US3] `components/errors/ErrorMessage.tsx` - 에러 메시지 + 재시도 버튼
  - API 에러 코드 → 사용자 친화적 메시지 매핑
  - INVALID_DATE_FORMAT → "생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD)"
  - FASTAPI_TIMEOUT → "사주 데이터 조회 중 시간초과. 잠시 후 다시 시도해주세요"
  - "다시 시도" 버튼 (최대 3회 자동 재시도, 지수 백오프 1s-2s-4s)
  - 3회 실패 시 "분석에 실패했습니다. 잠시 후 다시 시도해주세요" 최종 메시지
- [x] T060 [US3] `hooks/useErrorHandler.ts` - 에러 코드 처리 훅
  - ApiError를 UI 메시지로 변환
  - 재시도 로직 통합 (Q5 정책: 타임아웃/네트워크만 재시도)

### 4.6 테스트 (Jest, MSW)

- [x] T061 [US3] `__tests__/components/InputForm.test.ts` - 폼 렌더링, 검증
- [x] T062 [US3] `__tests__/components/DisclaimerOverlay.test.ts` - 1.5초 노출, 500ms 페이드
- [x] T063 [US3] `__tests__/hooks/useCareerTiming.test.ts` - API 호출, 타임아웃, 재시도, sajuResultId 저장
- [x] T064 [US3] `__tests__/components/CareerTimingResult.test.ts` - 결과 렌더링, 저장 버튼 조건부 표시

---

## Phase 5: US4 - AI 기반 커리어 컨설팅

**목표**: 사용자가 생년월일/시간으로 AI 컨설팅 받고, 8개 섹션을 **fullpage.js 전체화면 스냅 스크롤**로 탐색 (2026-05-13: 탭 UI → fullpage.js 전환)  
**우선순위**: P1 (높은 가치의 AI 분석, 커리어 의사결정 지원)  
**독립적 테스트**: API 호출 → 8개 섹션 전체 로드 → Zustand 캐싱 → fullpage.js로 각 섹션 전체화면 전환 + SectionNavigator 클릭 이동 검증

### 5.1 fullpage.js 패키지 설치 및 FullPageConsultation 컴포넌트

> ⚠️ 2026-05-13 변경: ConsultationScrollView (IntersectionObserver) → FullPageConsultation (fullpage.js)
> Constitution IV 예외: `[Exception: Principle IV]` — 사용자 명시 요청, 직접 구현 복잡도 과다

- [x] T065a [US4] `package.json` - `@fullpage/react-fullpage` 패키지 설치
  - `npm install @fullpage/react-fullpage`
  - TypeScript 타입 포함 여부 확인 (`@types/fullpage.js` 또는 패키지 내 포함)
  - `npm run build` 로 설치 후 빌드 통과 확인

- [x] T065 [US4] `components/consultation/FullPageConsultation.tsx` - fullpage.js 전체화면 섹션 래퍼
  - 기존 ConsultationScrollView.tsx 대체 (기존 파일 삭제 또는 미사용 표시)
  - `@fullpage/react-fullpage`의 `ReactFullpage` 래퍼 사용
  - **파일 상단 주석**: `// [Exception: Principle IV] fullpage.js 사용 — 스크롤 스냅 직접 구현 복잡도 과다, 사용자 명시 요청`
  - 8개 `.section` div 렌더링 (Section1~Section8 컴포넌트 삽입)
  - fullpage.js 설정:
    - `scrollingSpeed: 700` (ms)
    - `easing: 'easeInOutCubic'`
    - `scrollOverflow: true` (섹션 내 긴 콘텐츠 스크롤)
    - `normalScrollElements: '.feedback-modal'` (모달 내 스크롤 허용)
    - `responsiveWidth: 768` (모바일에서 fullpage.js 비활성 → 일반 스크롤)
    - `afterLoad` 콜백: `onSectionChange(destination.index)` 호출
    - `afterRender` 콜백: `prefers-reduced-motion` 감지 → `scrollingSpeed: 0` 적용
  - Props: `data: ConsultationData`, `currentSectionIndex: number`, `onSectionChange: (index: number) => void`, `onFeedback: () => void`
  - fullpageApi ref를 SectionNavigator에 전달 (`fullpageApi.moveTo()` 사용)
  - 마지막 섹션(월별운세) 이후 피드백 버튼 표시

- [x] T065b [US4] `hooks/useConsultation.ts` 업데이트 - useSectionObserver 제거, fullpage.js 연동
  - 기존 useSectionObserver 훅 의존성 제거
  - consultationStore의 `currentSectionIndex` 읽기/쓰기
  - `handleSectionChange(index: number)` → `consultationStore.setCurrentSectionIndex(index)` 호출
  - 기존 IntersectionObserver 기반 로직 제거

- [x] T065c [P] [US4] `components/consultation/SectionNavigator.tsx` - 섹션 네비게이터 (fullpage.js API 연동)
  - **데스크톱(≥1024px)**: 화면 우측 고정 플로팅 인디케이터
    - 8개 점(dot) 또는 섹션명 약자 표시
    - 활성 섹션: 금색(star-500) 강조 (`currentIndex` prop 기반)
    - 클릭 시 `onNavigate(index)` 호출 → `fullpageApi.moveTo(index + 1)` (1-based API)
  - **모바일/태블릿(<1024px)**: 상단 고정 섹션 점프 바 (스티키)
    - 8개 섹션명 가로 스크롤, 활성 섹션 금색 강조
    - 터치 영역 44px 이상 확보
  - Props: `sections: string[]`, `currentIndex: number`, `onNavigate: (index: number) => void`
  - `prefers-reduced-motion`: 이동 즉시 완료 (애니메이션 없음)

### 5.2 컨설팅 데이터 캐싱

- [x] T066 [US4] `hooks/useConsultation.ts` - 컨설팅 데이터 로드 및 캐싱 (fullpage.js 연동 업데이트)
  - **초기 로드**: POST /api/career/consultation 호출 시 8개 섹션 전체 수신 (lazy-load 아님)
  - **타임아웃**: 20초 (AI 분석, FR-027)
  - **Zustand 저장**: consultationStore.setConsultation() 호출 (메모리 캐싱)
  - **fullpage.js 전환**: 데이터 수신 후 FullPageConsultation 렌더링 (ConsultationScrollView 아님)
  - **sectionIndex 관리**: `handleSectionChange(index)` → `consultationStore.setCurrentSectionIndex(index)`
  - **새 분석**: consultationStore.clearData() 호출 (캐시 초기화)
  - **로그아웃**: authStore.logout()에서 consultationStore.clearData() 자동 호출
  - **반환값**: `{ data, loading, error, currentSectionIndex, handleSectionChange }`

### 5.3 섹션별 컨텐츠 컴포넌트 (기존 Tab 컴포넌트 재활용)

> 아래 컴포넌트는 Tab→Section 전환 후에도 동일하게 재사용 가능. 파일명 유지.

- [x] T067 [US4] `components/consultation/IndustriesTab.tsx` - 추천산업 섹션
  - 상위 2-3개 산업명, 이유, 추천 직무 리스트
- [x] T068 [US4] `components/consultation/InterviewTipsTab.tsx` - 면접팁 섹션
  - 3-5개 항목 리스트
- [x] T069 [US4] `components/consultation/StrengthsTab.tsx` - 강점 섹션
  - 3-5개 강점 항목
- [x] T070 [US4] `components/consultation/SajuProfileTab.tsx` - 사주프로필 섹션
  - 일주(천간), 성격 특성, 오행 분포 막대 차트(木火土金水), 십신 분포
  - `components/visualization/OHangChart.tsx` 재사용 (Recharts)
- [x] T071 [US4] `components/consultation/WealthStyleTab.tsx` - 부의운 섹션
  - 소득원, 재무 조언, 투자 성향, 추가 수입 정보
- [x] T072 [US4] `components/consultation/CareerRoadmapTab.tsx` - 경력로드맵 섹션
  - 0-2년, 3-5년, 최종목표 단계별 로드맵
- [x] T073 [US4] `components/consultation/BrandingTab.tsx` - 브랜딩 섹션
  - 정장 색상, 이미지, 헤어메이크업, 파워 키워드 3-5개
- [x] T074 [US4] `components/consultation/MonthlyForecastTab.tsx` - 월별운세 섹션 (US5와 공유)
  - 캘린더 형식 12개월 표시
  - 반응형 배치 (데스크톱: 가로, 모바일: 리스트)
  - 이전/다음 월 버튼 또는 드롭다운 네비게이션

### 5.4 데이터 시각화

- [x] T075 [US4] `components/visualization/OHangChart.tsx` - 오행 분포 막대 차트
  - 木火土金水 5개 오행, Recharts BarChart
- [x] T076 [US4] `components/visualization/MonthlyCalendar.tsx` - 월별 운세 캘린더
  - 12개월, 행운/주의/일반 색상, 반응형, 네비게이션

### 5.5 로딩 및 에러 처리

- [x] T077 [US4] `components/results/ConsultationLoading.tsx` - 컨설팅 로딩 상태
  - 로딩 진행 바 (별 아이콘 회전), "AI 분석 중입니다...", 시간 표시 없음
- [x] T078 [US4] 타임아웃 처리 (FR-027)
  - Consultation 타임아웃: 20초, 최대 2회 재시도 (각 5초 간격)

### 5.6 컨설팅 결과 페이지 (fullpage.js로 업데이트)

- [x] T079 [US4] `app/consultation/page.tsx` - ConsultationPage fullpage.js 전환
  - InputForm (생년월일/시간 입력)
  - DisclaimerOverlay (고지 문구, US3과 공유)
  - **FullPageConsultation** (ConsultationScrollView 대체 — fullpage.js 8섹션 전체화면)
  - **SectionNavigator** (T065c — fullpageApi.moveTo() 연동)
  - 하단 피드백 버튼 (마지막 섹션에서 표시)
  - useConsultation 훅 호출 (Zustand 캐싱, sectionIndex 관리)
  - useAutoSaveOnLogin 호출 (로그인 시 자동 저장)
  - SSR 비활성: `dynamic(() => import('@/components/consultation/FullPageConsultation'), { ssr: false })` 사용 (fullpage.js는 브라우저 전용)

### 5.7 테스트 (Jest, MSW)

- [x] T080 [US4] `__tests__/hooks/useConsultation.test.ts` - fullpage.js 연동 업데이트
  - 8개 섹션 로드, Zustand 캐싱 유지
  - `handleSectionChange(index)` → `consultationStore.setCurrentSectionIndex(index)` 검증
  - useSectionObserver 의존성 제거 확인
- [x] T081 [US4] `__tests__/components/FullPageConsultation.test.tsx` - fullpage.js 래퍼 컴포넌트 테스트
  - 기존 `useSectionObserver.test.ts` 및 `ConsultationScrollView.test.tsx` 대체
  - 8개 섹션 컴포넌트 렌더링 확인
  - `afterLoad` 콜백 → `onSectionChange` 호출 검증
  - `prefers-reduced-motion` 환경: `scrollingSpeed: 0` 적용 검증
  - `responsiveWidth: 768` 이하: fullpage.js 비활성 (일반 스크롤) 검증
- [x] T081b [P] [US4] `__tests__/components/SectionNavigator.test.tsx` - fullpageApi.moveTo() 연동 테스트
  - 8개 점 렌더링 + `currentIndex` 기반 활성 강조 확인
  - 클릭 시 `onNavigate(index)` 호출 검증
  - 모바일/데스크톱 레이아웃 전환 확인
- [x] T082 [US4] `__tests__/components/ConsultationResult.test.ts` - 섹션별 데이터 표시 검증 (유지)

---

## Phase 6: US5 - 기업 궁합 분석

**목표**: 사용자가 생년월일/기업명 입력하여 궁합 분석 및 직무별 매칭도 조회  
**우선순위**: P2 (선택적 추가 기능, 높은 가치)  
**독립적 테스트**: 기업명 자동 조회(성공/실패) → 수동 입력 폴백 → 분석 결과 표시 완전 흐름

### 6.1 기업명 입력 및 자동 조회

- [x] T083 [US5] `components/forms/CompanyForm.tsx` - 기업명 입력 폼
  - 텍스트 입력 + 검색 자동완성 (공공데이터 API 활용)
  - 설립일 자동 조회 시도
  - 설립시간 입력 (기본값 12:00)
- [x] T083b [US5] `components/forms/CompanyAutocomplete.tsx` - 기업명 자동완성 드롭다운
  - 기업명 입력 시 공공데이터 조회 결과를 드롭다운으로 표시
  - 입력 중 자동완성 후보 실시간 필터링 (debounce 300ms)
  - 드롭다운 항목 선택 시 CompanyForm의 기업명 필드 자동 채우기
  - 하단에 최대 10개 항목만 표시
  - 참고: CompanyForm에서 import하여 통합
- [x] T084 [US5] `hooks/useCompanyInfo.ts` - 기업 정보 조회 훅
  - **우선순위** (FR-008):
    1. 기업명 제공 → 공공데이터 API 자동 조회
    2. 조회 성공 → 확인 모달에서 결과 표시
    3. 조회 실패 → "설립일을 수동으로 입력해주세요" 안내
    4. 수동 입력 → 입력값 사용
  - 재시도 정책: Q5 (타임아웃/네트워크만, 1s-2s-4s)

### 6.2 기업 조회 결과 확인 모달

- [x] T085 [US5] `components/modals/CompanyConfirmModal.tsx` - 기업 정보 확인 모달
  - 조회 결과 표시: 기업명, 설립일, 설립시간
  - "확인" 버튼: 조회된 정보로 분석 진행
  - "수정" 버튼: 설립일/시간 수동 입력 폼 활성화
  - 설립일 미발견 시: 수동 입력 폼 자동 표시

### 6.3 궁합 분석 API 호출

- [x] T086 [US5] `hooks/useCompatibility.ts` - 기업 궁합 분석 훅
  - POST /api/company/compatibility 호출 (타임아웃 5-8초)
  - sajuResultId를 sessionStore에 저장
  - 비로그인 시 analysisStore에 저장 (휘발성)
  - 로딩, 에러 상태 관리

### 6.4 궁합 분석 결과 페이지

- [x] T087 [US5] `app/compatibility/page.tsx` - CompatibilityPage 페이지
  - InputForm + CompanyForm (생년월일/기업 입력)
  - DisclaimerOverlay (고지 문구, US3과 공유)
  - 종합 점수 (예: 78/100) + 신뢰도 (LOW/MEDIUM/HIGH) 표시
  - 점수 분석 4개 항목: 십신 궁합, 오행 궁합, 지장간 궁합, 리더십 매칭 (진행 바)
  - 직무별 매칭도 카드 3-5개 (직무명, 점수, 이유, 추천/주의)
  - 월별 운세 캘린더 (US4 MonthlyCalendar 재사용)
  - 경력 발전 마일스톤 (0-3개월, 3-12개월, 1-3년)
  - 하단 피드백 버튼

### 6.5 시각화

- [x] T088 [US5] `components/visualization/CompatibilityScore.tsx` - 궁합 점수 시각화
  - 원형 진행 바 또는 게이지 차트 (Recharts)
  - 점수 (0-100) + 신뢰도 텍스트
- [x] T089 [US5] `components/visualization/JobMatchingCards.tsx` - 직무별 매칭도 카드
  - 직무명, 점수, 진행 바, 이유, 추천/주의 문구

### 6.6 테스트 (Jest, MSW)

- [x] T090 [US5] `__tests__/hooks/useCompanyInfo.test.ts` - 기업 조회(성공/실패), 수동 입력 폴백
- [x] T091 [US5] `__tests__/hooks/useCompatibility.test.ts` - 궁합 분석 API, 재시도
- [x] T092 [US5] `__tests__/components/CompatibilityResult.test.ts` - 결과 렌더링

---

## Phase 7: US6 - 만족도 피드백

**목표**: 사용자가 분석 결과에 대해 만족도(만족/불만족)와 의견(최대 500자) 제출  
**우선순위**: P1 (모든 분석과 연결, 피드백 수집)  
**독립적 테스트**: 모달 열기 → 만족도 선택 → 의견 입력(500자 제한) → 제출 → 토스트 알림 완전 흐름

### 7.1 피드백 모달 UI

- [x] T093 [US6] `components/modals/FeedbackModal.tsx` - 피드백 제출 모달
  - 제목: "분석 결과 피드백"
  - 닫기(×) 버튼 (모달 닫힘, 입력 데이터 저장 안 함)
  - **만족도 선택** (필수): ○ 만족함, ○ 만족하지 않음 (라디오 버튼)
  - **피드백 유형** (읽기 전용): 페이지에 따라 자동 선택 (CAREER_TIMING/CONSULTATION/COMPATIBILITY)
  - **상세 의견** (선택): 텍스트 영역, 최대 500자 제한
    - 글자 수 카운터 실시간 표시 (예: "120 / 500")
    - 500자 도달 시 추가 입력 자동 방지
  - **제출하기 버튼**: 만족도 선택 후 활성화

### 7.2 피드백 제출 로직

- [x] T094 [US6] `hooks/useFeedback.ts` - 피드백 제출 훅
  - submitFeedback(satisfactionStatus, feedbackContent)
  - POST /api/feedback/satisfaction 호출 (타임아웃 10초)
  - 요청 본문: sajuResultId (sessionStore), feedbackType (자동 결정), satisfactionStatus, feedbackContent
  - sajuResultId 필수 (분석 결과와 피드백 연결)
  - 제출 중 로딩 스피너 표시
  - 성공: "피드백이 저장되었습니다" Sonner 토스트 + 모달 자동 닫힘 (1-2초 후)
  - 실패(3초 초과): "제출 중 오류가 발생했습니다. 다시 시도해주세요." + "다시 시도" 버튼

### 7.3 피드백 버튼 배치

- [x] T095 [US6] `components/results/FeedbackButton.tsx` - 피드백 버튼
  - 분석 결과 페이지 하단 배치
  - "이 결과에 대해 의견을 알려주세요" 또는 "피드백하기"
  - 클릭 시 FeedbackModal 오픈

### 7.4 테스트 (Jest, MSW)

- [x] T096 [US6] `__tests__/hooks/useFeedback.test.ts` - 피드백 제출, 성공/실패 처리
- [x] T097 [US6] `__tests__/components/FeedbackModal.test.ts` - 모달 렌더링, 500자 제한, 카운터

---

## Phase 8: US2 - 마이페이지 및 분석 히스토리 조회

**목표**: 로그인한 사용자가 과거 분석 기록을 조회하고, 클릭하면 원본 결과 재현(0.1초), 삭제 가능  
**우선순위**: P1 (분석 결과 영구 저장의 핵심, 로그인 가치 제시)  
**독립적 테스트**: 마이페이지 접근 → 3가지 탭 기록 로드 → 무한 스크롤(20개씩) → 기록 클릭 재현 → 삭제 완전 흐름

### 8.1 마이페이지 라우팅 및 접근 제어

- [ ] T098 [US2] `app/my-page/page.tsx` - MyPagePage 페이지
  - 로그인 필수 (비로그인 시 로그인 페이지 리다이렉트)
  - "내 분석 기록" 페이지 제목
  - 3개 탭: 관운 분석, AI 컨설팅, 기업 궁합
  - 탭 클릭 시 해당 기록 로드 (무한 스크롤)
- [ ] T099 [US2] `hooks/useMyPageAccess.ts` - 마이페이지 접근 제어 훅
  - isLoggedIn 확인
  - 비로그인 시 /login으로 리다이렉트
  - authStore 상태 구독

### 8.2 히스토리 탭 및 기록 리스트

- [ ] T100 [US2] `components/history/HistoryTabs.tsx` - 마이페이지 3개 분석유형 탭 (독립 구현)
  - 관운 분석 (CAREER_TIMING)
  - AI 컨설팅 (CONSULTATION)
  - 기업 궁합 (COMPATIBILITY)
  - 참고: 컨설팅 스크롤 뷰(ConsultationScrollView)와 무관한 독립 컴포넌트
- [ ] T101 [US2] `components/history/HistoryCard.tsx` - 기록 카드
  - 분석 날시 (예: "2026-05-07 14:30")
  - 분석 대상 정보 (예: 생년월일 또는 기업명)
  - 핵심 결과 미리보기 (예: "H1 권장, 신뢰도 85%")
  - 클릭 가능 상태 표시 (호버 효과)
  - 삭제 아이콘 (휴지통)

### 8.3 무한 스크롤 구현 (Q3 명확화)

- [ ] T102 [US2] `hooks/useMyPage.ts` - 히스토리 조회 + 무한 스크롤 훅
  - **초기 로드**: 최신 20개 기록만 fetch (성능 최적화)
  - **무한 스크롤**: 사용자가 하단에 도달하면 다음 20개 자동 로드
  - **Q3 명확화**: react-intersection-observer threshold: 0.5 + Zustand isLoadingMore 플래그로 중복 요청 방지
  - **로딩 중**: 하단에 로딩 스피너 표시
  - **완료**: "더 이상 기록이 없습니다" 메시지
  - API: GET /api/my-page/history?type=CAREER_TIMING&page=1&limit=20
- [ ] T103 [US2] `components/history/InfiniteScroll.tsx` - 무한 스크롤 컨테이너
  - react-intersection-observer 관찰 요소 (마지막 카드 아래)
  - 로딩 중 스피너 표시
  - 완료 메시지 표시

### 8.4 기록 상세 조회 및 재현

- [ ] T104 [US2] `hooks/useHistoryDetail.ts` - 기록 상세 데이터 조회 훅
  - sajuResultId 기반으로 백엔드에서 전체 분석 데이터 조회
  - GET /api/my-page/history/{resultId} (타임아웃 5초)
  - 데이터 로드 후 결과 페이지로 네비게이션
- [ ] T105 [US2] `components/results/HistoryDetailPage.tsx` - 재현된 결과 페이지
  - 원본 분석 결과 페이지와 동일한 레이아웃으로 재현
  - CareerTimingResult, ConsultationResult, CompatibilityResult 컴포넌트 재사용
  - "뒤로 가기" 또는 "히스토리로 돌아가기" 버튼 (마이페이지로 복귀)
  - 로딩 시간: 0.1초 이내 (캐시 활용, 데이터 즉시 표시)

### 8.5 기록 삭제

- [ ] T106 [US2] `components/history/DeleteConfirmModal.tsx` - 삭제 확인 모달
  - 메시지: "정말 삭제하시겠습니까?"
  - "삭제" 버튼: 백엔드 삭제 후 마이페이지에서 즉시 제거
  - "취소" 버튼: 모달 닫힘
- [ ] T107 [US2] `hooks/useDeleteHistory.ts` - 기록 삭제 훅
  - DELETE /api/my-page/history/{resultId} 호출
  - 성공: Zustand 상태 업데이트, 카드 UI에서 제거, 토스트 "기록이 삭제되었습니다"
  - 실패: 에러 메시지 표시

### 8.6 빈 상태 처리

- [ ] T108 [US2] `components/history/EmptyState.tsx` - 기록 없음 안내
  - 메시지: "아직 분석 기록이 없습니다. 지금 분석을 시작해보세요!"
  - "분석하기" 버튼 (분석 페이지로 이동)

### 8.7 테스트 (Jest, MSW)

- [ ] T109 [US2] `__tests__/hooks/useMyPage.test.ts` - 초기 20개 로드, 무한 스크롤
- [ ] T110 [US2] `__tests__/hooks/useHistoryDetail.test.ts` - 상세 조회, 0.1초 재현
- [ ] T111 [US2] `__tests__/components/HistoryCard.test.ts` - 카드 렌더링, 삭제 모달

---

## Phase 9: Polish & Cross-cutting Concerns

### 9.1 비로그인 사용자 휘발성 데이터 경고 및 이탈 방지

- [ ] T112 분석 결과 페이지 하단 LoginNudgeCard (FR-024)
  - react-intersection-observer로 하단 노출 감지
  - "로그인하지 않으면 이 결과는 페이지를 나갈 때 사라집니다" 메시지
  - 카카오/구글 로그인 버튼
  - 배경색 강조 (주황/노랑)
- [ ] T113 페이지 이탈 방지 컨펌 모달 (FR-025)
  - 비로그인 사용자만 적용
  - beforeunload 또는 라우터 beforeRouteLeave 이벤트
  - "지금 나가시면 분석 결과가 삭제됩니다. 정말 나가시겠습니까?"
  - "지금 로그인하기" (로그인 후 같은 페이지로 복귀, 자동 저장)
  - "그냥 나가기" (분석 결과 폐기)
  - "계속 보기" (모달 닫고 현재 페이지 유지)
- [ ] T113b [P] [US6] 라우터 이벤트 인터셉팅 (beforePopState) in hooks/usePageExitGuard.ts
  - Next.js App Router의 beforePopState 이벤트 리스너 설정
  - 브라우저 뒤로가기, 히스토리 변경 감지
  - 비로그인 + 미저장 분석 결과 존재 시 페이지 이탈 방지 컨펌 발동
  - beforeunload와 분리: beforeunload는 탭 종료/새로고침, beforePopState는 라우트 변경 전용
  - sessionStore.getState() 조회로 현재 분석 결과 및 사용자 로그인 상태 확인

### 9.2 반응형 웹 디자인 최종 검증

- [ ] T114 [P] 데스크톱(≥1024px) 레이아웃 검증 및 최적화
  - SectionNavigator 우측 플로팅 인디케이터 배치, 캘린더 12개월 가로
  - 폰트 크기: 데스크톱 기준 (본문 16px, 제목 28-32px)
- [ ] T115 [P] 태블릿(768-1023px) 레이아웃 검증
  - 탭 스크롤 가능, 캘린더 적응형
  - 폰트 크기: 태블릿 축소 (본문 15px, 제목 24px)
  - 터치 영역 44px 이상 확보
- [ ] T116 [P] 모바일(360-430px) 레이아웃 검증
  - SectionNavigator 상단 고정 점프바 (가로 스크롤, 터치 영역 44px 이상)
  - 캘린더 카드 리스트, 아코디언 펼침/접힘
  - 폰트 크기: 모바일 축소 (본문 14px, 제목 20px)
  - 터치 영역 확보, 오터치 방지

### 9.3 접근성 (a11y) 및 SEO

- [ ] T117 [P] 스크린 리더 지원 (WAI-ARIA)
  - DisclaimerOverlay: role="alert" aria-live="assertive"
  - 모달: role="dialog" aria-modal="true" aria-labelledby
  - 버튼: aria-label, aria-pressed (토글)
  - 폼: label과 input 연결, aria-describedby (에러 메시지)
- [ ] T118 [P] SEO 메타데이터 설정 (Next.js Metadata API)
  - 각 페이지별 title, description, keywords, og:image, og:url, twitter:card 설정
  - robots, viewport, charset 메타데이터
- [ ] T119 Lighthouse 성능 점수 검증
  - Performance > 80, Accessibility > 95, Best Practices > 90
  - Core Web Vitals: LCP < 3초, FID < 100ms, CLS < 0.1

### 9.4 에러 바운더리 및 전역 에러 처리

- [ ] T120 [P] ErrorBoundary 통합
  - React Error Boundary HOC 구현
  - errorStore와 연결
  - 사용자 친화적 에러 UI + 복구 버튼 ("다시 시도", "홈으로")
- [ ] T121 [P] 글로벌 에러 핸들러
  - window.onerror, window.onunhandledrejection 캐치
  - Sentry 또는 유사 모니터링 (선택사항)

### 9.5 성능 최적화 및 모니터링

- [ ] T122 [P] 번들 최적화
  - 번들 크기 검증 (초기 < 200KB gzip)
  - dynamic import 활용 (페이지별 코드 분할)
  - 이미지 최적화 (next/image 사용)
- [ ] T123 [P] 성능 모니터링 기준 검증
  - API 응답 시간: CareerTiming 3-5초, Consultation 15-20초, Compatibility 5-8초, Feedback 1-2초
  - UI 반응성: 섹션 진입 애니메이션 400ms 이내, SectionNavigator 스크롤 300ms 이내, 저장된 결과 재현 100ms 이내
  - 로딩 메트릭: LCP < 3초, FID < 100ms, CLS < 0.1

### 9.6 통합 E2E 테스트 및 수동 검증

- [ ] T124 [P] MSW 완전 테스트 데이터 준비
  - 성공 시나리오: 모든 API 엔드포인트 성공 응답
  - 타임아웃 시나리오: CareerTiming 5초, Consultation 20초 지연
  - 에러 시나리오: INVALID_DATE_FORMAT, COMPANY_NOT_FOUND, NETWORK_ERROR
  - 엣지 케이스: 시간 미상 (12:00 기본값), 기업 정보 미발견 (수동 입력)
- [ ] T125 [P] Jest 커버리지 80% 달성
  - hooks: 모든 훅 테스트 (로직, 상태 변경)
  - components: 주요 컴포넌트 (폼, 모달, 결과)
  - utils: 검증, 포맷팅, 에러 처리
  - API client: 재시도, 타임아웃, 에러 매핑
- [ ] T126 [P] 수동 테스트 체크리스트 작성 및 실행
  - 정상 흐름: 로그인 없이 분석 → 로그인 → 자동 저장 → 마이페이지
  - 에러 케이스: 잘못된 입력 → 타임아웃 → 재시도
  - 엣지 케이스: 시간 미상, 기업 정보 미발견, 페이지 새로고침
  - 모바일/태블릿: 각 기기에서 레이아웃 검증
  - 네트워크 지연: DevTools Throttling (Fast 3G)

### 9.7 빌드 및 배포 준비

- [ ] T127 `npm run build` 최종 검증
  - TypeScript 타입 체크 성공
  - ESLint 규칙 준수 (no errors, no warnings)
  - 번들 생성 및 최적화 완료
- [ ] T128 환경 설정 최종 검증
  - .env.local 파일 구성 (git 제외 확인)
  - .env.example 업데이트 (키만 포함)
  - API 엔드포인트 (NEXT_PUBLIC_API_BASE_URL)
- [ ] T129 git 히스토리 정리
  - 모든 커밋이 헌법 원칙 VI 준수 (한국어, Conventional Commits, [Build Passed])
  - WIP 커밋 없음
  - 민감 정보 포함 없음 (환경 파일, API 키)

---

## Dependencies & Parallel Execution

### 의존성 그래프

```
Phase 1: Setup
  ↓
Phase 2: Foundational (auth, Zustand, API client, validation, MSW)
  ↓
  ├─→ Phase 3: US1 (로그인) [depends on: Phase 2]
  │     └─→ useAutoSaveOnLogin (요구사항: authStore)
  │
  ├─→ Phase 4: US3 (관운 분석) [depends on: Phase 2]
  │     ├─→ 고지 문구 (DisclaimerOverlay, 1.5초 타이밍)
  │     ├─→ API 호출 (apiFetch, 재시도)
  │     └─→ 결과 표시 (차트, 진행 바)
  │
  ├─→ Phase 5: US4 (AI 컨설팅) [depends on: Phase 2, Phase 4 (고지 문구)]
  │     ├─→ @fullpage/react-fullpage 설치 (T065a)
  │     ├─→ FullPageConsultation + SectionNavigator (fullpage.js 전체화면 스냅)
  │     ├─→ Zustand 캐싱 (consultationStore, currentSectionIndex 관리)
  │     └─→ 8개 섹션 컴포넌트 (기존 Tab 컴포넌트 재활용)
  │
  ├─→ Phase 6: US5 (기업 궁합) [depends on: Phase 2, Phase 4 (고지 문구)]
  │     ├─→ 기업명 조회
  │     ├─→ 궁합 분석
  │     └─→ 월별 캘린더 (재사용)
  │
  ├─→ Phase 7: US6 (피드백) [depends on: Phase 3, Phase 4, Phase 5, Phase 6]
  │     └─→ 모든 분석 페이지에서 호출
  │
  └─→ Phase 8: US2 (마이페이지) [depends on: Phase 3 (로그인), Phase 4/5/6 (분석)]
        ├─→ 무한 스크롤 (Q3 명확화)
        └─→ 기록 재현 (0.1초)

Phase 9: Polish [depends on: Phase 3-8 모두 완료]
  ├─→ 휘발성 데이터 경고
  ├─→ 반응형 검증
  ├─→ 접근성 (a11y)
  └─→ E2E 테스트, 성능 최적화
```

### 병렬 실행 기회 (Parallel Opportunities)

**Phase 2 내에서**:
- T011-T016 (API 래퍼): 독립적이므로 병렬 구현 가능
- T019-T020 (Zod 스키마): API 래퍼와 독립적, 병렬 가능
- T021-T025 (Zustand 스토어): 서로 의존성 없음, 병렬 가능
- T026-T031 (MSW 핸들러): 각 도메인별 독립적, 병렬 가능

**Phase 3-6 간의**:
- US3, US4, US5: Phase 2 완료 후 병렬 진행 가능 (고지 문구는 공유하지만 구현 먼저)
- 각 US 내 컴포넌트 개발: 독립적 컴포넌트는 병렬 가능

**Phase 9 내에서**:
- T114-T116 (반응형 검증): 3개 기기별 병렬
- T124-T126 (테스트): 다양한 시나리오 병렬 테스트

### 권장 MVP 스코프 (첫 번째 릴리스)

**MVP = US1 (로그인) + US3 (관운 분석) + US6 (피드백) + 기본 UI**

1. **Phase 1**: 프로젝트 기초 (T001-T010)
2. **Phase 2**: 개발 인프라 (T011-T036)
3. **Phase 3**: 로그인 (T037-T050)
4. **Phase 4**: 관운 분석 (T051-T064)
5. **Phase 7**: 피드백 (T093-T097)
6. **Phase 9**: 폴리시 (T114-T129)

→ **목표**: 사용자가 로그인하고, 관운을 분석하며, 의견을 제출하는 기본 흐름 완성

이후 Phase 5 (US4), Phase 6 (US5), Phase 8 (US2) 추가 구현

---

---

## Phase 10: Swiper.js 마이그레이션 — AI 컨설팅 풀페이지 스크롤

**목표**: CSS scroll-snap + 수동 wheel 이벤트 방식을 Swiper.js v12 수직 슬라이드로 교체해 자연스러운 마우스/트랙패드 스크롤 UX 제공.  
**영향 파일**: `package.json`, `app/globals.css`, `FullPageConsultation.tsx`, `FullPageConsultation.test.tsx`  
**Constitution 예외**: Principle IV — 사용자 명시 요청, PR에 `[Exception: Principle IV]` 명시 필수

### 10.1 패키지 설치

- [X] T130 `swiper@12` 패키지 설치
  - `npm install swiper` 실행
  - `package.json` dependencies에 `"swiper": "^12.x.x"` 추가 확인
  - 설치 후 `npm run build` 빌드 통과 확인

### 10.2 CSS 전역 Import

- [X] T131 `app/globals.css`에 Swiper 기본 CSS import 추가
  - 파일: `ssaju-frontend/src/app/globals.css`
  - 파일 최상단에 `@import 'swiper/css';` 추가
  - Next.js App Router에서 클라이언트 컴포넌트 내 CSS import 이슈 방지를 위해 globals.css 사용

### 10.3 핵심 컴포넌트 교체

- [X] T132 `FullPageConsultation.tsx` Swiper.js 기반으로 재작성
  - 파일: `ssaju-frontend/src/components/consultation/FullPageConsultation.tsx`
  - **제거**:
    - `containerRef`, `sectionRefs` (DOM ref 방식)
    - `IntersectionObserver` useEffect (섹션 추적)
    - `scrollLocked` ref + `SCROLL_LOCK_MS` 상수
    - `handleWheel` useEffect (수동 wheel 핸들러)
    - CSS `scrollSnapType: 'y mandatory'` / `scrollSnapAlign: 'start'`
    - `className="h-screen overflow-y-scroll"`
  - **추가**:
    ```tsx
    import { Swiper, SwiperSlide } from 'swiper/react';
    import { Mousewheel, Keyboard, A11y } from 'swiper/modules';
    import type { Swiper as SwiperInstance } from 'swiper';
    ```
    - `swiperRef = useRef<SwiperInstance | null>(null)`
    - `<Swiper direction="vertical" speed={700} mousewheel={{ sensitivity: 1, thresholdDelta: 50 }} keyboard={{ enabled: true }} a11y={{ enabled: true }} modules={[Mousewheel, Keyboard, A11y]} onSwiper={(s) => { swiperRef.current = s; }} onSlideChange={(s) => onSectionChange(s.activeIndex)} className="h-screen">`
    - `handleNavigate`: `swiperRef.current?.slideTo(index)`로 변경
    - `prefers-reduced-motion` 감지 → Swiper `speed` prop에 0 전달
  - **유지**:
    - `currentIndexRef` + 마지막 섹션 도달 → `SignupPromptModal` 트리거 로직
    - `SectionNavigator` (onNavigate prop 인터페이스 동일)
    - 8개 섹션 컴포넌트 배열
    - `FeedbackButton` (마지막 SwiperSlide)
    - `SectionTitle` 컴포넌트

### 10.4 테스트 업데이트

- [X] T133 `FullPageConsultation.test.tsx` Swiper mock으로 업데이트
  - 파일: `ssaju-frontend/src/__tests__/components/FullPageConsultation.test.tsx`
  - Swiper import mock 추가:
    ```tsx
    jest.mock('swiper/react', () => ({
      Swiper: ({ children, onSwiper, onSlideChange }: {
        children: React.ReactNode;
        onSwiper?: (swiper: { slideTo: jest.Mock; activeIndex: number }) => void;
        onSlideChange?: (swiper: { activeIndex: number }) => void;
      }) => {
        React.useEffect(() => {
          onSwiper?.({ slideTo: jest.fn(), activeIndex: 0 });
        }, []);
        return <div data-testid="fullpage-container">{children}</div>;
      },
      SwiperSlide: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="swiper-slide">{children}</div>
      ),
    }));
    jest.mock('swiper/modules', () => ({
      Mousewheel: {},
      Keyboard: {},
      A11y: {},
    }));
    ```
  - 기존 `IntersectionObserver` mock 제거
  - `container.scrollTo` mock 제거
  - 섹션 렌더링 확인 (`data-testid="swiper-slide"` 8개 존재)
  - `onSlideChange` 콜백 → `onSectionChange` 호출 검증

### 10.5 빌드 및 검증

- [X] T134 `npm run build` 최종 검증
  - TypeScript 타입 오류 없음 확인
  - ESLint 경고 없음 확인
  - 번들 사이즈 확인 (Swiper CSS ~3KB gzip 추가 허용 범위 내)
- [ ] T135 수동 테스트 체크리스트
  - 마우스 휠: 1노치 = 정확히 1섹션 이동, 자연스러운 700ms 전환
  - 트랙패드: 빠른 스와이프에서 다중 섹션 스킵 없음
  - 네비게이터 클릭: 해당 섹션으로 즉시 이동
  - 마지막 섹션: 비로그인 시 회원가입 모달 표시
  - 키보드(Arrow↑↓): 섹션 이동 동작
  - 모바일 터치: 스와이프로 섹션 전환

---

## 성공 기준 (Success Criteria)

### 기능적 완성도
- ✅ 모든 6개 User Story 구현 완료
- ✅ Spec.md의 모든 Acceptance Scenarios 통과
- ✅ Plan.md의 기술 스택 및 아키텍처 준수
- ✅ Constitution.md의 12가지 원칙 준수

### 품질 보증
- ✅ Jest 테스트 커버리지 80% 이상
- ✅ `npm run build` 성공 (TypeScript + ESLint 에러 없음)
- ✅ 수동 테스트 체크리스트 100% 완료
- ✅ Lighthouse 성능 점수: Performance > 80, Accessibility > 95

### 사용자 경험
- ✅ 고지 문구 정확히 1.5초 노출, 500ms 애니메이션 부드러운 전환
- ✅ 8개 섹션 Swiper.js 수직 슬라이드 전환 700ms (2026-05-14 변경: CSS scroll-snap → Swiper.js)
- ✅ SectionNavigator 클릭 → `swiperRef.slideTo()` 즉시 이동
- ✅ 마이페이지 기록 재현 0.1초 이내
- ✅ API 재시도 정책 (타임아웃/네트워크만, 1s-2s-4s)

### 보안 & 컴플라이언스
- ✅ HttpOnly Cookie 로그인 토큰 관리
- ✅ XSS 방지 (입력 이스케이프)
- ✅ 민감 정보 (.env.local) git 제외
- ✅ 비로그인 데이터 휘발성 보장 (localStorage 미사용)

---

**총 작업 수**: 135개 Task (129 + Phase 10: 6개)  
**예상 기간**: Phase별 2-3주 (총 4-6주)  
**팀 규모**: 1-2명 (병렬 기회 활용 시 효율 증대)  
**최종 산출물**: Production-ready Next.js 앱 (Node 배포 가능)

