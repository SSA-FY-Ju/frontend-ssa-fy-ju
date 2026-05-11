# SSAju Frontend 개발 가이드

SSAju 프론트엔드 프로젝트(React + Next.js + TypeScript) 개발 시 따라야 할 **규칙과 패턴**을 모아놓은 폴더입니다.

> **중요**: 이 폴더는 SSAju 프로젝트의 **"어떻게 개발할지(How)"**를 담고, 구체적인 기능/페이지 명세는 `spec.md`와 `plan.md`에서 확인하세요.

---

## 🎯 이 프로젝트의 학습 목표

이 프로젝트를 통해 다음 능력을 기르는 것이 목표입니다:

1. **AI 활용 능력**
   - AI에게 명확한 명령을 내리는 방법 학습
   - AI가 만든 코드를 검토하고 통합하는 능력
   - 한계 상황에서 AI와 대화를 통해 문제 해결

2. **트러블 슈팅 능력**
   - 에러 로그를 읽고 해석하는 능력
   - 타입 에러, 빌드 에러, 런타임 에러 해결
   - 네트워크/API 통신 문제 디버깅

3. **필수 구현 능력**
   - React 컴포넌트 설계 및 분리
   - TypeScript 타입 시스템 이해
   - Next.js App Router 활용
   - REST API 통신 및 상태 관리

> ⚠️ **중요**: AI가 모든 걸 완벽하게 짜주면 학습이 되지 않습니다. **기능이 최소한으로 동작하는 수준**으로 구현하고, 개선과 디버깅은 직접 경험하세요.

---

## 📚 가이드 문서

### 1. [코드 스타일 가이드](./code-style-guide.md)

TypeScript + React 코드 작성 시 따라야 할 **일반적인 스타일 규칙**입니다.

**포함 내용**:
- TypeScript 타입 정의 규칙 (interface vs type)
- React 컴포넌트 작성 규칙 (함수형 컴포넌트, props 타이핑)
- 폴더 구조 및 파일 네이밍
- 상태 관리 (useState, useReducer)
- 커스텀 훅 작성 규칙
- 스타일링 방법 (CSS Modules / Tailwind)
- 비동기 처리 (async/await, try-catch)
- ESLint, Prettier 규칙

### 2. [Git 워크플로우](./git-workflow.md)

**프로젝트 전체에 적용되는** Git 사용 규칙입니다.

**포함 내용**:
- Build-Then-Commit 프로세스 (필수)
- Conventional Commits 규칙 (feat:, fix:, docs:, style:, refactor: 등)
- 커밋 메시지 형식 및 [Build Passed] 필수 포함
- 브랜치 네이밍 규칙 (prefix/feature-name)
- PR 전략

### 3. [아키텍처 가이드](./architecture-guide.md)

**모든 Next.js 프로젝트에 적용되는** 아키텍처 원칙과 패턴입니다.

**포함 내용**:
- Next.js App Router 구조
- 계층형 아키텍처 (페이지 → 컴포넌트 → 훅 → 서비스)
- 각 계층의 책임
- API 통신 패턴 (fetch/axios, 에러 처리)
- 상태 관리 전략 (로컬 vs 전역)
- 에러 처리 (ErrorBoundary, try-catch)
- 환경 변수 관리
- 로깅 전략

### 4. [CLAUDE.md](./CLAUDE.md)

**AI(Claude)와 함께 개발할 때 참조하는** 진입 문서입니다.

**포함 내용**:
- 프로젝트 간략 소개
- 개발 명령어 (npm run dev, build, lint 등)
- 워크플로우 (Develop → Build → Commit → PR)
- AI 활용 규칙 (어떤 상황에서 AI를 쓰고, 어떤 상황에서 직접 해야 하는지)
- 보안 & 환경 설정

---

## 🎯 사용 예

### 컴포넌트 작성 시
```tsx
// ❓ "Props 타입을 interface로 할지 type으로 할지?"
// → code-style-guide.md의 "TypeScript 타입 정의" 섹션 참조
```

### 커밋 시
```bash
# ❓ "어떤 형식으로 커밋 메시지를 작성해야 하지?"
# → git-workflow.md의 "커밋 메시지 규칙" 섹션 참조
```

### API 호출 시
```tsx
// ❓ "API 호출할 때 에러는 어떻게 처리하지?"
// → architecture-guide.md의 "API 통신 패턴" 섹션 참조
```

