# SSAju Frontend 코드 스타일 및 개발 규칙

React + Next.js + TypeScript 기반 프론트엔드 개발 시 따라야 할 **일반적인 규칙**입니다.

---

## 📦 폴더 구조

SSAju 프론트엔드는 **Next.js App Router** 기반으로 설계됩니다.

```
ssaju-frontend/
├── app/                        # Next.js App Router 페이지
│   ├── layout.tsx              # 루트 레이아웃 (공통 레이아웃)
│   ├── page.tsx                # 홈 페이지 ("/")
│   ├── globals.css             # 전역 스타일 (Tailwind)
│   │
│   ├── career/
│   │   ├── timing/
│   │   │   └── page.tsx        # "/career/timing"
│   │   └── consultation/
│   │       └── page.tsx        # "/career/consultation"
│   │
│   ├── company/
│   │   └── compatibility/
│   │       └── page.tsx        # "/company/compatibility"
│   │
│   └── feedback/
│       └── page.tsx            # "/feedback"
│
├── components/                 # 재사용 가능한 UI 컴포넌트
│   ├── common/                 # 어디서든 쓰이는 공통 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Loading.tsx
│   ├── career/                 # 관운/컨설팅 관련 컴포넌트
│   │   ├── TimingForm.tsx
│   │   └── ConsultationResult.tsx
│   └── layout/                 # 레이아웃 관련
│       ├── Header.tsx
│       └── Footer.tsx
│
├── hooks/                      # 커스텀 훅
│   ├── useCareerTiming.ts
│   ├── useConsultation.ts
│   └── useFeedback.ts
│
├── lib/                        # 유틸리티, API 클라이언트
│   ├── api/
│   │   ├── client.ts           # fetch 래퍼 (baseURL, 공통 헤더)
│   │   ├── career.ts           # 커리어 관련 API
│   │   ├── company.ts          # 기업 관련 API
│   │   └── feedback.ts         # 피드백 API
│   └── utils/
│       ├── date.ts             # 날짜 포맷 유틸
│       └── validation.ts       # 입력 검증 유틸
│
├── types/                      # 전역 타입 정의
│   ├── api.ts                  # API 요청/응답 타입
│   └── domain.ts               # 도메인 타입 (사주 관련)
│
└── public/                     # 정적 자산 (이미지 등)
```

**핵심 원칙**:
- 페이지(`app/`)는 **얇게**: 상태 관리 + 컴포넌트 조합만
- 비즈니스 로직은 **훅(`hooks/`)** 에
- API 호출은 **`lib/api/`** 에 모아서 관리
- 타입은 **`types/`** 에 중앙화

---

## 🔤 TypeScript 사용 규칙

### Rule 1: `any` 사용 최소화

❌ **나쁨**:
```typescript
function fetchData(url: any): any {
  return fetch(url).then((r) => r.json());
}
```

✅ **좋음**:
```typescript
async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}
```

**허용되는 `any` 사용**:
- 외부 라이브러리의 타입이 제대로 정의되지 않은 경우 (주석으로 이유 표시)
- 마이그레이션 중 임시 사용 (TODO 주석 필수)

### Rule 2: interface vs type 선택 기준

| 상황 | 사용 | 예시 |
|------|------|------|
| 객체 모양 정의 | `interface` | Props, API 응답 객체 |
| 유니온, 유틸리티, 원시값 | `type` | `'H1' \| 'H2'`, `string \| null` |

```typescript
// interface: 객체 구조
interface CareerTimingResponse {
  favoredPeriod: 'H1' | 'H2';
  confidenceScore: number;
  reasoning: string;
}

// type: 유니온, 유틸리티
type Period = 'H1' | 'H2';
type SatisfactionStatus = 'SATISFIED' | 'DISSATISFIED';
```

### Rule 3: 타입 정의 위치

- **전역 도메인 타입**: `types/domain.ts`, `types/api.ts`
- **컴포넌트 로컬 타입**: 해당 컴포넌트 파일 상단
- **훅 반환 타입**: 훅 파일 내부

```typescript
// hooks/useCareerTiming.ts
interface UseCareerTimingReturn {
  data: CareerTimingResponse | null;
  loading: boolean;
  error: string | null;
  submit: (birthDate: string) => Promise<void>;
}

export function useCareerTiming(): UseCareerTimingReturn {
  // ...
}
```

### Rule 4: 엄격한 null 체크

```typescript
// 좋음
function displayScore(score: number | null) {
  if (score === null) return '점수 없음';
  return `${score}점`;
}

// 나쁨 (런타임 에러 위험)
function displayScore(score: number | null) {
  return `${score.toFixed(0)}점`;  // null일 때 터짐
}
```

