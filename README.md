# SSAju

사주 기반 커리어 컨설팅 플랫폼입니다. 생년월일·태어난 시간을 입력하면 사주를 분석해 관운 주기, AI 커리어 조언, 기업 궁합을 제공합니다.

---

## 리포지토리 구조

```
SSAju/
├── ssaju-frontend/   # Next.js 프론트엔드 앱
├── docs/             # API 명세·UI 레이아웃·아키텍처 가이드
├── specs/            # 기능별 스펙·플랜·태스크 문서
└── sample/           # 샘플 데이터
```

---

## 구현된 기능

### 랜딩 (`/`)
- 스토리형 랜딩 애니메이션
- 생년월일·태어난 시간 입력 폼

### 관운 분석 (`/career-timing`)
- 생년월일 기반 H1/H2 관운 주기 분석
- 신뢰도 점수 게이지 시각화
- 분석 결과 저장·만족도 피드백

### AI 커리어 컨설팅 (`/consultation`)
- 추천 산업·직무 매칭·파워 키워드·멘탈 케어 등 8개 섹션
- 풀페이지 스크롤 UI

### 기업 궁합 분석 (`/compatibility`)
- DART 기업 검색 자동완성
- 직군 카테고리 12종
- 종합 궁합 점수·오행 차트·월별 운세

### 마이페이지 (`/my-page`)
- 탭별 분석 히스토리 (무한 스크롤)
- 히스토리 삭제·상세 재열람
- 회원 탈퇴

### 인증
- 이메일/패스워드 회원가입·로그인
- 토큰 자동 갱신, 비로그인 접근 시 로그인 모달

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| 전역 상태 | Zustand 4 |
| 서버 상태 | TanStack Query 5 |
| 입력 검증 | Zod 3 |
| 차트 | Recharts 2 |
| 테스트 | Jest 29 + React Testing Library + MSW |
| 백엔드 | Spring Boot (`:8080`) |

---

## 시작하기

```bash
cd ssaju-frontend
npm install
cp .env.example .env.local  # 환경 변수 설정
npm run dev                  # 개발 서버 :3000
```

### 환경 변수

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### 주요 명령어

```bash
npm run dev         # 개발 서버
npm run build       # 프로덕션 빌드 (TypeScript·ESLint 포함)
npm run lint        # ESLint
npm test            # Jest (커버리지 포함)
```

> 커밋 전 `npm run build` 통과 필수. 커밋 메시지에 `[Build Passed]` 포함.

---

## 문서

| 문서 | 내용 |
|------|------|
| [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md) | 전체 API 엔드포인트·요청·응답 명세 |
| [docs/FRONTEND_API_GUIDE.md](docs/FRONTEND_API_GUIDE.md) | 프론트엔드 API 연동 가이드 |
| [docs/FRONTEND_UI_LAYOUT.md](docs/FRONTEND_UI_LAYOUT.md) | 페이지별 UI 레이아웃 |
| [docs/architecture-guide.md](docs/architecture-guide.md) | 4계층 아키텍처 원칙 |
| [docs/code-style-guide.md](docs/code-style-guide.md) | TypeScript·React 코드 스타일 |
| [docs/git-workflow.md](docs/git-workflow.md) | Git 브랜치·커밋 규칙 |
| [ssaju-frontend/README.md](ssaju-frontend/README.md) | 프론트엔드 상세 문서 |