---

## 📋 체크리스트

**코드 리뷰 시** (자신의 코드 또는 AI가 생성한 코드):

- [ ] 컴포넌트: 함수형, TypeScript props 타입 정의 (code-style-guide.md)
- [ ] 타입: any 사용 최소화, 명시적 타입 선언 (code-style-guide.md)
- [ ] 폴더 구조: App Router 규칙 준수 (architecture-guide.md)
- [ ] 상태 관리: 필요한 범위로 제한 (로컬 vs 전역) (architecture-guide.md)
- [ ] API 호출: try-catch 또는 에러 처리 훅 사용 (architecture-guide.md)
- [ ] 에러 처리: 사용자에게 적절한 피드백 제공 (architecture-guide.md)
- [ ] 환경 변수: .env.local 사용, 코드에 하드코딩 금지 (CLAUDE.md)
- [ ] 빌드: `npm run build` 성공 확인 (git-workflow.md)
- [ ] 커밋: [Build Passed] 포함, Conventional Commits 형식 (git-workflow.md)
- [ ] 브랜치: prefix/feature-name 형식 (git-workflow.md)

---

## 🔗 관련 문서

**프로젝트 문서와의 관계**:
- `/skills/`: **"어떻게"** (규칙, 패턴, 가이드)
- `/specs/spec.md`: **"무엇을"** (기능, 페이지, 사용자 스토리)
- `/specs/plan.md`: **"언제 구현할"** (우선순위, 태스크 분해)
- `/specs/tasks.md`: **"어떤 순서로"** (세부 작업 목록)

---

## 🚀 빠른 참조

### 개발 서버 실행
```bash
cd ssaju-frontend/
npm install       # 최초 1회
npm run dev       # 개발 서버 (http://localhost:3000)
```

### 빌드 확인 (커밋 전 필수)
```bash
npm run build     # TypeScript + Next.js 빌드 검증
npm run lint      # ESLint 검사
```

### 브랜치 생성 및 작업 시작
```bash
git checkout main
git pull origin main
git checkout -b feat/feature-name

# ... 개발 ...

npm run build     # 빌드 통과 확인
git commit -m "feat: 설명

[Build Passed]"

git push origin feat/feature-name
```

### 코드 스타일 확인
```
컴포넌트 작성 중? → code-style-guide.md
폴더 구조 헷갈림? → architecture-guide.md
API 호출 에러 처리? → architecture-guide.md
```

---

## 🤖 AI 활용 원칙 (중요)

이 프로젝트는 AI를 적극 활용하되, **학습 효과를 해치지 않는 선**에서 사용합니다.

### ✅ AI를 적극 활용해도 좋은 경우
- 보일러플레이트 코드 생성 (컴포넌트 스켈레톤, 타입 정의)
- TypeScript 에러 메시지 해석 도움
- API 응답 타입을 기반으로 한 인터페이스 자동 생성
- 반복적인 UI 마크업 작성
- 문서 작성 보조

### ⚠️ 직접 해봐야 학습되는 경우
- **상태 관리 설계**: AI에게 전체를 맡기지 말고, "어디에 상태를 두는 게 맞을지" 고민 후 AI에게 검토 요청
- **에러 디버깅**: 에러 로그를 먼저 읽고 원인을 추론한 후 AI에게 질문
- **아키텍처 결정**: 폴더 구조, 컴포넌트 분리 기준은 직접 결정하고 AI는 검증용으로 활용
- **API 통합**: 처음 한 번은 직접 fetch 해보고, 이후에 커스텀 훅으로 추상화

### 💡 AI에게 질문할 때 팁
```
❌ 나쁜 질문: "커리어 상담 페이지 만들어줘"
✅ 좋은 질문:
"Next.js App Router 환경에서 `/career/consultation` 경로의 페이지를 만들고 싶어.
이 페이지는 POST /api/career/consultation으로 요청을 보내고,
응답을 받아 추천 산업, 면접 팁, 강점을 보여줘야 해.
폼 상태는 useState, 제출 로직은 커스텀 훅으로 분리하고 싶어.
컴포넌트 스켈레톤만 먼저 만들어줘 (스타일링, 에러 처리 제외)."
```

---

**Last Updated**: 2026-04-24
