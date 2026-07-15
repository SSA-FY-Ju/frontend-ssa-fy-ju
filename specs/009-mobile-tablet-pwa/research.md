# Research: 모바일·태블릿 반응형 UI 및 PWA 전환

**Input**: [spec.md](./spec.md) · **Date**: 2026-07-14

이 문서는 Technical Context의 불확실한 항목과 주요 기술 선택을 조사하고 결정한 내용을 기록한다. 조사는 현재 저장소 상태(`ssaju-frontend/`) 확인을 기반으로 했다.

## 1. 구간별 고정(비유동) 레이아웃 구현 전략 (FR-013, FR-014)

- **Decision**: Tailwind CSS의 기본 반응형 variant(`sm:`, `md:`, `lg:` 등)만 사용해 구간별로 명시적인 클래스를 지정한다. `clamp()`, `vw` 단위, 퍼센트 기반 크기 계산 등 폭에 비례해 연속적으로 값이 보간되는 "fluid" 기법은 사용하지 않는다.
- **Rationale**: Tailwind의 반응형 variant는 본래 breakpoint를 넘을 때 클래스가 즉시 전환되는 계단식(step function) 동작이며, 중간값 보간이 없다. 즉 "각 구간마다 별도로 구성된 고정 레이아웃"이라는 요구사항(FR-013, FR-014)을 별도 라이브러리 없이 기존 스택으로 그대로 만족한다. `tailwind.config.ts`에 이미 정의된 `xs(360)/sm(640)/md(768)/lg(1024)/xl(1280)/2xl(1536)` breakpoint를 재사용하면 spec의 Assumptions(모바일 360–767, 태블릿 768–1023, 데스크톱 1024+)와 정확히 일치한다.
- **Alternatives considered**:
  - CSS `clamp()`/fluid typography 플러그인(`tailwindcss-fluid-type` 등) — 명시적으로 FR-013이 금지하는 "폭에 비례한 연속적 확대/축소"에 해당하므로 기각.
  - Container Queries(`@container`) — 요소 단위 반응형에는 유리하지만, 이번 요구사항은 뷰포트(디바이스) 단위 3단계 구성이 핵심이라 범위 초과. 향후 컴포넌트 라이브러리 고도화 시 재검토 가능.

## 2. 컴포넌트 배치 방식 (display: flex)

- **Decision**: 레이아웃 컨테이너는 CSS Flexbox(Tailwind의 `flex`, `flex-col`/`flex-row`, `gap-*`, `justify-*`, `items-*` 유틸리티)를 기본 배치 방식으로 사용한다. 그리드가 명백히 더 적합한 다단 카드 배치(태블릿 2단 등)는 Tailwind `grid` 유틸리티를 보조적으로 허용하되, 개별 요소 크기·정렬은 flex 컨테이너로 제어한다.
- **Rationale**: 사용자가 명시적으로 `display:flex` 사용을 요청했고, 기존 컴포넌트 다수가 이미 Flexbox 기반(className에 `flex` 다용)이라 일관성이 높다.
- **Alternatives considered**: CSS Grid 전면 도입 — 태블릿 다단 배치엔 유리하지만 사용자의 명시적 요청과 기존 코드베이스 관성에 반해 기각(그리드가 필요한 지점에서만 보조적으로 사용).

## 3. PWA 매니페스트 구현 방식

- **Decision**: Next.js 14 App Router의 내장 메타데이터 파일 컨벤션인 `src/app/manifest.ts`(MetadataRoute.Manifest)를 사용해 `/manifest.webmanifest`를 자동 생성한다. 별도의 `next-pwa`/`@ducanh2912/next-pwa` 같은 서드파티 PWA 플러그인은 도입하지 않는다.
- **Rationale**: Next 14는 `app/manifest.ts`를 표준으로 지원하여 빌드 시 정적 매니페스트를 자동 생성하고 `<head>`에 링크도 자동 삽입한다. 이번 범위는 설치 가능성 + standalone 실행(FR-007~FR-009)까지이며 오프라인 캐싱(서비스 워커 기반 자산 캐싱 전략)은 범위 밖이므로, 캐싱 전략까지 포함하는 무거운 PWA 플러그인은 불필요한 복잡도를 추가한다.
- **Alternatives considered**: `next-pwa`/Workbox 기반 플러그인 — 오프라인 캐싱까지 자동화하지만 이번 스펙의 Assumptions("오프라인 상태에서의 콘텐츠 제공은 범위 밖")과 어긋나고, Next 14 App Router와의 통합 이슈(레거시 `next-pwa`는 pages router 중심)가 있어 기각.

## 4. 설치 가능성(installability)과 서비스 워커 필요 여부

- **Decision**: 오프라인 캐싱 없이 등록만 하는 최소한의 pass-through 서비스 워커(`/sw.js`, 모든 요청을 네트워크로 그대로 전달, 캐시 저장 없음)를 프로덕션 빌드에서만 등록한다. 스코프와 파일명은 기존 MSW의 `/mockServiceWorker.js`(개발/테스트 전용)와 겹치지 않도록 별도로 분리한다.
- **Rationale**: 브라우저별 설치 프롬프트(Android Chrome의 `beforeinstallprompt`, WebAPK 생성)는 매니페스트만으로도 대부분 충족되지만, 일부 Android 브라우저/구버전 Chrome 및 Lighthouse PWA 점검 기준에서는 등록된 서비스 워커의 존재를 설치 가능성 신호로 참조하는 경우가 있다. 캐싱 로직 없이 등록만 하면 FR-012(오프라인 콘텐츠 제공 범위 제외)를 위반하지 않으면서 설치 가능성 신뢰도를 높일 수 있다.
- **Alternatives considered**: 서비스 워커 없음 — 최신 Chrome 기준으로는 매니페스트만으로도 설치 가능하지만, 일부 환경에서 설치 배너가 나타나지 않을 위험이 있어 최소 SW를 안전장치로 채택. 완전한 오프라인 캐싱 SW — 범위 밖(Assumptions 위반)으로 기각.

