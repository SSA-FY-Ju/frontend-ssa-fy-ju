# SSAju Frontend 아키텍처 가이드 (공통 원칙)

## 계층형 아키텍처 패턴

Next.js + React 프로젝트는 다음 계층으로 분리합니다:

```
┌────────────────────────────────┐
│  Page Layer (app/**/page.tsx)  │
│  (라우팅 + 페이지 조합)         │
└───────────┬────────────────────┘
            │
┌───────────▼────────────────┐
│  Component Layer           │
│  (components/)             │
│  (UI 렌더링 + 상호작용)     │
└───────────┬────────────────┘
            │
┌───────────▼────────────────┐
│  Hook Layer (hooks/)       │
│  (상태 + 비즈니스 로직)     │
└───────────┬────────────────┘
            │
┌───────────▼────────────────┐
│  API Layer (lib/api/)      │
│  (HTTP 통신)               │
└───────────┬────────────────┘
            │
┌───────────▼────────────────┐
│  Backend API (Spring Boot) │
│  (외부 시스템)             │
└────────────────────────────┘
```

### 각 계층의 책임

| 계층 | 책임 | 규칙 |
|------|------|------|
| **Page** | 라우팅, 페이지 조합, 전체 상태 조합 | 비즈니스 로직 금지, JSX 50-100줄 이내 |
| **Component** | UI 렌더링, 사용자 입력 | 외부 상태 의존 최소화, props 기반 소통 |
| **Hook** | 상태 관리, API 조율, 데이터 가공 | 재사용 가능하도록 설계 |
| **API** | fetch 호출, 응답 파싱, 에러 전파 | UI와 독립적 |

---

## 📐 Next.js App Router 구조 원칙

### Rule 1: 페이지(page.tsx)는 얇게 유지 (50-100줄)

❌ **나쁜 예** (페이지에 모든 로직):
```tsx
// app/career/timing/page.tsx
"use client";
export default function Page() {
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/career/timing', { /* ... */ });
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  };

  return (
    <div>
      {/* 200줄의 JSX */}
    </div>
  );
}
```

✅ **좋은 예** (페이지는 조립만):
```tsx
// app/career/timing/page.tsx
"use client";
import { useCareerTiming } from '@/hooks/useCareerTiming';
import TimingForm from '@/components/career/TimingForm';
import TimingResult from '@/components/career/TimingResult';

export default function Page() {
  const { data, loading, error, submit } = useCareerTiming();

  return (
    <main>
      <h1>관운 분석</h1>
      <TimingForm onSubmit={submit} loading={loading} />
      {error && <p>{error}</p>}
      {data && <TimingResult data={data} />}
    </main>
  );
}
```

**Phase 1 페이지 구조 표준**:
- 1개 커스텀 훅 호출 (최대)
- 3개 이상의 UI 컴포넌트 렌더링 → 컴포넌트 분리 고려
- JSX 본문 50-100줄 이내 유지

### Rule 2: Server Component vs Client Component

Next.js App Router는 기본이 **Server Component**입니다.

**Server Component (기본)**:
- 상태(`useState`) 사용 불가
- 이벤트 핸들러 사용 불가
- 서버에서 렌더링, 번들 사이즈 작음

**Client Component (`"use client"` 필수)**:
- `useState`, `useEffect`, `useRef` 사용 가능
- `onClick`, `onChange` 등 이벤트 가능
- 브라우저 API 사용 가능

**전략**:
- Phase 1: 모든 페이지에 `"use client"` 추가 (단순화)
- Phase 2+: Server Component 점진적 도입 (성능 최적화)

> 💡 Phase 1은 단순성을 우선. 나중에 최적화.

---

## 🌐 API 통신 패턴

### Rule 1: API 클라이언트 중앙화

모든 HTTP 요청은 `lib/api/client.ts` 를 거칩니다:

