# Component & Hook Interface Contracts

**Created**: 2026-05-11  
**Phase**: 1 (Design)  
**Purpose**: Define props/return type contracts for components and hooks

---

## Component Contract Format

Each component specifies:
- **Purpose**: What it renders and does
- **Props Interface**: Input parameters (with validation rules)
- **Return Type**: JSX.Element
- **Children**: Supported or not
- **Side Effects**: State mutations, API calls, etc.
- **Accessibility**: ARIA attributes, keyboard support

---

## Core Components (By User Story)

### US1: Authentication Components

#### LoginButton

**Purpose**: Render 카카오/구글 로그인 옵션 버튼

```typescript
interface LoginButtonProps {
  variant?: 'primary' | 'secondary';  // default: 'primary'
  size?: 'sm' | 'md' | 'lg';          // default: 'md'
  onLoginSuccess?: (user: User) => void;
  onLoginError?: (error: string) => void;
  children?: ReactNode;               // custom label
}

export default function LoginButton(props: LoginButtonProps): JSX.Element
```

**Rendering**:
- 2개 버튼: "카카오로 계속하기" + "구글로 계속하기" (또는 dropdown)
- 클릭 시 OAuth 팝업 (redirect 아님)

**Side Effects**:
- OAuth 팝업 열기
- 성공: authStore.setLogin() + navigate to page
- 실패: onLoginError 콜백 + error message

**Accessibility**:
- `role="button"`
- `aria-label="카카오로 로그인"` 등

---

#### ProfileMenu

**Purpose**: Render 로그인된 사용자 프로필 + 메뉴

```typescript
interface ProfileMenuProps {
  user: User;
  onLogout?: () => void;
  onNavigate?: (path: string) => void;
}

export default function ProfileMenu(props: ProfileMenuProps): JSX.Element
```

**Rendering**:
- 사용자 닉네임 + 프로필 아이콘
- 클릭 시 드롭다운: "마이페이지", "로그아웃" 등

**Side Effects**:
- 로그아웃: authStore.setLogout() + clear sessionStore

---

### US3: Career Timing Components

#### TimingForm

**Purpose**: Render 생년월일/시간 입력 폼

```typescript
interface TimingFormProps {
  onSubmit: (formData: CareerTimingRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function TimingForm(props: TimingFormProps): JSX.Element
```

**Inputs**:
- 생년월일 (date picker or text input)
- 태어난 시간 (time picker, nullable)
- 양력/음력 선택 (radio or select)
- 성별 (select, optional)
- 도시 (autocomplete, optional)

**Validation**:
- birthDate: required, valid date, past
- solarType: required
- All via Zod at hook level

**Side Effects**:
- onSubmit 콜백 (async)
- Error display: error prop

---

#### DisclaimerOverlay

**Purpose**: Render 1.5초 고지 문구 오버레이 (분석 직후)

```typescript
interface DisclaimerOverlayProps {
  visible: boolean;
  duration?: number;          // ms, default 1500
  fadeDuration?: number;      // ms, default 500
  onDismiss?: () => void;     // Called after fade-out complete
}

export default function DisclaimerOverlay(props: DisclaimerOverlayProps): JSX.Element
```

**Content**:
- "본 사주는 재미로 보는 것이니 참고만 바랍니다"
- Dark overlay (opacity 0.5)
- White text (centered)
- Responsive font: desktop 28px, tablet 24px, mobile 20px

**Animation** (Q1 명확화):
- Fade-in: display immediately
- Display: 1.5s (fixed duration)
- Fade-out: 500ms ease-in-out
- Blocks user input (terz/click/scroll disabled)

**Side Effects**:
- setTimeout 1500ms
- CSS transition opacity on fade
- onDismiss callback after fade completes