---

## ⚛️ React 컴포넌트 규칙

### Rule 1: 함수형 컴포넌트만 사용

```tsx
// 좋음
export default function TimingForm({ onSubmit }: TimingFormProps) {
  return <form>...</form>;
}

// 나쁨 (클래스 컴포넌트)
class TimingForm extends React.Component { ... }
```

### Rule 2: Props 타입 명시

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function Button({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={getButtonClass(variant)}>
      {label}
    </button>
  );
}
```

### Rule 3: 컴포넌트 파일 구조

```tsx
// 1. imports
import { useState } from 'react';
import type { CareerTimingResponse } from '@/types/api';

// 2. 타입 정의
interface TimingFormProps {
  onSubmit: (birthDate: string) => void;
}

// 3. 컴포넌트
export default function TimingForm({ onSubmit }: TimingFormProps) {
  // 3-1. Hooks
  const [birthDate, setBirthDate] = useState('');

  // 3-2. 이벤트 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(birthDate);
  };

  // 3-3. 렌더링
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Rule 4: 클라이언트 컴포넌트

Next.js App Router는 기본이 **서버 컴포넌트**입니다.

**Phase 1**: 모든 페이지에 `"use client"` 추가 (단순화)
**Phase 2+**: Server Component 점진적 도입

```tsx
// app/career/timing/page.tsx
"use client";

import { useState } from 'react';

export default function TimingPage() {
  const [birthDate, setBirthDate] = useState('');
  // ...
}
```

---

## 🎣 커스텀 훅 작성 규칙

### Rule 1: 훅 이름은 `use` 로 시작

```typescript
// 좋음
export function useCareerTiming() { ... }

// 나쁨
export function getCareerTiming() { ... }
```

### Rule 2: API 호출 훅 기본 구조

```typescript
// hooks/useCareerTiming.ts
import { useState } from 'react';
import type { CareerTimingResponse } from '@/types/api';
import { fetchCareerTiming } from '@/lib/api/career';

export function useCareerTiming() {
  const [data, setData] = useState<CareerTimingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (birthDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCareerTiming(birthDate);
      setData(result);
    } catch (err) {
      console.error('요청 실패:', err);
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류'
      );
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, submit };
}
```

---

## 🌐 API 호출 규칙

### Rule 1: API 클라이언트 중앙화

```typescript
// lib/api/client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API 에러: ${res.status}`);
  }

  return res.json();
}
```

### Rule 2: 기능별 API 함수 분리

```typescript
// lib/api/career.ts
import { apiFetch } from './client';
import type {
  CareerTimingRequest,
  CareerTimingResponse,
  ApiResponse,
} from '@/types/api';

export async function fetchCareerTiming(
  birthDate: string
): Promise<CareerTimingResponse> {
  const res = await apiFetch<ApiResponse<CareerTimingResponse>>(
    '/api/career/timing',
    {
      method: 'POST',
      body: JSON.stringify({ birthDate }),
    }
  );

  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? '요청 실패');
  }

  return res.data;
}
```

### Rule 3: 백엔드 응답 래퍼 타입

백엔드가 `ApiResponse<T>` 형태로 반환합니다:

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorInfo | null;
  timestamp: number;
}

export interface ErrorInfo {
  code: string;
  message: string;
  requestId: string;
}
```

---

## 📝 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `TimingForm.tsx` |
| 일반 파일 (훅, 유틸) | camelCase | `useCareerTiming.ts`, `validation.ts` |
| 페이지 파일 | 고정 | `page.tsx`, `layout.tsx` |
| 컴포넌트 | PascalCase | `function TimingForm() { ... }` |
| 훅 | `use` + camelCase | `useCareerTiming` |
| 변수/함수 | camelCase | `birthDate`, `fetchData()` |
| 상수 | UPPER_SNAKE_CASE | `API_TIMEOUT_MS` |
| 타입/인터페이스 | PascalCase | `CareerTimingResponse` |
| CSS 클래스 (Tailwind) | 해당 없음 (유틸리티 사용) | 예: `className="px-4 py-2"` |

---

## 🎨 스타일링: Tailwind CSS (필수)

**Decision**: Tailwind CSS는 **필수 표준**입니다. CSS Modules는 사용하지 않습니다.

### 기본 사용법

```tsx
export default function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      클릭하기
    </button>
  );
}
```

### 조건부 클래스

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

function getButtonClass(variant: 'primary' | 'secondary' = 'primary') {
  const base = 'px-4 py-2 rounded font-semibold';
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  return `${base} ${variants[variant]}`;
}