```typescript
// lib/api/client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  
  console.log(`[API] ${options?.method ?? 'GET'} ${url}`);

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API 에러 ${res.status}: ${errorBody}`);
  }

  return res.json();
}
```

### Rule 2: 도메인별 API 함수 분리

```typescript
// lib/api/career.ts
import { apiFetch } from './client';
import type {
  ApiResponse,
  CareerTimingResponse,
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

### Rule 3: 에러는 throw, UI에서 catch

```typescript
// 좋음: API 함수는 성공 데이터만 반환, 실패는 throw
export async function fetchCareerTiming(birthDate: string) {
  const res = await apiFetch(...);
  if (!res.success) throw new Error(...);
  return res.data;
}

// 훅에서 try-catch
export function useCareerTiming() {
  const [error, setError] = useState<string | null>(null);
  
  const submit = async (birthDate: string) => {
    try {
      const data = await fetchCareerTiming(birthDate);
      // ...
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    }
  };
}
```

**재시도 로직**: Phase 1에서는 불필요. 사용자가 수동 재제출.

---

## 🔄 상태 관리 전략

### 상태의 종류 구분

| 종류 | 특징 | 관리 방법 |
|------|------|---------|
| **로컬 상태** | 한 컴포넌트 안에서만 사용 | `useState` |
| **공유 상태** | 여러 컴포넌트가 공유 | 상위로 lifting |
| **서버 상태** | API에서 가져온 데이터 | 커스텀 훅 |
| **URL 상태** | 검색어, 필터 등 | `useSearchParams` |
| **전역 상태** | 어디서나 접근 | Phase 1 금지 |

### 예시: 상태를 어디에 둘지 결정

```tsx
// Case 1: 폼 내부 상태 → 로컬
function TimingForm({ onSubmit }) {
  const [birthDate, setBirthDate] = useState(''); // 여기면 충분
}

// Case 2: 페이지 전체에서 공유 → 훅
function Page() {
  const { data, submit } = useCareerTiming();
  return <>{/* ... */}</>;
}
```

---

## 🚨 예외 처리 원칙

### Rule 1: 예외를 삼키지 말 것

❌ **나쁜 예**:
```typescript
try {
  const data = await fetchCareerTiming(birthDate);
  setData(data);
} catch (err) {
  // 아무것도 안 함
}
```

✅ **좋은 예**:
```typescript
try {
  const data = await fetchCareerTiming(birthDate);
  setData(data);
} catch (err) {
  console.error('관운 분석 요청 실패:', err);
  setError(err instanceof Error ? err.message : '요청에 실패했습니다');
}
```

### Rule 2: 에러 메시지는 사용자 친화적으로

❌ **나쁨**: `Error: AxiosError: Network Error (ECONNREFUSED)`

✅ **좋음**: `서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.`

```typescript
function toUserFriendlyMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('Network')) {
      return '서버에 연결할 수 없습니다.';
    }
    if (err.message.includes('400')) {
      return '입력값을 확인해주세요.';
    }
  }
  return '알 수 없는 오류가 발생했습니다.';
}
```

---

## 📝 로깅 전략

### 개발 환경

```typescript
// API 요청 로깅 (개발 용도)
console.log(`[API] POST /api/career/timing`, { birthDate });

// 에러 로깅 (항상 유지)
console.error('[ERROR] 요청 실패:', err);
```

### 커밋 전 정리

| 종류 | 커밋 전 처리 |
|------|------------|
| `console.log` (디버깅) | **제거** |
| `console.error` (에러 추적) | 유지 OK |
| `console.warn` (경고) | 상황에 따라 |

---

## 🔐 보안 원칙

### Rule 1: 환경 변수로 민감 정보

```typescript
// 좋음
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 나쁨 (하드코딩)
const API_URL = 'http://localhost:8080';
```

### Rule 2: 입력 검증은 클라이언트+서버 양쪽

```tsx
function TimingForm() {
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // 클라이언트 검증
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setError('YYYY-MM-DD 형식으로 입력해주세요');
      return;
    }
    // ... 제출
  };
}
```

### Rule 3: XSS 방지

- `dangerouslySetInnerHTML` **사용 금지**
- 외부 URL은 검증 후 사용

---

## 📂 의존성 관리 원칙

### Phase 1 제약 (엄격함)

| 기능 | 사용 | 금지 |
|------|------|------|
| HTTP | fetch | axios |
| 상태 관리 | useState + props | Zustand, Redux |
| 폼 관리 | useState | react-hook-form |
| UI 컴포넌트 | 직접 구현 | shadcn/ui, MUI |
| 스타일링 | **Tailwind CSS** (필수) | CSS Modules |

**이유**: 학습과 트러블 슈팅 경험을 위해. 필요해지면 Phase 2에서 검토.

---

## 🧪 테스트 전략 (Phase 1)

**기본**: `npm run build` 통과 + 수동 테스트

### 수동 테스트 체크리스트 (각 페이지마다)

- [ ] 페이지 접근 가능 (에러 없음)
- [ ] 폼 입력 동작
- [ ] 제출 시 네트워크 탭에서 API 호출 확인
- [ ] 응답 도착 시 UI 업데이트
- [ ] 에러 상황(백엔드 꺼짐)에서 앱 크래시 없음
- [ ] 로딩 상태 UI 표시
- [ ] 피드백 버튼 동작 (해당하는 페이지)

---

## 🎯 성능 원칙 (Phase 1)

**너무 이르게 최적화하지 말 것**:
- `React.memo`, `useMemo`, `useCallback` 불필요
- 이미지 최적화 나중에
- 코드 스플리팅 나중에

**Phase 2+에서 도입 고려**:
- Sentry: 프로덕션 에러 수집
- LogRocket: 사용자 세션 리플레이

---

## 🔄 외부 API 통신 요약

### 백엔드 응답 공통 포맷

모든 백엔드 API는 `ApiResponse<T>` 형태로 응답:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorInfo | null;
  timestamp: number;
}

interface ErrorInfo {
  code: string;       // "INVALID_DATE_FORMAT" 등
  message: string;
  requestId: string;
}
```

### 엔드포인트 목록

| 엔드포인트 | 메서드 | 용도 |
|----------|-------|------|
| `/api/career/timing` | POST | 관운 분석 |
| `/api/career/consultation` | POST | AI 커리어 컨설팅 |
| `/api/company/compatibility` | POST | 기업 궁합 분석 |
| `/api/feedback/satisfaction` | POST | 만족도 피드백 제출 |

---

## 📋 아키텍처 체크리스트

컴포넌트/페이지 작성 시:

- [ ] 페이지(page.tsx)는 50-100줄 이내인가?
- [ ] 상태는 필요한 범위에만 있는가?
- [ ] API 호출은 `lib/api/` 에 분리되어 있는가?
- [ ] 비즈니스 로직은 훅으로 분리되어 있는가?
- [ ] 타입은 `types/` 또는 컴포넌트 상단에 정의되어 있는가?
- [ ] 환경 변수는 `.env.local` 을 사용하는가?
- [ ] 에러 처리가 되어 있는가 (console.error + 사용자 피드백)?
- [ ] 스타일은 Tailwind CSS를 사용하는가?

---

**Last Updated**: 2026-04-24