**Accessibility**:
- `role="alert"`
- `aria-live="assertive"`
- No focus trap (overlay doesn't accept input)

---

#### CareerTimingResult

**Purpose**: Render H1/H2 결과 + 신뢰도 + 분석 근거

```typescript
interface CareerTimingResultProps {
  analysis: CareerTimingAnalysis;
  isLoggedIn: boolean;
  onSave?: () => Promise<void>;
  onFeedback?: (score: number) => void;
}

export default function CareerTimingResult(props: CareerTimingResultProps): JSX.Element
```

**Rendering**:
- 대형 결과 표시: H1 또는 H2
- Progress bar: confidenceScore (0-100)
- 분석 근거 텍스트
- 로그인 상태에 따른 "저장하기" 버튼

**Side Effects**:
- Save button: onSave async callback
- Feedback: onFeedback callback

---

### US4: Consultation Components

#### ConsultationTabs

**Purpose**: Render 8탭 네비게이션 + 현재 탭 콘텐츠

```typescript
interface ConsultationTabsProps {
  analysis: ConsultationAnalysis;
  selectedTabIndex: number;
  onTabSelect: (index: number) => void;
  isLoading?: boolean;
}

export default function ConsultationTabs(props: ConsultationTabsProps): JSX.Element
```

**Tabs** (8개):
1. 직업/진로 (CAREER)
2. 연애/결혼 (LOVE)
3. 건강/웰빙 (HEALTH)
4. 재정/투자 (FINANCE)
5. 여행/모험 (TRAVEL)
6. 학습/성장 (STUDY)
7. 가정/관계 (FAMILY)
8. 여가/취미 (LEISURE)

**Tab Switching**:
- 0.2초 instant (due to Zustand caching)
- 클릭 시 consultationStore.selectTab() 발동
- Cache hit: immediate display
- Cache miss: loading spinner + API call

**Side Effects**:
- Zustand consultationStore interaction
- Tab input value restore from cache
- API fetch if not cached

---

#### ConsultationTabContent

**Purpose**: Render 단일 탭의 입력 폼 + AI 결과

```typescript
interface ConsultationTabContentProps {
  tabId: string;
  tabIndex: number;
  tabLabel: string;
  cachedInput?: string;
  result?: string;
  isLoading?: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}

export default function ConsultationTabContent(props: ConsultationTabContentProps): JSX.Element
```

**Rendering**:
- 텍스트 에어리어: 사용자 입력 (선택)
- AI 결과 (로드 후에만 표시)
- Submit 버튼 (각 탭별)

**Side Effects**:
- Input cache: onInputChange (consultationStore 업데이트)
- Submit: onSubmit async callback

---

### US5: Company Compatibility Components

#### CompanyForm

**Purpose**: Render 기업명 입력 폼 + 자동완성

```typescript
interface CompanyFormProps {
  onSubmit: (companyName: string) => Promise<void>;
  isLoading?: boolean;
  suggestions?: string[];  // Autocomplete options
}

export default function CompanyForm(props: CompanyFormProps): JSX.Element
```

**Inputs**:
- 기업명 텍스트 입력 (autocomplete enabled)
- Dropdown: 제안된 기업명 리스트

**Side Effects**:
- onSubmit async callback
- Fetch suggestions on input change

---

#### CompatibilityResult

**Purpose**: Render 궁합 점수 + 해석 + 권고

```typescript
interface CompatibilityResultProps {
  analysis: CompatibilityAnalysis;
  isLoggedIn: boolean;
  onSave?: () => Promise<void>;
}

export default function CompatibilityResult(props: CompatibilityResultProps): JSX.Element
```

**Rendering**:
- 큼지막한 점수 (0-100)
- 게이지 차트 (Recharts)
- 해석 텍스트
- 권고사항 리스트

---

### US2: My Page Components

#### AnalysisRecordCard

**Purpose**: Render 분석 기록 카드 (리스트 아이템)

```typescript
interface AnalysisRecordCardProps {
  record: AnalysisRecord;
  isLoading?: boolean;
  onClick: (recordId: string) => void;
  onDelete: (recordId: string) => Promise<void>;
}

export default function AnalysisRecordCard(props: AnalysisRecordCardProps): JSX.Element
```

**Rendering**:
- 기록 생성 날짜/시간
- 분석 대상 정보 (생년월일, 타입)
- 핵심 결과 미리보기
- Delete 아이콘

**Side Effects**:
- onClick: navigate to detail view
- onDelete: async delete + confirm modal

---

#### MyPageTabs

**Purpose**: Render 3탭 (관운, 컨설팅, 궁합) + 리스트

```typescript
interface MyPageTabsProps {
  selectedTab: 'CAREER' | 'CONSULTATION' | 'COMPANY';
  onTabSelect: (tab: string) => void;
  records: AnalysisRecord[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore: () => void;
}

export default function MyPageTabs(props: MyPageTabsProps): JSX.Element
```

**Rendering**:
- 3개 탭 (CAREER, CONSULTATION, COMPANY)
- 각 탭 내 기록 리스트
- 무한 스크롤 (hasMore + onLoadMore)

**Side Effects**:
- Tab selection: API fetch (offset-based pagination)
- Load more: append records + increment offset

---

### Shared Components

#### LoadingSpinner

**Purpose**: Render 로딩 상태 스피너

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';      // default: 'md'
  message?: string;
  fullScreen?: boolean;            // default: false
}