export default function Button({ variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button
      className={`${getButtonClass(variant)} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      버튼
    </button>
  );
}
```

### 전역 스타일

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 필요 시 커스텀 컴포넌트 (재사용 컴포넌트) */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

---

## 🔄 상태 관리

### Rule 1: 상태는 필요한 범위에 두기

```tsx
// 좋음: 폼 상태는 폼 컴포넌트 안에
function TimingForm() {
  const [birthDate, setBirthDate] = useState('');
  return <form>...</form>;
}

// 나쁨: 굳이 상위로 올릴 필요 없음
function Page() {
  const [birthDate, setBirthDate] = useState('');
  return <TimingForm birthDate={birthDate} setBirthDate={setBirthDate} />;
}
```

### Rule 2: 전역 상태는 금지 (Phase 1)

Phase 1에서는 **전역 상태 관리 라이브러리(Zustand, Redux) 사용 금지**.

- 대부분의 상태는 `useState`로 해결
- 여러 컴포넌트가 공유해야 하면 상위 컴포넌트로 들어올리기
- Phase 2+에서 필요하면 재검토

---

## ⚡ 비동기 처리

### Rule 1: async/await 사용

```typescript
// 좋음
async function submitFeedback(feedback: FeedbackRequest) {
  try {
    const result = await fetchFeedback(feedback);
    return result;
  } catch (err) {
    console.error('피드백 제출 실패:', err);
    throw err;
  }
}

// 나쁨 (콜백 지옥)
function submitFeedback(feedback: FeedbackRequest, callback) {
  fetchFeedback(feedback, (err, result) => { ... });
}
```

### Rule 2: 에러는 삼키지 말기

❌ **나쁨**:
```typescript
try {
  const data = await fetchData();
} catch (err) {
  // 아무것도 하지 않음
}
```

✅ **좋음**:
```typescript
try {
  const data = await fetchData();
} catch (err) {
  console.error('데이터 로드 실패:', err);
  setError('데이터를 불러오지 못했습니다.');
}
```

---

## 🪵 로깅

### 개발 중

```typescript
// API 요청 로깅 (개발 용도)
console.log('생년월일 제출:', birthDate);

// 에러 로깅 (항상 유지)
console.error('API 호출 실패:', error);
```

### 커밋 전 정리

| 종류 | 처리 |
|------|------|
| `console.log` (디버깅) | **제거** |
| `console.error` (에러) | 유지 OK |
| `console.warn` (경고) | 상황에 따라 |

---

## 🧪 테스트 (Phase 1)

**기본**: `npm run build` 통과 + 수동 테스트 체크리스트

### 수동 테스트 체크리스트 (각 페이지마다)

- [ ] 페이지 접근 가능 (`/career/timing`)
- [ ] 폼 입력이 정상 작동
- [ ] 제출 시 네트워크 탭에서 API 호출 확인
- [ ] 응답 데이터 표시 확인
- [ ] 에러 상황(백엔드 꺼짐)에서 앱 크래시 없음
- [ ] 로딩 상태 UI 표시됨
- [ ] 피드백 버튼 동작 (해당 페이지)

---

## 🔒 보안

### Rule 1: 환경 변수로 민감 정보 관리

```typescript
// 좋음
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 나쁨
const API_URL = 'http://production-api.example.com';
```

### Rule 2: XSS 방지

React는 기본적으로 XSS를 방지하지만, `dangerouslySetInnerHTML` 은 금지:

```tsx
// 금지
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// 좋음
<div>{userInput}</div>
```

### Rule 3: 사용자 입력 검증

클라이언트 검증 + 서버 검증 모두 필요:

```tsx
function TimingForm() {
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!isValidBirthDate(birthDate)) {
      setError('YYYY-MM-DD 형식으로 입력해주세요');
      return;
    }
    // 제출
  };

  return ( /* ... */ );
}
```

---

## ✅ ESLint & Prettier

Next.js 기본 ESLint 설정 사용:

```bash
npm run lint              # 검사
npm run lint -- --fix     # 자동 수정
```

Prettier 설정 (`.prettierrc`):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## 📋 코드 체크리스트

커밋 전 스스로 점검:

- [ ] TypeScript 에러 없음 (`npm run build` 통과)
- [ ] `any` 사용 없음 (있다면 주석으로 이유)
- [ ] 디버깅용 `console.log` 제거
- [ ] props 타입 정의됨
- [ ] 훅 이름 `use` 로 시작
- [ ] 환경 변수는 `.env.local` 에
- [ ] 하드코딩된 URL, API 키 없음
- [ ] 모든 스타일은 Tailwind CSS 사용
- [ ] 컴포넌트가 너무 길면 (200줄↑) 분리 고려

---

**Last Updated**: 2026-04-24
