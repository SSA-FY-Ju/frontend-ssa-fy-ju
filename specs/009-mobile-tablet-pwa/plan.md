# Implementation Plan: 모바일·태블릿 반응형 UI 및 PWA 전환

**Branch**: `feat/responsive-ui` | **Date**: 2026-07-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-mobile-tablet-pwa/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

현재 SSAju 프론트엔드(Next.js 14 App Router)는 데스크톱 최소 폭(`lg: 1024px`) 기준으로 설계되어 있어 모바일·태블릿에서 레이아웃이 깨진다. 이 기능은 (1) 모든 화면(랜딩~마이페이지, 인증 모달, 에러 화면 포함)을 모바일(360–767px)·태블릿(768–1023px)·데스크톱(1024px+) 3개 구간으로 나누어, Tailwind의 불연속 반응형 variant와 Flexbox 기반 배치로 구간마다 별도로 설계된 고정 레이아웃을 제공하고(유동적 비례 확대 금지, 버튼 겹침 금지), (2) Next.js 14의 `app/manifest.ts`와 최소 아이콘 세트·안전 서비스 워커로 PWA 설치 가능성과 standalone 실행을 제공한다. 기존 데스크톱 레이아웃과 백엔드/API 로직은 변경하지 않는다.

## Technical Context

**Language/Version**: TypeScript 5.3 (strict), Next.js 14 (App Router), React 18.2

**Primary Dependencies**: Tailwind CSS 3.3, tailwindcss-animate, class-variance-authority, tailwind-merge, Radix UI Dialog, framer-motion (기존 스택 재사용, 신규 UI 라이브러리 추가 없음)

**Storage**: N/A — 정적 자산(PWA manifest, 아이콘 파일)만 추가되며 DB/API 스키마 변경 없음

**Testing**: Jest 29 + Testing Library(단위/컴포넌트 렌더 분기), Storybook 10(viewport 애드온으로 시각 확인), `quickstart.md` 기반 수동 검증 + Lighthouse PWA 감사

**Target Platform**: 모바일·태블릿·데스크톱 웹 브라우저(Android Chrome, iOS Safari 포함), Android WebAPK 설치, iOS 홈 화면 추가(standalone)

**Project Type**: Web application — Next.js 프론트엔드 단일 프로젝트 (`ssaju-frontend/`)

**Performance Goals**: 브레이크포인트 전환 시 레이아웃 시프트(CLS) 최소화, 기존 데스크톱 성능/번들 크기 유지(신규 무거운 의존성 없음)

**Constraints**: 신규 백엔드/API 변경 없음; 변경 범위는 프레젠테이션 레이어(`src/components/**`, `src/app/**`의 UI, `tailwind.config.ts`, `globals.css`, `layout.tsx`)와 정적 PWA 자산(`public/icons/*`, `app/manifest.ts`, `public/sw.js`)에 한정; 데스크톱(≥1024px) 레이아웃 회귀 금지(FR-006); 오프라인 콘텐츠 캐싱 없음(FR-012)

**Scale/Scope**: 8개 라우트 화면 + 인증 모달 + 에러/404 화면, `src/components/` 하위 UI 컴포넌트 전반(현재 반응형 클래스가 있는 14개 파일 포함, 전체 대상은 이보다 넓음), 3개 브레이크포인트 구간

세부 조사 및 근거는 [research.md](./research.md) 참조. 모든 NEEDS CLARIFICATION은 research.md에서 해소됨.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md`가 v1.0.0으로 비준됨(2026-07-15). 현재 원칙은 "I. 구현 진행 보고"(Phase 완료 시 테스트 방법 안내 + 커밋 메시지 제안) 하나이며, 이는 `/speckit-implement` 실행 시의 보고 방식에 관한 프로세스 규칙으로 이 기능의 아키텍처·기술 선택과 충돌하지 않는다 — **PASS**. 위반 사항이 없으므로 Complexity Tracking 불필요.

*Post-Phase 1 재확인*: 설계 단계(research.md, data-model.md, contracts/)에서도 신규 서비스/프로젝트 추가, 외부 백엔드 의존, 데이터 저장소 도입 등 복잡도를 증가시키는 결정이 없었다 — 계속 PASS.

## Project Structure

### Documentation (this feature)

```text
specs/009-mobile-tablet-pwa/
├── spec.md                          # 기능 명세 (완료)
├── plan.md                          # 이 파일 (/speckit-plan 출력)
├── research.md                      # Phase 0 산출물
├── data-model.md                    # Phase 1 산출물
├── quickstart.md                    # Phase 1 산출물
├── contracts/
│   ├── pwa-manifest.contract.md
│   └── breakpoint-layout.contract.md
└── tasks.md                         # Phase 2 산출물 (/speckit-tasks, 이 명령에서는 생성하지 않음)
```

### Source Code (repository root)

이 저장소는 `.specify/`, `specs/`가 저장소 루트(`frontend-ssa-fy-ju/`)에 있고, 실제 Next.js 애플리케이션은 하위 디렉터리 `ssaju-frontend/`에 위치하는 구조다. 구현 작업은 전부 `ssaju-frontend/` 하위에서 이루어진다.

```text
ssaju-frontend/
├── public/
│   ├── icons/                       # [신규] icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
│   ├── sw.js                        # [신규] 캐싱 없는 최소 pass-through 서비스 워커
│   └── favicon.ico                  # 기존 유지
├── src/
│   ├── app/
│   │   ├── layout.tsx               # [수정] viewport-fit=cover, apple-* 메타 태그, manifest 링크
│   │   ├── manifest.ts              # [신규] Next.js MetadataRoute.Manifest
│   │   ├── globals.css              # [수정] .safe-top/.safe-bottom 유틸리티 추가
│   │   ├── page.tsx                 # [수정] 반응형 클래스
│   │   ├── select/, chat/, career-timing/, compatibility/, consultation/, my-page/
│   │   │                           # [수정] 각 페이지 컴포넌트 반응형 클래스
│   │   ├── error.tsx, not-found.tsx # [수정] 반응형 클래스
│   │   └── stories/                 # Storybook용, 필요 시 viewport 스토리 추가
│   ├── components/
│   │   ├── common/, navigation/, landing/, auth/, modals/, forms/,
│   │   │   compatibility/, consultation/, history/, results/, visualization/, ui/
│   │   │                           # [수정] breakpoint-layout.contract.md 규칙에 따라 반응형 클래스 적용
│   │   └── errors/                  # [수정] 반응형 클래스
│   └── hooks/                       # [선택 신규] useBreakpoint 같은 매체 쿼리 훅 (필요 시)
├── tailwind.config.ts                # [수정 없음 원칙] 기존 screens 토큰 재사용, 필요 최소한만 확장
└── src/__tests__/unit/components/    # [신규/수정] 브레이크포인트별 렌더 분기 테스트
```

**Structure Decision**: 신규 프로젝트/서비스를 만들지 않고 기존 단일 Next.js 프론트엔드(`ssaju-frontend/`) 내에서 컴포넌트별 반응형 클래스 추가와 소수의 신규 정적 파일(`manifest.ts`, `public/icons/*`, `public/sw.js`)만 추가하는 최소 확장 구조를 선택했다. `tailwind.config.ts`의 기존 breakpoint(`xs/sm/md/lg/xl/2xl`)를 그대로 재사용해 breakpoint-layout.contract.md와의 정합성을 유지한다.

## Complexity Tracking

> Constitution Check가 PASS이며 위반 사항이 없으므로 이 섹션은 해당 없음.
