# Data Model: SSAju Frontend (001-ssaju-complete)

**Created**: 2026-05-11  
**Phase**: 1 (Design)  
**Basis**: spec.md (6 user stories, 65+ functional requirements) + plan.md (Zustand architecture)

---

## Entity Relationship Diagram

```
User (로그인/비로그인)
  ├─ authStore (토큰, 프로필)
  ├─ Analysis Records (1...N)
  │   ├─ CareerTimingAnalysis
  │   ├─ ConsultationAnalysis (8탭 입력값)
  │   └─ CompatibilityAnalysis
  └─ Feedback (만족도 제출)
  
Session (페이지당 1회)
  ├─ sajuResultId (분석 고유 ID)
  ├─ currentAnalysisData (현재 분석 결과)
  └─ consultationFieldCache (8탭 입력값 캐시)
```

---

## Core Entities

### 1. User (사용자)

**Responsibility**: 로그인 상태, 프로필 정보, 토큰 관리  
**Storage**: authStore (Zustand), HttpOnly Cookie (backend), sessionStorage (token check)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| `userId` | string (UUID) | UUID v4 format | Yes | 백엔드에서 발급 |
| `provider` | 'KAKAO' \| 'GOOGLE' | enum | Yes | OAuth 제공자 |
| `email` | string | email format | Yes | 소셜 계정 이메일 |
| `nickname` | string | min 1, max 50 | Yes | 사용자 표시명 |
| `accessToken` | string | JWT format | Yes (logged-in) | HttpOnly Cookie + sessionStorage |
| `isLoggedIn` | boolean | - | Yes | 로그인 상태 플래그 |
| `createdAt` | ISO8601 | - | Yes | 계정 생성 시각 |

**Lifecycle**:
- 비로그인 (초기 상태)
- 로그인 진행 중 (OAuth 팝업)
- 로그인됨 (토큰 저장)
- 로그아웃 (토큰 삭제)

**Validation Rules**:
- email: RFC 5322 표준
- nickname: 한글/영문/숫자만, 특수문자 불가
- accessToken: JWT 형식 (3부분 .으로 구분)

---

### 2. SajuAnalysis (사주 분석 기본)

**Responsibility**: 모든 분석의 베이스 데이터 (생년월일, 시간, 신뢰도)  
**Storage**: sessionStore (현재 분석), analysisStore (저장된 분석), backend DB

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| `sajuResultId` | string (UUID) | UUID v4 | Yes | 분석 고유 ID (생성 후 유지) |
| `birthDate` | YYYY-MM-DD | valid date, past | Yes | 생년월일 |
| `birthTime` | HH:mm | 00:00~23:59 or null | No | 태어난 시간 (미상 시 12:00 기본값) |
| `solarType` | 'SOLAR' \| 'LUNAR' | enum | Yes | 양력/음력 구분 |
| `birthCity` | string | min 1, max 100 | No | 태어난 도시 (선택) |
| `gender` | 'M' \| 'F' \| 'UNKNOWN' | enum | No | 성별 |
| `createdAt` | ISO8601 | - | Yes | 분석 생성 시각 |

**Lifecycle**:
- 입력 중 (사용자가 생년월일 입력)
- 분석 중 (API 호출 진행)
- 분석 완료 (결과 수신)
- 저장 대기 (로그인된 경우만)
- 저장됨 (backend에 저장, sajuResultId 영속화)

**Validation Rules**:
- birthDate: 과거 날짜만, 1900-01-01 이후
- birthTime: 24시간 형식 (HH:mm), 미상 시 null (자동 12:00)
- solarType: 양력/음력 선택 (필수)

---

### 3. CareerTimingAnalysis (관운 분석)

**Inheritance**: extends SajuAnalysis  
**Responsibility**: 관운 분석 결과 (H1/H2 예측 + 신뢰도)  
**Storage**: sessionStore → analysisStore (저장 시) → backend

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| `sajuResultId` | string (UUID) | inherit | Yes | 부모 entity FK |
| `favoredPeriod` | 'H1' \| 'H2' | enum | Yes | 상반기/하반기 |
| `confidenceScore` | number | 0~100 | Yes | 신뢰도 백분율 (0~100) |
| `reasoning` | string | max 500 | Yes | 분석 근거 (텍스트) |
| `estimatedCompanies` | string[] | array of companies | No | 추천 회사 (optional) |
| `metadata` | object | flexible | No | 추가 메타데이터 |

**Validation Rules**:
- favoredPeriod: enum only ('H1' or 'H2')
- confidenceScore: integer 0-100
- reasoning: max 500 characters, non-empty

---

### 4. ConsultationAnalysis (AI 커리어 컨설팅)

**Inheritance**: extends SajuAnalysis  
**Responsibility**: 8탭 컨설팅 결과 + 입력값 캐싱  
**Storage**: sessionStore (입력값 캐시) → consultationStore (결과) → backend

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| `sajuResultId` | string (UUID) | inherit | Yes | 부모 entity FK |
| `tabs` | ConsultationTab[] | array of 8 items | Yes | 8개 탭 데이터 |
| `selectedTabIndex` | number | 0~7 | Yes | 현재 선택 탭 (기본 0) |
| `submittedAt` | ISO8601 \| null | valid datetime | No | 제출 시각 (저장 전 null) |

