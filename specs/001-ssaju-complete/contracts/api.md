# API Interface Contracts

**Created**: 2026-05-11  
**Phase**: 1 (Design)  
**Purpose**: Define request/response contracts for all backend API endpoints

---

## Contract Format

Each contract specifies:
- **Endpoint**: HTTP method + path
- **Purpose**: What this endpoint does
- **Request**: Input payload (Zod schema format)
- **Response**: Output payload (success + error cases)
- **Timeout**: Maximum wait time
- **Authentication**: Required or optional

---

## 1. Career Timing Analysis

### POST /api/career/timing

**Purpose**: 관운 분석 - H1/H2 시기 예측

**Request**:
```typescript
interface CareerTimingRequest {
  birthDate: string;        // YYYY-MM-DD, required
  birthTime: string;        // HH:mm, required (기본값 "12:00")
  solarType: 'SOLAR' | 'LUNAR';  // required
  birthCity?: string;       // optional
  gender?: 'M' | 'F';       // optional
}
```

**Response (Success)**:
```typescript
interface CareerTimingResponse {
  sajuResultId: string;     // UUID v4, 분석 고유 ID
  favoredPeriod: 'H1' | 'H2';
  confidenceScore: number;  // 0-100
  reasoning: string;        // 분석 근거 텍스트
  estimatedCompanies?: string[];
  metadata?: Record<string, any>;
}
```

**Response (Error)**:
```typescript
interface ApiErrorResponse {
  error: {
    code: string;           // e.g., "INVALID_DATE_FORMAT"
    message: string;        // 사용자 표시용 메시지
    requestId: string;      // 추적용 ID
  }
}
```

**Wrapped Response**:
```typescript
interface ApiResponse<CareerTimingResponse> {
  success: boolean;
  data: CareerTimingResponse | null;
  error: ApiErrorResponse['error'] | null;
  timestamp: number;  // Unix milliseconds
}
```

**Timeout**: 10 seconds  
**Authentication**: Optional (logged-in 시 결과 자동 저장)  
**Retry Policy** (Q5): Network/timeout only (exponential backoff: 1s, 2s, 4s)

---

## 2. AI Consultation

### POST /api/career/consultation

**Purpose**: 8탭 AI 컨설팅 (직업, 연애, 건강 등)

**Request**:
```typescript
interface ConsultationRequest {
  sajuResultId: string;     // 선행 CareerTiming 분석의 ID
  tabId: string;            // enum: 'CAREER' | 'LOVE' | 'HEALTH' | 'FINANCE' | 'TRAVEL' | 'STUDY' | 'FAMILY' | 'LEISURE'
  userInput?: string;       // 사용자 추가 맥락 (optional, max 500)
}
```

**Response (Success)**:
```typescript
interface ConsultationResponse {
  sajuResultId: string;
  tabId: string;
  result: string;           // AI 생성 결과 (max 2000)
  confidence: number;       // 0-100
  followUpSuggestions?: string[];  // 추가 제안 (선택)
}
```

**Timeout**: 15 seconds (AI generation)  
**Authentication**: Optional  
**Retry Policy** (Q5): Network/timeout only  
**Caching** (Q4):
- Frontend caches all 8 tabs separately
- User input cached per tab (Zustand consultationStore)
- Page refresh: Zustand persist restores cache

---

## 3. Company Compatibility

### POST /api/company/compatibility

**Purpose**: 기업명 입력 → 궁합 점수

**Request**:
```typescript
interface CompatibilityRequest {
  sajuResultId: string;     // 선행 CareerTiming 분석의 ID
  companyName: string;      // 기업명 (min 1, max 100)
}
```

**Response (Success)**:
```typescript
interface CompatibilityResponse {
  sajuResultId: string;
  companyName: string;      // Normalized version
  compatibilityScore: number;  // 0-100
  interpretation: string;   // 해석 텍스트 (max 1000)
  suggestions?: string[];   // 권고사항 배열
}
```

**Timeout**: 10 seconds  
**Authentication**: Optional  
**Retry Policy** (Q5): Network/timeout only

---

## 4. Analysis Record Save (logged-in only)

### POST /api/analysis/{analysisType}/save

**Purpose**: 분석 결과를 사용자 계정에 저장

**Path Parameters**:
- `analysisType`: 'career' | 'consultation' | 'company'

**Request**:
```typescript
interface AnalysisSaveRequest {
  sajuResultId: string;
  analysisData: any;  // Type depends on analysisType
  tags?: string[];
}
```

**Response (Success)**:
```typescript
interface AnalysisSaveResponse {
  recordId: string;      // 저장된 기록의 ID
  sajuResultId: string;  // Reference
  savedAt: string;       // ISO8601 timestamp
}
```

**Timeout**: 10 seconds  
**Authentication**: Required (JWT in Authorization header)  
**Authorization**: Only user's own records

---

## 5. My Page: Analysis Records

### POST /api/analysis/records?analysisType={type}&offset={n}&limit=20

**Purpose**: 사용자의 저장된 분석 기록 리스트 조회 (무한 스크롤)

**Query Parameters**:
- `analysisType`: 'CAREER' | 'CONSULTATION' | 'COMPANY' | 'ALL' (default)
- `offset`: 0-based offset (default 0)
- `limit`: 페이지당 결과 수 (default 20, max 100)

**Response (Success)**:
```typescript
interface AnalysisRecordsResponse {
  records: AnalysisRecord[];  // 기록 배열
  total: number;              // 전체 기록 수
  hasMore: boolean;           // 더 있는지 여부
  offset: number;
  limit: number;
}

interface AnalysisRecord {
  recordId: string;
  analysisType: string;
  birthDate: string;          // YYYY-MM-DD
  summary: string;            // 미리보기 텍스트
  createdAt: string;          // ISO8601
}
```

