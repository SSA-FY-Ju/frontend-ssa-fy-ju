# Quickstart: 모바일·태블릿 반응형 UI 및 PWA 전환 검증

이 문서는 구현 완료 후 spec.md의 Acceptance Scenarios / Success Criteria가 실제로 충족되는지 확인하는 절차다. 구현 코드는 포함하지 않는다.

## 사전 준비

```bash
cd ssaju-frontend
npm install
npm run dev
```

- 로컬 서버: `http://localhost:3000`
- 크롬 개발자 도구의 기기 툴바(Ctrl/Cmd+Shift+M) 사용
- (선택) 실기기: Android Chrome, iOS Safari 각 1대 이상

## 1. 반응형 레이아웃 점검 매트릭스 (User Story 1, 2 / SC-001, SC-006, SC-007)

아래 대표 해상도 × 화면 조합을 모두 점검한다. 각 셀은 "가로 스크롤 없음 / 요소 겹침 없음 / 버튼 개별 조작 가능"을 만족해야 통과.

**대표 해상도**: 360×640(소형 모바일), 390×844(iPhone급), 768×1024(태블릿 세로), 1024×768(태블릿 가로)

**점검 화면** (spec.md FR-001, FR-011 기준):

- `/` (랜딩)
- `/select` (서비스 선택)
- `/chat`
- `/career-timing`
- `/compatibility`, `/compatibility/result`
- `/consultation`
- `/my-page`, `/my-page/[id]`
- 인증 모달 (아무 페이지에서 로그인 버튼 클릭)
- 존재하지 않는 경로 접속 (에러/404 화면)

각 조합에 대해 [breakpoint-layout.contract.md](./contracts/breakpoint-layout.contract.md)의 규칙 1, 3, 4를 육안 및 DevTools "Elements" 패널 겹침 확인으로 검증한다.

**구간 경계 전환 확인** (FR-014, SC-006): DevTools 기기 툴바에서 폭을 767px → 768px → 1024px → 1023px로 천천히 드래그하며, 버튼 크기가 서서히 변하지 않고 정확히 768px/1024px 지점에서 즉시 전환되는지 확인한다.

## 2. 데스크톱 회귀 확인 (FR-006)

1024px 이상(예: 1280px, 1920px)에서 각 화면을 열어 이번 변경 이전과 동일한 레이아웃/동작인지 확인한다. 변경 전 스크린샷이 있다면 비교, 없다면 주요 화면의 시각적 배치가 기존과 동일한지 확인한다.

## 3. PWA 설치 검증 (User Story 3 / SC-003, SC-004)

### Android Chrome

1. `npm run build && npm run start`로 프로덕션 빌드 실행(설치 가능성은 개발 모드에서 부정확할 수 있음).
2. Chrome DevTools → Application 탭 → Manifest에서 [pwa-manifest.contract.md](./contracts/pwa-manifest.contract.md)의 필드가 모두 채워져 있는지 확인.
3. Application 탭 → Service Workers에서 `/sw.js`가 등록되어 있는지 확인.
4. 실제 Android 기기 Chrome에서 사이트 접속 → 메뉴 → "앱 설치"(또는 자동 설치 배너) 확인 → 설치 → 홈 화면 아이콘 실행 시 주소창 없이 열리는지 확인(3회 이하 조작).

### iOS Safari

1. iOS Safari에서 사이트 접속 → 공유 아이콘 → "홈 화면에 추가" → 이름 확인 → 추가.
2. 홈 화면 아이콘 실행 시 Safari 주소창 없이 standalone으로 열리는지 확인.
3. 상단 노치 영역에 콘텐츠(헤더 등)가 가려지지 않는지 확인(FR-010).

### Lighthouse 감사

```bash
# Chrome DevTools → Lighthouse 탭 → Progressive Web App 카테고리 선택 후 실행
```

"Installable" 관련 항목이 모두 통과해야 한다.

## 4. 자동화 테스트 (research.md §8)

```bash
cd ssaju-frontend
npm run test        # matchMedia 모킹 기반 브레이크포인트 렌더 분기 단위 테스트
npm run storybook   # 컴포넌트별 viewport 애드온으로 모바일/태블릿/데스크톱 프레임 시각 확인
```

## 완료 기준

- [ ] 1번 매트릭스의 모든 셀이 통과
- [ ] 2번 데스크톱 회귀 없음 확인
- [ ] 3번 Android/iOS 설치 및 standalone 실행 확인, Lighthouse Installable 통과
- [ ] 4번 자동화 테스트 통과