**Nested: ConsultationTab**

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| `tabId` | string | enum: 'CAREER', 'LOVE', 'HEALTH', 'FINANCE', 'TRAVEL', 'STUDY', 'FAMILY', 'LEISURE' | Yes | 탭 식별자 |
| `userInput` | string | max 500 | No | 사용자 입력 (선택사항) |
| `result` | string | max 2000 | No | AI 분석 결과 |
| `confidence` | number | 0~100 | No | 신뢰도 점수 |
| `isLoaded` | boolean | - | Yes | 탭 로드 상태 |

**Tab Labels** (한글 표시명):
- CAREER: 직업/진로
- LOVE: 연애/결혼
- HEALTH: 건강/웰빙
- FINANCE: 재정/투자
- TRAVEL: 여행/모험
- STUDY: 학습/성장
- FAMILY: 가정/관계
- LEISURE: 여가/취미

**Validation Rules**:
- tabs.length === 8 (정확히 8개)
- selectedTabIndex: 0~7 integer
- userInput: max 500 chars (optional)
- result: max 2000 chars (로드 후에만)

**Caching Strategy** (Q4 명확화):
- useConsultationStore: 입력값 캐시 (탭 전환 시 복원)
- Zustand persist: 페이지 새로고침 후 복원
- 각 탭별로 독립적 로드 (캐시 hit 시 0.2s 즉시 렌더링)

---

### 5. CompatibilityAnalysis (기업 궁합 분석)

**Inheritance**: extends SajuAnalysis  
**Responsibility**: 기업명 입력 → 궁합 점수 + 해석  
**Storage**: sessionStore → analysisStore → backend

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| `sajuResultId` | string (UUID) | inherit | Yes | 부모 entity FK |
| `companyName` | string | min 1, max 100 | Yes | 기업명 |
| `compatibilityScore` | number | 0~100 | Yes | 궁합 점수 |
| `interpretation` | string | max 1000 | Yes | 해석 텍스트 |
| `suggestions` | string[] | array | No | 권고사항 (선택사항) |

**Validation Rules**:
- companyName: 한글/영문/숫자/하이픈 허용, 특수문자 제거
- compatibilityScore: integer 0-100
- interpretation: max 1000 characters

---

### 6. AnalysisRecord (분석 기록 - 마이페이지)

**Responsibility**: 저장된 분석 기록 정보 (마이페이지 리스트)  
**Storage**: backend DB (사용자별로 조회)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| `recordId` | string (UUID) | UUID v4 | Yes | 기록 고유 ID |
| `userId` | string (UUID) | FK to User | Yes | 소유자 |
| `analysisType` | 'CAREER' \| 'CONSULTATION' \| 'COMPANY' | enum | Yes | 분석 타입 |
| `sajuResultId` | string (UUID) | FK to SajuAnalysis | Yes | 분석 데이터 FK |
| `birthDate` | YYYY-MM-DD | inherit from SajuAnalysis | Yes | 표시용 (데이터 중복) |
| `summary` | string | max 200 | Yes | 미리보기 텍스트 |
| `createdAt` | ISO8601 | - | Yes | 기록 생성 시각 |
| `updatedAt` | ISO8601 | - | No | 마지막 수정 시각 |

**Validation Rules**:
- analysisType: enum only
- summary: 자동 생성 (예: "H1 권장, 신뢰도 85%")

---

### 7. Feedback (피드백/만족도)

**Responsibility**: 사용자 만족도 및 피드백 수집  
**Storage**: backend DB only (프론트엔드는 제출만)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| `feedbackId` | string (UUID) | UUID v4 | Yes | 피드백 고유 ID (백엔드 생성) |
| `userId` | string (UUID) | FK to User | Yes | 사용자 (비로그인 시 anonymous) |
| `analysisType` | 'CAREER' \| 'CONSULTATION' \| 'COMPANY' \| 'GENERAL' | enum | Yes | 어느 분석에 대한 피드백 |
| `satisfactionScore` | number | 1~5 | Yes | 만족도 1~5 점 |
| `feedbackText` | string | max 500 | No | 자유 의견 (선택) |
| `createdAt` | ISO8601 | - | Yes | 제출 시각 |

**Validation Rules**:
- satisfactionScore: integer 1-5 only
- feedbackText: max 500 chars (optional)

---

## State Diagram (Zustand Stores)

### authStore (사용자 인증)

```typescript
{
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  provider: 'KAKAO' | 'GOOGLE' | null;
  loginError: string | null;
  
  // Actions
  setLogin(user: User, token: string): void;
  setLogout(): void;
  setLoginError(error: string): void;
}
```

### sessionStore (현재 세션)