export default function LoadingSpinner(props: LoadingSpinnerProps): JSX.Element
```

---

#### ErrorMessage

**Purpose**: Render 에러 메시지 + 재시도 버튼

```typescript
interface ErrorMessageProps {
  error: string | Error;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorMessage(props: ErrorMessageProps): JSX.Element
```

---

#### Toast (Sonner)

**Purpose**: Render 토스트 알림

```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;  // ms
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage: toast({ message: '...' })
```

---

## Custom Hooks

### useCareerTiming

**Purpose**: Manage career timing analysis state + API call

```typescript
interface UseCareerTimingReturn {
  data: CareerTimingAnalysis | null;
  loading: boolean;
  error: string | null;
  submit: (formData: CareerTimingRequest) => Promise<CareerTimingAnalysis>;
  reset: () => void;
}

export function useCareerTiming(): UseCareerTimingReturn
```

**State**:
- `data`: 분석 결과
- `loading`: API 호출 중 여부
- `error`: 에러 메시지

**Actions**:
- `submit`: formData 검증 + API 호출 + sessionStore 업데이트
- `reset`: 결과 초기화

---

### useConsultation

**Purpose**: Manage consultation tab + caching + API calls

```typescript
interface UseConsultationReturn {
  analysis: ConsultationAnalysis;
  selectedTabIndex: number;
  fieldCache: { [tabId: string]: string };
  selectTab: (index: number) => void;
  setFieldValue: (tabId: string, value: string) => void;
  submitTab: (tabIndex: number) => Promise<ConsultationResponse>;
  isLoading: boolean;
  error: string | null;
}

export function useConsultation(sajuResultId: string): UseConsultationReturn
```

**State** (from consultationStore):
- selectedTabIndex
- fieldCache (input values per tab)

**Actions**:
- selectTab: switch tab + restore from cache
- setFieldValue: update cache (Zustand)
- submitTab: API call for selected tab

**Caching** (Q4):
- User input cached per tab
- API results cached (don't re-fetch)
- Zustand persist: auto-restore on page refresh

---

### useAnalysisRecords

**Purpose**: Manage my-page records list + pagination

```typescript
interface UseAnalysisRecordsReturn {
  records: AnalysisRecord[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAnalysisRecords(analysisType: string): UseAnalysisRecordsReturn
```

**Pagination** (Q3):
- Offset-based (offset + limit 20)
- hasMore flag indicates if more records exist
- loadMore: fetch next 20 records (infinite scroll)

---

### usePageExitGuard

**Purpose**: Prevent page exit if unsaved data exists (Q6)

```typescript
interface UsePageExitGuardReturn {
  registerGuard: (shouldPreventExit: boolean) => void;
  unregister: () => void;
}

export function usePageExitGuard(config: {
  shouldPrevent?: () => boolean;
  onExit?: () => void;
}): UsePageExitGuardReturn
```

**Implementation**:
- beforeunload: handles tab close/refresh
- beforePopState: handles browser back button
- Route change interception: handles Next.js navigation

**Q6 Note**: usePageExitGuard 훅이 2가지 이벤트를 모두 처리:
1. beforeunload: "현재 페이지를 나가시겠습니까?" (탭 종료/새로고침)
2. beforePopState: "지금 나가면 분석이 삭제됩니다" (뒤로가기/네비게이션)

---

### useDisclaimerTiming

**Purpose**: Manage disclaimer overlay timing + animation (Q1)

```typescript
interface UseDisclaimerTimingReturn {
  isVisible: boolean;
  isFadingOut: boolean;
  startDisclaimer: () => void;
}

export function useDisclaimerTiming(options: {
  duration?: number;      // ms, default 1500
  fadeDuration?: number;  // ms, default 500
  onComplete?: () => void;
}): UseDisclaimerTimingReturn
```

**Timing** (Q1 명확화):
- setTimeout 1500ms (display duration)
- CSS transition 500ms ease-in-out (fade)

---

### useAuthStore

**Purpose**: Access global auth state (Zustand)

```typescript
interface UseAuthStoreReturn {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  setLogin: (user: User, token: string) => void;
  setLogout: () => void;
  setLoginError: (error: string) => void;
}

export function useAuthStore(): UseAuthStoreReturn
```

---

### useSessionStore

**Purpose**: Access session state (Zustand)

```typescript
interface UseSessionStoreReturn {
  sajuResultId: string | null;
  lastAnalysisType: string | null;
  currentAnalysisData: any | null;
  isAnalyzing: boolean;
  setSajuResultId: (id: string) => void;
  setCurrentAnalysis: (data: any) => void;
  clearSession: () => void;
}

export function useSessionStore(): UseSessionStoreReturn
```

---

## Type Consistency Rules

1. **All Props**: Use `PropsWithChildren<T>` if component accepts children
2. **All Hooks**: Return object with clear, actionable properties
3. **Error Handling**: Always include `error: string | null` in return types
4. **Loading States**: Always include `loading: boolean`
5. **Callbacks**: Use `(...) => void` (sync) or `(...) => Promise<T>` (async)

---

## Testing Strategy

- **Props Validation**: Zod schemas at component level
- **Hook Returns**: Type checking + mock testing
- **Callbacks**: Jest mocks + RTL user events
- **Accessibility**: axe-core testing + manual review

---

## Summary

- **Total Components**: ~40 (pages, layouts, features)
- **Total Hooks**: ~10 (custom domain logic)
- **Total Zustand Stores**: 5 (auth, session, analysis, consultation, error)
- **All interfaces**: Fully typed (TypeScript strict mode)
- **All contracts**: Tested via MSW mocks + Jest