## 5. iOS Safari 설치 플로우

- **Decision**: iOS Safari는 `beforeinstallprompt` 이벤트와 자동 설치 배너를 지원하지 않으므로, "공유 → 홈 화면에 추가" 수동 경로를 위한 안내 UI(짧은 인앱 안내 배너/툴팁)를 제공한다. `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` 메타 태그를 `layout.tsx`에 추가해 standalone 실행과 아이콘 표시를 보장한다.
- **Rationale**: SC-003("3회 이하의 조작으로 설치")은 iOS에서 브라우저 표준 조작(공유 아이콘 탭 → "홈 화면에 추가" 탭 → 완료 탭, 총 2~3회)으로 충족 가능하며, 안내 UI는 이 표준 경로를 사용자가 찾기 쉽게 도와주는 역할만 한다.
- **Alternatives considered**: iOS 전용 설치 유도 라이브러리 도입 — 이번 범위에서는 과함(향후 필요 시 재검토).

## 6. 아이콘 자산 요구사항

- **Decision**: 최소 아이콘 세트로 `icon-192.png`(any), `icon-512.png`(any), `icon-maskable-512.png`(maskable), `apple-touch-icon.png`(180×180)를 준비한다. 기존 `public/favicon.ico`는 유지한다.
- **Rationale**: Android/Chrome 설치 배너와 Lighthouse PWA 점검은 192px·512px any 아이콘과 maskable 아이콘을 요구하며, iOS는 별도의 `apple-touch-icon`을 사용한다.
- **Alternatives considered**: 단일 512px 아이콘만 제공 — 저해상도 기기에서 흐릿하게 렌더링되거나 일부 플랫폼 점검을 통과하지 못할 수 있어 기각.

## 7. 세이프 영역(safe-area) 처리 (FR-010)

- **Decision**: `viewport` 메타 태그에 `viewport-fit=cover`를 추가하고, `globals.css`에 `env(safe-area-inset-top|right|bottom|left)` 기반 유틸리티 클래스(예: `.safe-top`, `.safe-bottom`)를 소량 추가해 헤더/하단 고정 액션 영역에 적용한다.
- **Rationale**: 별도 라이브러리(`tailwindcss-safe-area` 등) 없이도 순수 CSS `env()`로 충분히 구현 가능하며, 이미 존재하는 `globals.css`에 몇 줄만 추가하면 되어 의존성 증가가 없다.
- **Alternatives considered**: `tailwindcss-safe-area` 플러그인 도입 — 기능이 단순해 커스텀 CSS로 충분하므로 기각.

## 8. 반응형/설치 검증 전략 (테스트)

- **Decision**: (a) 로직 단위는 기존 Jest + Testing Library로 커버(예: `matchMedia` 모킹을 통한 브레이크포인트별 렌더 분기 테스트), (b) 시각적 검증은 Storybook에 viewport 애드온을 추가해 컴포넌트 단위로 모바일/태블릿/데스크톱 프레임을 눈으로 확인, (c) 화면 단위 종합 검증은 `quickstart.md`에 정의한 수동 점검 매트릭스(Chrome DevTools 기기 툴바 + 실기기 샘플)와 Lighthouse PWA 감사로 수행한다.
- **Rationale**: 저장소에 Playwright 등 e2e/시각 회귀 도구가 없는 상태에서 새 테스트 인프라를 도입하는 것은 이번 UI 스펙 범위를 넘어서는 결정이다. 기존 도구(Jest, Storybook)를 확장하는 것이 최소 변경으로 검증 커버리지를 확보하는 방법이다.
- **Alternatives considered**: Playwright 기반 반응형 스크린샷 회귀 테스트 도입 — 검증 신뢰도는 높지만 새 CI 인프라/유지보수 부담이 추가되므로, 이번 범위에서는 채택하지 않고 향후 별도 과제로 남긴다.

## Technical Context 확정 값

| 항목 | 값 |
|---|---|
| Language/Version | TypeScript 5.3 (strict), Next.js 14 (App Router), React 18.2 |
| Primary Dependencies | Tailwind CSS 3.3, tailwindcss-animate, class-variance-authority, tailwind-merge, Radix UI Dialog, framer-motion |
| Storage | N/A (정적 자산: manifest, 아이콘만 추가) |
| Testing | Jest 29 + Testing Library(단위/컴포넌트), Storybook 10(시각 확인), 수동 점검(quickstart.md) |
| Target Platform | 모바일/태블릿/데스크톱 웹 브라우저(Android Chrome, iOS Safari 포함), PWA 설치(Android WebAPK, iOS 홈 화면 추가) |
| Project Type | Web application (Next.js 프론트엔드 단일 프로젝트) |
| Performance Goals | 브레이크포인트 전환 시 레이아웃 시프트(CLS) 최소화, 기존 데스크톱 성능 유지 |
| Constraints | 신규 백엔드/API 변경 없음, 프레젠테이션 레이어(컴포넌트, Tailwind 설정, layout.tsx, globals.css)와 정적 PWA 자산에 한정, 데스크톱(≥1024px) 회귀 금지 |
| Scale/Scope | 8개 라우트 화면 + 인증 모달 + 에러/404 화면, `src/components/` 하위 UI 컴포넌트 전반, 3개 브레이크포인트 구간 |

모든 Technical Context 항목의 NEEDS CLARIFICATION은 위 결정으로 해소되었다.