```typescript
{
  sajuResultId: string | null;
  lastAnalysisType: 'CAREER' | 'CONSULTATION' | 'COMPANY' | null;
  currentAnalysisData: SajuAnalysis | null;
  isAnalyzing: boolean;
  
  // Actions
  setSajuResultId(id: string): void;
  setCurrentAnalysis(data: SajuAnalysis): void;
  clearSession(): void;
}
```

### analysisStore (분석 결과)

```typescript
{
  careerTiming: CareerTimingAnalysis | null;
  consultation: ConsultationAnalysis | null;
  compatibility: CompatibilityAnalysis | null;
  
  // Actions
  setCareerTiming(data: CareerTimingAnalysis): void;
  setConsultation(data: ConsultationAnalysis): void;
  setCompatibility(data: CompatibilityAnalysis): void;
  clearAnalysis(): void;
}
```

### consultationStore (컨설팅 캐싱)

```typescript
{
  fieldCache: { [tabId: string]: string };  // 입력값 캐시
  selectedTabIndex: number;
  
  // Actions
  setFieldValue(tabId: string, value: string): void;
  getFieldValue(tabId: string): string | undefined;
  selectTab(index: number): void;
  clearCache(): void;
}
```

### errorStore (에러 메시지)

```typescript
{
  globalError: { message: string; code: string } | null;
  toastQueue: Toast[];  // Sonner 토스트 큐
  
  // Actions
  setGlobalError(error: { message: string; code: string }): void;
  clearError(): void;
  addToast(toast: Toast): void;
  removeToast(id: string): void;
}
```

---

## API Request/Response Models

### CareerTimingRequest

```typescript
interface CareerTimingRequest {
  birthDate: string;      // YYYY-MM-DD
  birthTime: string;      // HH:mm (null 시 "12:00")
  solarType: 'SOLAR' | 'LUNAR';
  birthCity?: string;
  gender?: 'M' | 'F' | 'UNKNOWN';
}
```

### CareerTimingResponse

```typescript
interface CareerTimingResponse {
  sajuResultId: string;
  favoredPeriod: 'H1' | 'H2';
  confidenceScore: number;  // 0~100
  reasoning: string;
  estimatedCompanies?: string[];
}
```

### ConsultationRequest

```typescript
interface ConsultationRequest {
  sajuResultId: string;
  tabId: string;
  userInput?: string;  // 사용자가 입력한 맥락
}
```

### ConsultationResponse

```typescript
interface ConsultationResponse {
  sajuResultId: string;
  tabId: string;
  result: string;
  confidence: number;  // 0~100
}
```

### CompatibilityRequest

```typescript
interface CompatibilityRequest {
  sajuResultId: string;
  companyName: string;
}
```

### CompatibilityResponse

```typescript
interface CompatibilityResponse {
  sajuResultId: string;
  companyName: string;
  compatibilityScore: number;  // 0~100
  interpretation: string;
  suggestions?: string[];
}
```

---

## Persistence & Lifecycle

### Page Refresh Behavior (페이지 새로고침 후 복원)

1. **authStore**: HttpOnly Cookie 자동 검증 (백엔드)
2. **sessionStore**: sessionStorage에 sajuResultId 저장 → 새로고침 후 복원
3. **consultationStore**: Zustand persist 플러그인 → localStorage 자동 복원
4. **analysisStore**: sessionStorage에 현재 분석 데이터 저장

### Data Flow on Login

1. 비로그인 사용자가 분석 완료 → sessionStore에 저장
2. LoginNudgeCard에서 로그인 클릭 → OAuth 팝업
3. OAuth 완료 후 → authStore.setLogin() 호출
4. 자동으로 현재 분석 결과를 backend에 저장 (Q1 명확화)
5. 저장 완료 후 → "저장되었습니다" 토스트

### Data Deletion

- 로그아웃 시: authStore + sessionStore 완전 삭제
- 기록 삭제: backend에서만 삭제 (frontend cache는 즉시 제거)
- 분석 결과 폐기: sessionStore clear

---

## Validation & Constraints

### Input Validation (Zod Schemas)

All requests validated using Zod before API submission:
- Date format: ISO8601 (YYYY-MM-DD)
- Time format: 24-hour (HH:mm)
- Text length: max 500 (user input), max 2000 (results)
- Numeric ranges: 0~100 for scores, 1~5 for satisfaction

### Type Safety

- TypeScript strict mode enabled
- All API responses wrapped in `ApiResponse<T>` with Zod validation
- No `any` types allowed

---

## Summary

**Total Entities**: 7 (User, SajuAnalysis, CareerTiming, Consultation, Compatibility, AnalysisRecord, Feedback)  
**Total Stores**: 5 Zustand stores (auth, session, analysis, consultation, error)  
**Relationships**: User 1-to-N Analysis, Session 1-to-1 Current Analysis, Store cross-references  
**Validation**: Zod runtime + TypeScript compile-time  
**Persistence**: HttpOnly Cookie (auth), sessionStorage (session), Zustand persist (consultation cache)