**Timeout**: 10 seconds  
**Authentication**: Required  
**Pagination**: Offset-based (infinite scroll friendly)

---

## 6. Analysis Record Detail

### POST /api/analysis/{recordId}

**Purpose**: 저장된 분석 기록의 상세 데이터 조회

**Path Parameters**:
- `recordId`: UUID of the saved record

**Response (Success)**:
```typescript
interface AnalysisRecordDetailResponse {
  recordId: string;
  analysisType: 'CAREER' | 'CONSULTATION' | 'COMPANY';
  analysisData: any;      // Full analysis data (type-specific)
  createdAt: string;
  updatedAt?: string;
}
```

**Timeout**: 5 seconds (cached data)  
**Authentication**: Required  
**Caching**: 1-hour browser cache (304 Not Modified)

---

## 7. Analysis Record Delete

### DELETE /api/analysis/{recordId}

**Purpose**: 저장된 분석 기록 삭제

**Path Parameters**:
- `recordId`: UUID of the record to delete

**Response (Success)**:
```typescript
interface DeleteResponse {
  recordId: string;
  deletedAt: string;      // ISO8601 timestamp
}
```

**Timeout**: 10 seconds  
**Authentication**: Required  
**Authorization**: Only owner can delete

---

## 8. Feedback/Satisfaction Submit

### POST /api/feedback

**Purpose**: 분석에 대한 만족도 및 피드백 제출

**Request**:
```typescript
interface FeedbackRequest {
  analysisType: 'CAREER' | 'CONSULTATION' | 'COMPANY' | 'GENERAL';
  satisfactionScore: number;      // 1-5
  feedbackText?: string;          // max 500
  sajuResultId?: string;          // optional, for tracking
}
```

**Response (Success)**:
```typescript
interface FeedbackResponse {
  feedbackId: string;       // UUID
  submittedAt: string;      // ISO8601
}
```

**Timeout**: 5 seconds  
**Authentication**: Optional (anonymous OK)  
**Side Effects**: 
- Backend logs satisfaction metric
- Triggers notification to admin dashboard (if score <= 2)

---

## 9. OAuth Login Callback

### GET /api/auth/callback?code={code}&state={state}

**Purpose**: OAuth 인증 완료 후 콜백 처리

**Query Parameters**:
- `code`: OAuth authorization code
- `state`: CSRF prevention state token
- `provider`: 'KAKAO' | 'GOOGLE' (from URL path)

**Response (Success)**:
```typescript
interface LoginCallbackResponse {
  userId: string;
  accessToken: string;      // JWT
  expiresIn: number;        // seconds
  user: {
    userId: string;
    provider: string;
    email: string;
    nickname: string;
  }
}
```

**Side Effects**:
- HttpOnly Cookie set (accessToken)
- sessionStorage updated (token check)
- Redirect to `/` or referring page

**Timeout**: 10 seconds  
**Authentication**: None (callback handler)

---

## 10. Logout

### POST /api/auth/logout

**Purpose**: 사용자 로그아웃

**Request**: (empty body)

**Response (Success)**:
```typescript
{
  success: true;
  message: string;
}
```

**Side Effects**:
- HttpOnly Cookie cleared
- sessionStorage cleared
- Redirect to `/`

**Timeout**: 5 seconds  
**Authentication**: Required

---

## Global Error Codes

| Code | HTTP Status | Meaning | Frontend Action |
|------|-------------|---------|-----------------|
| INVALID_DATE_FORMAT | 400 | 날짜 형식 오류 | Show validation error |
| MISSING_REQUIRED_FIELD | 400 | 필수 필드 누락 | Highlight field |
| UNAUTHORIZED | 401 | 인증 필요 | Redirect to login |
| FORBIDDEN | 403 | 권한 없음 | Show error modal |
| NOT_FOUND | 404 | 리소스 없음 | Go back or home |
| INTERNAL_ERROR | 500 | 서버 오류 | Retry or contact support |
| SERVICE_UNAVAILABLE | 503 | 서버 점검 중 | Show maintenance message |
| TIMEOUT | 408 | 요청 시간초과 | Auto-retry (Q5) |
| NETWORK_ERROR | (N/A) | 네트워크 오류 | Auto-retry (Q5) |

---

## Request/Response Wrapping

All responses wrapped in `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    requestId: string;  // for debugging
  } | null;
  timestamp: number;  // Unix milliseconds
}
```

---

## Authentication

### HttpOnly Cookie

- Name: `accessToken` (backend determines)
- Sent automatically by browser on each request
- Secure flag enabled (HTTPS only)
- SameSite: Strict (CSRF protection)

### Authorization Header (optional for frontend use)

```
Authorization: Bearer {accessToken}
```

Frontend retrieves from sessionStorage (if needed for debugging).

---

## Retry Policy (Q5)

Applied only to timeout and network errors:

| Attempt | Delay | Condition |
|---------|-------|-----------|
| 1st | 0ms | Immediate |
| 2nd | 1000ms | Timeout or network only |
| 3rd | 2000ms | Timeout or network only |
| 4th | 4000ms | Timeout or network only |

**NOT retried**: 
- 400, 401, 403, 404, 500 (API errors)
- Invalid request data

---

## Rate Limiting

- Per-user: 100 requests/minute
- Per-IP: 1000 requests/minute
- Burst: 10 requests/second

Frontend doesn't need to handle (backend enforces). If rate limited (429), show user: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."

---

## Testing Contracts

All contracts tested via:
1. **Unit Tests**: Zod schema validation
2. **Integration Tests**: MSW mock endpoints
3. **E2E Tests**: Real API endpoints (staging environment)

MSW handlers configured in `lib/mocks/handlers.ts` for each contract.
