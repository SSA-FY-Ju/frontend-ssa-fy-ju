# Contract: Breakpoint Layout

**Consumer**: `src/components/**`, `src/app/**` 페이지 컴포넌트를 작성/수정하는 모든 구현 작업
**Producer**: `ssaju-frontend/tailwind.config.ts` (`screens` 토큰) + 각 컴포넌트의 반응형 className

이 문서는 화면/컴포넌트 구현이 반드시 지켜야 할 규칙을 규정한다. `data-model.md`의 Breakpoint Tier / Component Layout Variant를 코드 계약으로 구체화한 것이다.

## 구간 정의 (고정값, 변경 시 이 계약 개정 필요)

| 구간 | 뷰포트 폭 | Tailwind variant |
|---|---|---|
| mobile | 360px ~ 767px | 기본(prefix 없음) / `xs:` |
| tablet | 768px ~ 1023px | `md:` |
| desktop | 1024px 이상 | `lg:` |

## 규칙 (MUST)

1. **불연속 전환만 허용**: 컴포넌트의 크기·여백·배치는 오직 위 세 Tailwind variant(`(기본)`, `md:`, `lg:`)로만 지정한다. `style` 속성에 `clamp()`, `calc(...vw...)`, 퍼센트 기반 동적 크기 계산을 넣지 않는다 — FR-013, FR-014.
2. **배치는 Flexbox 우선**: 컨테이너 레이아웃은 `flex`(+`flex-col`/`flex-row`, `gap-*`, `justify-*`, `items-*`)를 기본으로 사용한다. 다단 카드 배치처럼 grid가 명백히 더 적합한 경우에만 `grid`를 보조적으로 허용한다.
3. **터치 타깃 최소 크기**: 모바일·태블릿 구간에서 버튼/링크/입력 요소는 최소 `44px × 44px`(Tailwind `min-w-[44px] min-h-[44px]` 또는 동등한 padding)를 만족해야 한다 — FR-003.
4. **겹침 금지**: 같은 화면에 여러 버튼이 배치될 때(모달 하단, 화면 하단 액션 바 등) `flex`/`grid`의 `gap-*`으로 최소 간격을 확보해 겹침이 발생하지 않아야 한다 — FR-015.
5. **데스크톱 회귀 금지**: 기존에 `lg:` 이상에서 동작하던 값은 이번 작업으로 변경하지 않는다. 새 반응형 클래스는 `lg:` 미만 구간에 추가하는 방식으로 작성한다 — FR-006.
6. **세이프 영역**: 화면 최상단/최하단에 고정 배치되는 요소(헤더, 하단 액션 바 등)는 `.safe-top`/`.safe-bottom` 유틸리티(`env(safe-area-inset-*)` 기반, `globals.css`에 정의)를 적용한다 — FR-010.

## 검증 방법

- 코드 리뷰 체크리스트: 위 6개 규칙을 diff에서 grep 가능한 패턴(`clamp(`, `vw`, `%`)으로 1차 점검.
- 시각 검증: `quickstart.md`의 브레이크포인트 점검 매트릭스로 사람이 최종 확인.
