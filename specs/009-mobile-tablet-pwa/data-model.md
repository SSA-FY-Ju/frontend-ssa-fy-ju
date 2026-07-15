# Data Model: 모바일·태블릿 반응형 UI 및 PWA 전환

**Input**: [spec.md](./spec.md) · [research.md](./research.md)

이 기능은 사용자 도메인 데이터(DB 엔티티)를 추가하지 않는다. 대신 구현을 일관되게 유지하기 위한 **설정/디자인 토큰 엔티티**를 정의한다. 이 문서는 실제 소스 트리 배치가 아니라 "무엇을 값으로 가져야 하는가"를 규정하는 논리 모델이다.

## 1. Breakpoint Tier (브레이크포인트 구간)

화면을 3개의 불연속 구간으로 나누는 기준. FR-013, FR-014, FR-002의 근거가 되는 단일 진실 공급원.

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | `'mobile' \| 'tablet' \| 'desktop'` | 구간 식별자 |
| `minWidth` | number (px) | 구간 최소 뷰포트 폭 (mobile: 360, tablet: 768, desktop: 1024) |
| `maxWidth` | number (px) \| null | 구간 최대 뷰포트 폭 (mobile: 767, tablet: 1023, desktop: null=제한 없음) |
| `tailwindPrefix` | string | 대응하는 Tailwind variant (mobile: 기본/`xs:`, tablet: `md:`, desktop: `lg:`) |

**검증 규칙**:
- 세 구간은 서로 겹치지 않고 360px 이상 전 구간을 빈틈없이 커버해야 한다(FR-001, Assumptions).
- 구간 경계값은 `tailwind.config.ts`의 `screens` 값과 항상 동기화되어야 한다(불일치 시 FR-014 위반 위험).

## 2. Component Layout Variant (컴포넌트별 구간 배치 정의)

특정 화면/컴포넌트가 각 Breakpoint Tier에서 가져야 하는 고정 구성. "유동적 스케일링 금지"(FR-013)를 강제하기 위한 체크리스트 성격의 모델.

| 필드 | 타입 | 설명 |
|---|---|---|
| `componentId` | string | 대상 컴포넌트/화면 식별자 (예: `ServiceSelectCard`, `ChatInputBar`) |
| `tier` | Breakpoint Tier `id` | 어느 구간에 대한 정의인지 |
| `display` | `'flex' \| 'grid'` | 배치 방식 (기본 `flex`, 다단 카드형만 `grid` 허용) |
| `direction` | `'row' \| 'column'` | flex 주축 방향 |
| `elementSize` | { width?: string; height?: string; minTouchTarget: '44px' } | 버튼 등 인터랙션 요소의 구간별 고정 크기 |
| `spacing` | string (Tailwind spacing 토큰) | 구간별 고정 여백/간격 |
| `overlapAllowed` | `false` (고정값) | FR-015 강제: 항상 겹침 불허 |

**검증 규칙**:
- 동일 `componentId`에 대해 세 `tier` 값이 모두 존재해야 한다(빠짐없이 정의).
- `elementSize`, `spacing` 값은 구간 내에서 뷰포트 폭 변화와 무관하게 고정이어야 하며(SC-006), `clamp()`/`vw`/퍼센트 기반 값을 포함해서는 안 된다.

## 3. PWA Manifest (앱 설치 메타데이터)

FR-007의 매니페스트 요구사항을 구조화한 모델. `app/manifest.ts`가 이 모델대로 값을 반환해야 한다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `name` | string | 전체 앱 이름 |
| `short_name` | string | 홈 화면 아이콘 아래 표시될 짧은 이름 |
| `description` | string | 앱 설명 |
| `start_url` | string | 설치 후 실행 시작 경로 |
| `display` | `'standalone'` (고정값) | FR-009 강제: 브라우저 UI 없는 독립 실행형 |
| `background_color` | string (hex) | 스플래시 화면 배경색 |
| `theme_color` | string (hex) | OS 상태 표시줄/작업 전환 UI 색상 |
| `icons` | AppIconAsset[] | 아래 4번 모델 참조 |

## 4. App Icon Asset (앱 아이콘 자산)

| 필드 | 타입 | 설명 |
|---|---|---|
| `src` | string | 아이콘 파일 경로 |
| `sizes` | string | 예: `"192x192"`, `"512x512"` |
| `type` | string | `"image/png"` |
| `purpose` | `'any' \| 'maskable'` | 용도 |

**필수 인스턴스** (research.md §6 기준): 192×192(any), 512×512(any), 512×512(maskable), 180×180 apple-touch-icon(매니페스트 `icons` 배열 밖, `layout.tsx` 메타 태그로 별도 연결).

## 관계 요약

```text
Breakpoint Tier (3) ──1:N──> Component Layout Variant (컴포넌트마다 3개)
PWA Manifest ──1:N──> App Icon Asset
```
