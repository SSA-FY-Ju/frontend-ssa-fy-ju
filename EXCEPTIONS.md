# EXCEPTIONS.md — 헌법 원칙 예외 등록부

본 파일은 SSAju 프로젝트에서 헌법(constitution.md)의 원칙을 예외적으로 적용한 사례를 공식 기록합니다.
모든 예외는 코드 리뷰어 승인 후 이 파일에 등록되어야 하며, 해당 PR 본문에 `[Exception: <원칙명>]` 표기가 필수입니다.

---

## Exception #001 — Swiper.js 사용

| 항목 | 내용 |
|------|------|
| **원칙** | Principle IV (의존성 최소화 — 외부 UI 컴포넌트 라이브러리 금지) |
| **예외 대상** | `swiper@12` (`swiper/react`, `swiper/modules`) |
| **적용 파일** | `src/components/consultation/FullPageConsultation.tsx` |
| **등록일** | 2026-05-14 |
| **PR 표기** | `[Exception: Principle IV]` |
| **승인자** | glory-yun (사용자 명시 요청) |

### 예외 근거

1. **직접 구현 복잡도 과다**: CSS `scroll-snap` + 수동 `wheel` 이벤트 처리로 마우스/트랙패드 UX를 직접 구현하면 500줄 이상의 브라우저 호환 코드가 필요하며, 관성 스크롤(momentum scrolling) 정규화가 매우 복잡함.
2. **라이선스**: MIT 라이선스 (이전 fullpage.js의 GPL v3 유료 라이선스 문제 해소).
3. **공식 React 지원**: `swiper/react`가 공식 제공되어 TypeScript 타입 내장, SSR 비활성화(`ssr: false`) 간단히 처리 가능.
4. **사용자 명시 요청**: 프로젝트 오너(glory-yun)가 Swiper.js 사용을 명시적으로 요청함.

### 사용 범위 제한

- **허용**: `FullPageConsultation.tsx` 내 8섹션 수직 슬라이드 전용
- **금지**: 다른 페이지/컴포넌트에서 Swiper.js 추가 사용 시 별도 예외 승인 필요

### 향후 개선 계획

- Phase 2 이후 CSS `scroll-snap` + `IntersectionObserver` 기반 자체 구현으로 교체 검토
- 교체 시 Swiper.js 의존성 완전 제거 및 본 예외 취소 처리

---

## 예외 추가 방법

새로운 예외가 필요한 경우:

1. PR 본문에 `[Exception: Principle <번호>]` 표기
2. 리뷰어 최소 1명 승인 획득
3. 본 파일에 위 형식에 맞춰 항목 추가 후 커밋
4. 예외 항목에 `향후 개선 계획` 반드시 포함

---

**최종 업데이트**: 2026-05-14 | **총 예외 수**: 1개
