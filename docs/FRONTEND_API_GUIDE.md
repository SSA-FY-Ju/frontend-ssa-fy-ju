# SSAju 프론트엔드 API 문서

> **⚠️ 주의**: 이 문서는 프론트엔드 팀 내부용 가이드이며, Git에 커밋되지 않습니다.

**마지막 업데이트**: 2026-05-04  
**Backend Version**: Java 21 / Spring Boot 4.0.5  
**API Version**: v1.0 (Phase 1)

---

## 📋 목차

1. [개요](#개요)
2. [API 기본 정보](#api-기본-정보)
3. [API 엔드포인트](#api-엔드포인트)
   - [1. 관운 분석 API](#1-관운-분석-api)
   - [2. AI 커리어 컨설팅 API](#2-ai-커리어-컨설팅-api)
   - [3. 기업 궁합 분석 API](#3-기업-궁합-분석-api)
   - [4. 만족도 피드백 API](#4-만족도-피드백-api)
4. [공통 응답 형식](#공통-응답-형식)
5. [에러 처리](#에러-처리)
6. [TypeScript 타입 정의](#typescript-타입-정의)
7. [예제 코드](#예제-코드)

---

## 개요

SSAju는 사주 명리학을 기반으로 취업 준비생에게 4가지 맞춤형 서비스를 제공합니다:

| API | 기능 | 입력 | 출력 |
|-----|------|------|------|
| **Career Timing** | 관운 기반 채용 시기 분석 | 생년월일, 태어난 시간 | H1/H2 예측, 신뢰도 점수, 분석 근거 |
| **Consultation** | AI 기반 커리어 컨설팅 | 생년월일, 태어난 시간 | 19개 필드의 상세 AI 분석 + 사주 프로필 |
| **Compatibility** | 기업/직무 궁합 분석 | 사용자 생년월일 + 기업 설립일 | 궁합 점수, 직무별 매칭도, 월별 운세 |
| **Feedback** | 만족도 피드백 수집 | SajuResult ID + 만족도 + 의견 | 피드백 저장 확인 |

---

## API 기본 정보

### 기본 설정

```javascript
const API_BASE_URL = 'http://localhost:8080/api'; // 로컬 개발
// 또는 프로덕션: https://api.ssaju.com/api

// CORS 설정 (완전 오픈 - 로컬 개발용)
// 모든 출처(origin)에서 요청 가능
// 모든 메서드(GET, POST, PUT, DELETE, OPTIONS, PATCH) 지원
// 모든 헤더 허용
// 자격증명(credentials) 포함 가능
```

### 공통 요청 헤더

```http
Content-Type: application/json
Accept: application/json
```

### 공통 응답 형식

모든 API 응답은 다음 형식을 따릅니다:

```json
{
  "success": true,           // 요청 성공 여부
  "data": { /* ... */ },     // 실제 응답 데이터 (실패 시 null)
  "error": null,             // 에러 정보 (실패 시에만 포함)
  "timestamp": 1712700000000 // 밀리초 단위 타임스탬프
}
```

---

## API 엔드포인트

### 1. 관운 분석 API

**직업적 성공 시기(H1 상반기 / H2 하반기)를 분석하는 API**

#### 요청

```http
POST /api/career/timing
Content-Type: application/json
```

**요청 본문**:
```json
{
  "birthDate": "1990-10-10",  // YYYY-MM-DD 형식, 필수
  "birthTime": "14:30"        // HH:mm 형식 (24시간), 필수
}
```

**필드 설명**:
- `birthDate` (LocalDate, 필수): 사용자의 생년월일
  - 형식: `YYYY-MM-DD` (예: `2000-01-15`)
  - 범위: 1900-01-01 ~ 오늘 날짜
  - 과거 날짜만 허용
  
- `birthTime` (LocalTime, 필수): 사용자의 태어난 시간
  - 형식: `HH:mm` (24시간 기준, 예: `14:30`, `09:00`)
  - 범위: `00:00` ~ `23:59`
  - **매우 중요**: 정확한 사주 분석을 위해 반드시 포함해야 함
  - 미상인 경우: 정오(12:00)로 입력 권장

#### 응답

**성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "favoredPeriod": "H1",           // "H1" (상반기) 또는 "H2" (하반기)
    "confidenceScore": 75,           // 0-100 사이의 신뢰도 점수
    "reasoning": "정관이 강하고 현재 대운이 상반기와 궁합하여 상반기에 좋은 기회가 많을 것 같습니다. 특히 3월-5월이 최고조입니다."
  },
  "error": null,
  "timestamp": 1712700000000
}
```

**응답 필드**:
- `favoredPeriod` (String): 채용 운이 좋은 시기
  - `"H1"`: 상반기(1월-6월) 채용에 유리
  - `"H2"`: 하반기(7월-12월) 채용에 유리
  
- `confidenceScore` (Integer, 0-100): 분석 신뢰도
  - 75 이상: 높은 신뢰도, 추천 시기로 강조 가능
  - 50-75: 중간 신뢰도
  - 50 미만: 낮은 신뢰도, 데이터 부족 가능성
  
- `reasoning` (String): 분석 근거 설명
  - 사주의 정관/편관 기운 강도
  - 오행 분포 상태
  - 현재 대운 영향도
  - 월별 권장 사항

#### 에러 응답

**400 Bad Request** - 잘못된 입력:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "Birth date must be in YYYY-MM-DD format",
    "requestId": "req-12345-abc"
  },
  "timestamp": 1712700000000
}
```

**503 Service Unavailable** - FastAPI 타임아웃:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FASTAPI_TIMEOUT",
    "message": "Failed to fetch saju data after retries. Please try again later.",
    "requestId": "req-12345-abc"
  },
  "timestamp": 1712700000000
}
```

---

### 2. AI 커리어 컨설팅 API

**OpenAI를 활용한 상세 커리어 컨설팅 API (19개 필드)**

#### 요청

```http
POST /api/career/consultation
Content-Type: application/json
```

**요청 본문**:
```json
{
  "birthDate": "1990-10-10",     // YYYY-MM-DD, 필수
  "birthTime": "14:30"           // HH:mm, 필수
}
```

**요청 필드**:
- `birthDate` (LocalDate, 필수): 생년월일 (YYYY-MM-DD)
- `birthTime` (LocalTime, 필수): 태어난 시간 (HH:mm)

**중요 사항**:
- 이 API는 **1-call design**으로 구현됨
- 모든 계산(십신, 지장간, 관운, AI 분석)이 백엔드에서 자동으로 수행됨
- 프론트엔드는 생년월일과 태어난 시간만 제공하면 됨
- 응답 시간: 약 15-20초 (OpenAI API 호출 포함)

#### 응답

**성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    // 기본 AI 조언 (3개 필드)
    "industries": [
      {
        "name": "금융/핀테크",
        "reason": "오행 金 강세로 재무 관련 산업 적성",
        "recommendedRoles": ["재무분석가", "리스크 관리자", "핀테크 개발자"]
      },
      {
        "name": "IT/소프트웨어",
        "reason": "오행 水 분포로 논리력 강함",
        "recommendedRoles": ["시스템 설계자", "데이터 엔지니어", "백엔드 개발자"]
      }
    ],
    "interviewTips": [
      "일관성 있는 자기소개 준비 (정관 특성)",
      "데이터 기반 성과 사례 강조",
      "팀 협력 능력 어필"
    ],
    "strengths": [
      "분석력과 논리성",
      "책임감 있는 업무 추진",
      "원칙 준수"
    ],

    // 관운 분석 (3개 필드)
    "favoredPeriod": "H2",
    "confidenceScore": 85,
    "reasoning": "정관 기운과 오행 균형이 안정적이어서 신뢰도 높음",

    // 사주 베이스 데이터 (1개 필드 그룹, 내부 6개 필드)
    "sajuProfile": {
      "dayMaster": "丙",
      "dayMasterDescription": "리더십과 추진력 강함, 창의적 사고",
      "fiveElements": {"木": 2, "火": 3, "土": 1, "金": 2, "水": 2},
      "fiveElementsAnalysis": "火가 과도하면 성급할 수 있음. 水 보충 필요",
      "tenGodDistribution": {"正官": 1, "偏官": 1, "正財": 2, "偏財": 1},
      "keyTenGods": ["正官", "正財"]
    },

    // OpenAI 분석 결과 (12개 필드)
    "cautions": [
      "상반기 급격한 결정 지양",
      "인간관계 신중함 필요"
    ],
    "wealthStyle": {
      "incomeSource": "정규직 및 부업으로 다원화된 수입 구조",
      "financialAdvice": "안정적 자산 운용. 장기 투자에 강함",
      "investmentTendency": "보수적이나 기회 발굴에 민첩",
      "additionalIncome": "전문성을 활용한 자문료 수익 가능"
    },
    "longTermRoadmap": {
      "phase0to2years": {
        "goal": "기본 역량 확립",
        "focus": "업무 습숙과 신뢰 구축",
        "action": "주요 프로젝트 적극 참여"
      },
      "phase3to5years": {
        "goal": "리더십 개발",
        "focus": "팀 관리 경험 축적",
        "action": "중간 관리자 역할 수행"
      },
      "ultimateGoal": "최고경영진(Executive) 진출",
      "goalDescription": "35세까지 임원 반열 진입 가능성 높음"
    },
    "personalBranding": {
      "suitColor": "진청색 또는 짙은 회색",
      "impression": "신뢰감 있고 전문적인 이미지",
      "hairAndMakeup": "정돈되고 깔끔한 스타일",
      "brandingKeyword": "정직함, 추진력, 신뢰",
      "taglineForResume": '\"신뢰로 시작하여 성과로 증명하는 리더\"'
    },
    "powerKeywords": {
      "keywords": [
        {
          "keyword": "조직력",
          "element": "金",
          "description": "체계적 구조화 능력",
          "usageExample": "\"팀의 조직력을 바탕으로 프로젝트 성공\"",
          "context": "면접, 자기소개서, 포트폴리오"
        },
        {
          "keyword": "추진력",
          "element": "火",
          "description": "목표 달성의 강한 의지",
          "usageExample": "\"추진력 있게 목표를 달성한 사례\"",
          "context": "행동 기반 면접, 성과 설명"
        }
      ],
      "selectionGuide": "최대 3개 키워드만 선택하여 일관성 있게 포장",
      "usageTips": [
        "자기소개서의 주제문에 1회 이상 포함",
        "면접 답변에서 구체적 사례와 함께 언급",
        "포트폴리오 요약에서 강조"
      ],
      "avoidanceTip": "너무 많은 키워드를 나열하면 신뢰성 저하"
    },
    "mentalCare": {
      "stressVulnerability": [
        "인간관계 스트레스 (갈등 처리에 민감)",
        "불안정한 환경에서 불안감 가중"
      ],
      "rechargeMethod": [
        "명상 및 산책 (자연 속에서 재충전)",
        "읽기 및 학습 (지적 활동으로 재정비)",
        "규칙적인 운동 (신체 리듬 안정화)"
      ],
      "mindsetMantra": "\"모든 것은 과정이다. 현재에 집중하자.\"",
      "emergencyTactic": "스트레스 상황 시 하루 쉬고 객관적 거리두기"
    },
    "environmentFit": {
      "workVibe": "체계적이고 안정적인 조직 문화",
      "companySize": "중견기업 이상 (500명 이상)",
      "colleagueType": "전문성 높고 책임감 있는 동료",
      "conflictApproach": "대화와 원칙 기반 해결",
      "physicalEnv": "조용하고 집중할 수 있는 업무 공간",
      "culturalFit": "성과 중심, 투명한 평가 시스템"
    },
    "workStyle": {
      "preferredCompanyType": "대기업, 공기업, 금융사",
      "leadershipType": "계획 기반, 목표 중심의 리더",
      "decisionMaking": "데이터 분석 후 신중한 결정",
      "conflictResolution": "규칙과 원칙 우선, 공정한 처리"
    },
    "relationshipStrategy": {
      "socialStyle": "신뢰 기반의 깊은 인간관계",
      "networkingApproach": "의도적 네트워킹보다 자연스러운 관계 형성",
      "teamPosition": "중추 역할 담당자 (허브 역할)",
      "conflictResolution": "직접 대화와 명확한 의사소통",
      "careerNetworking": "동료로부터의 추천과 평판 중요"
    },
    "careerTimeline": {
      "year": 2026,
      "months": [
        {
          "month": 1,
          "score": 35,
          "type": "CAUTION",
          "advice": "안정적인 현 상황 유지, 급격한 변화 지양"
        },
        {
          "month": 3,
          "score": 95,
          "type": "LUCKY",
          "advice": "이 시기에 집중적으로 지원 권장"
        },
        {
          "month": 6,
          "score": 88,
          "type": "LUCKY",
          "advice": "중요 면접 일정 잡기 좋음"
        }
      ],
      "pivotPoints": [
        {"month": 3, "description": "첫 번째 기회의 창"},
        {"month": 9, "description": "재평가 및 전환점"}
      ],
      "warningMonths": [
        {"month": 1, "description": "조심"},
        {"month": 7, "description": "충돌 가능성"}
      ],
      "warningDescription": "특히 1월과 7월에 급격한 변화 피할 것"
    },

    "openaiModelVersion": "gpt-4-turbo"
  },
  "error": null,
  "timestamp": 1712700000000
}
```

**응답 필드 설명**:

| 필드 그룹 | 필드명 | 타입 | 설명 |
|---------|--------|------|------|
| **기본 AI 조언** | `industries` | Array | 추천 직종 (3-5개), 각각 name, reason, recommendedRoles 포함 |
| | `interviewTips` | Array | 면접 팁 (3-5개) |
| | `strengths` | Array | 강점 (3-5개) |
| **관운 분석** | `favoredPeriod` | String | "H1" 또는 "H2" |
| | `confidenceScore` | Number | 0-100 신뢰도 |
| | `reasoning` | String | 분석 근거 |
| **사주 프로필** | `sajuProfile.dayMaster` | String | 일주 천간 (예: 丙) |
| | `sajuProfile.dayMasterDescription` | String | 일주 성격 특성 |
| | `sajuProfile.fiveElements` | Object | 오행 분포 (木火土金水의 개수) |
| | `sajuProfile.fiveElementsAnalysis` | String | 오행 분석 |
| | `sajuProfile.tenGodDistribution` | Object | 십신 분포 (正官, 偏官, 正財 등) |
| | `sajuProfile.keyTenGods` | Array | 핵심 십신 |
| **OpenAI 분석** | `cautions` | Array | 주의 사항 |
| | `wealthStyle` | Object | 재무 스타일 |
| | `longTermRoadmap` | Object | 경력 로드맵 (0-2년, 3-5년, 최종 목표) |
| | `personalBranding` | Object | 개인 브랜딩 가이드 |
| | `powerKeywords` | Object | 키워드 및 활용법 |
| | `mentalCare` | Object | 정신 관리 가이드 |
| | `environmentFit` | Object | 직장 환경 적합성 |
| | `workStyle` | Object | 일 방식 선호도 |
| | `relationshipStrategy` | Object | 인간관계 전략 |
| | `careerTimeline` | Object | 월별 운세 및 주요 시점 |

#### 에러 응답

**400 Bad Request** - 잘못된 사주 데이터:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_SAJU_DATA",
    "message": "Saju data must include 4 heavenly stems and 4 earthly branches",
    "requestId": "req-12345-abc"
  },
  "timestamp": 1712700000000
}
```

**504 Gateway Timeout** - OpenAI API 타임아웃:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "OPENAI_API_TIMEOUT",
    "message": "OpenAI API request timed out. Please try again.",
    "requestId": "req-12345-abc"
  },
  "timestamp": 1712700000000
}
```

---

### 3. 기업 궁합 분석 API

**특정 기업/직무와의 궁합을 분석하는 API**

#### 요청

```http
POST /api/company/compatibility
Content-Type: application/json
```

**요청 본문**:
```json
{
  "birthDate": "1990-10-10",              // 사용자 생년월일, 필수
  "birthTime": "14:30",                   // 사용자 태어난 시간 (HH:mm), 필수
  "companyName": "Samsung Electronics",   // 기업명, 권장 (공공데이터 API 조회용)
  "companyFoundingDate": "1938-01-13",   // 선택사항, 조회 실패 시 사용자 입력
  "companyFoundingTime": "12:00"         // 선택사항, 미상 시 기본값 12:00
}
```

**요청 필드 설명**:
- `birthDate` (LocalDate, 필수): YYYY-MM-DD 형식
- `birthTime` (LocalTime, 필수): HH:mm 형식
- `companyName` (String): 기업명 (공공데이터 API로 자동 조회 시도)
- `companyFoundingDate` (LocalDate, 선택): YYYY-MM-DD (자동 조회 실패 시)
- `companyFoundingTime` (LocalTime, 선택): HH:mm (미상 시 12:00 자동 설정)

#### 응답

**성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    // 핵심 점수
    "compatibilityScore": 78,                    // 0-100
    "confidenceLevel": "HIGH",                   // LOW, MEDIUM, HIGH

    // 분석 근거
    "reasoning": "사용자의 정관(正官) 기운과 기업 설립일의 오행(金/水)이 강한 상호보완적 시너지를 냅니다.",

    // 점수 투명성 - 각 요소별 점수 분석
    "scoreBreakdown": {
      "tenGodCompatibility": 82,                 // 십신 기반 궁합
      "fiveElementsMatch": 75,                   // 오행 기반 궁합
      "hiddenStemAlignment": 76,                 // 지장간 기반 궁합
      "leadershipFit": 80                        // 리더십 매칭도
    },

    // 직무별 맞춤 정보 (배열)
    "roleCompatibility": [
      {
        "roleName": "제조 관리자",
        "score": 85,
        "reason": "조직력 강점과 정확히 매치",
        "recommendation": "즉시 지원 권장"
      },
      {
        "roleName": "공급망 담당자",
        "score": 78,
        "reason": "체계성 우수하나 유연성 보완 필요",
        "recommendation": "관련 경험 어필 시 유리"
      },
      {
        "roleName": "R&D 리더",
        "score": 72,
        "reason": "기술력은 있으나 창의적 발산보다 관리형 리더십에 가까움",
        "recommendation": "실무 경력 축적 후 매니징 롤 지원 추천"
      }
    ],

    // 핵심 강점
    "synergies": [
      "정관 기운이 회사의 체계적 조직 문화와 부합",
      "오행 金 분포가 제조 및 IT 산업 특성과 일치",
      "지장간 분석 결과 장기 근속 시 안정성 매우 높음"
    ],

    // 주의 사항
    "cautions": [
      "회사의 급격한 조직 개편 시 적응 스트레스 예상",
      "상반기보다 하반기에 뚜렷한 성과 기대"
    ],

    // 월별 운세 (핵심 달 5개월)
    "monthlyForecast": [
      {
        "month": 1,
        "score": 35,
        "type": "CAUTION",
        "label": "주의",
        "advice": "신입 채용 지원 자제",
        "details": "기운 전환기, 현재 역량 강화에 집중할 시기"
      },
      {
        "month": 3,
        "score": 95,
        "type": "LUCKY",
        "label": "최고조",
        "advice": "이 시기에 집중적으로 지원 권장",
        "details": "정관 기운이 정점, 면접관의 평가가 매우 호의적"
      },
      {
        "month": 6,
        "score": 88,
        "type": "LUCKY",
        "label": "매우 높음",
        "advice": "중요 면접 일정 잡기 좋음",
        "details": "오행의 균형이 가장 잘 맞는 시기"
      }
    ],

    // 경력 발전 마일스톤
    "careerMilestones": {
      "immediate": {
        "period": "1-3개월",
        "action": "집중 채용 기간 대비 지원",
        "expectedOutcome": "서류 및 1차 면접 통과 가능성 80% 이상"
      },
      "shortTerm": {
        "period": "3-12개월",
        "action": "신규 팀 적응 및 업무 프로세스 파악",
        "expectedOutcome": "조기 적응 및 팀 내 핵심 실무자로 신뢰 구축"
      },
      "mediumTerm": {
        "period": "1-3년",
        "action": "주요 프로젝트 주도 및 성과 창출",
        "expectedOutcome": "빠른 인사 고과 인정 및 조기 진급 기회 확보"
      }
    }
  },
  "error": null,
  "timestamp": 1712700000000
}
```

#### 에러 응답

**404 Not Found** - 기업 정보 미발견:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "COMPANY_NOT_FOUND",
    "message": "Company not found. Please provide founding date.",
    "requestId": "req-12345-abc"
  },
  "timestamp": 1712700000000
}
```

**400 Bad Request** - 필수 정보 부족:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Either provide companyName or companyFoundingDate",
    "requestId": "req-12345-abc"
  },
  "timestamp": 1712700000000
}
```

---

### 4. 만족도 피드백 API

**사용자 만족도 피드백을 수집하는 API**

#### 요청

```http
POST /api/feedback/satisfaction
Content-Type: application/json
```

**요청 본문**:
```json
{
  "sajuResultId": 123,                    // SajuResult ID, 필수
  "feedbackType": "CAREER_TIMING",        // CAREER_TIMING / CONSULTATION / COMPATIBILITY, 필수
  "satisfactionStatus": "SATISFIED",      // SATISFIED / DISSATISFIED, 필수
  "feedbackContent": "분석 결과가 매우 정확했습니다. 다만 면접 팁이 좀 더 자세하면 좋을 것 같습니다."  // 선택, 최대 500자
}
```

**요청 필드 설명**:
- `sajuResultId` (Long, 필수): 피드백 대상이 되는 SajuResult ID
- `feedbackType` (String, 필수): 피드백 유형
  - `"CAREER_TIMING"`: 관운 분석에 대한 피드백
  - `"CONSULTATION"`: AI 커리어 컨설팅에 대한 피드백
  - `"COMPATIBILITY"`: 기업 궁합 분석에 대한 피드백
- `satisfactionStatus` (String, 필수): 만족도
  - `"SATISFIED"`: 만족함
  - `"DISSATISFIED"`: 만족하지 않음
- `feedbackContent` (String, 선택): 상세 의견
  - 최대 500자
  - HTML/스크립트는 자동으로 이스케이프 처리됨

#### 응답

**성공 응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "feedbackId": 456,
    "createdAt": 1712700000000,
    "feedbackContent": "분석 결과가 매우 정확했습니다. 다만 면접 팁이 좀 더 자세하면 좋을 것 같습니다."
  },
  "error": null,
  "timestamp": 1712700000000
}
```

**응답 필드 설명**:
- `feedbackId` (Long): 생성된 피드백의 고유 ID
- `createdAt` (Long): 생성 시간 (밀리초 단위 UNIX 타임스탬프)
- `feedbackContent` (String): 저장된 피드백 내용 (입력된 경우만)

#### 에러 응답

**400 Bad Request** - 잘못된 요청:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "feedbackType must be one of: CAREER_TIMING, CONSULTATION, COMPATIBILITY",
    "requestId": "req-12345-abc"
  },
  "timestamp": 1712700000000
}
```

**404 Not Found** - SajuResult 미발견:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "SajuResult with id 123 not found",
    "requestId": "req-12345-abc"
  },
  "timestamp": 1712700000000
}
```

---

## 공통 응답 형식

### 성공 응답 구조

```typescript
interface ApiResponse<T> {
  success: true;              // 항상 true
  data: T;                    // 실제 응답 데이터
  error: null;               // 항상 null
  timestamp: number;          // 밀리초 단위 UNIX 타임스탬프
}
```

### 실패 응답 구조

```typescript
interface ErrorResponse {
  success: false;            // 항상 false
  data: null;               // 항상 null
  error: {
    code: string;           // 에러 코드 (예: "INVALID_DATE_FORMAT")
    message: string;        // 사용자 친화적 에러 메시지
    requestId: string;      // 디버깅용 요청 ID (예: "req-12345-abc")
  };
  timestamp: number;         // 밀리초 단위 UNIX 타임스탬프
}
```

---

## 에러 처리

### 공통 에러 코드

| 코드 | HTTP | 설명 | 대응 방법 |
|-----|------|------|---------|
| `INVALID_DATE_FORMAT` | 400 | 날짜 형식 오류 (YYYY-MM-DD 필요) | 입력 형식 확인, 사용자에게 재입력 요청 |
| `INVALID_TIME_FORMAT` | 400 | 시간 형식 오류 (HH:mm 필요) | 입력 형식 확인, 사용자에게 재입력 요청 |
| `INVALID_SAJU_DATA` | 400 | 사주 데이터 유효성 오류 | 입력된 생년월일/시간이 올바른지 확인 |
| `INVALID_REQUEST` | 400 | 요청 본문 누락 또는 형식 오류 | 요청 필드 확인, API 문서 참조 |
| `RESOURCE_NOT_FOUND` | 404 | 요청한 리소스 미발견 | 해당 ID/정보가 올바른지 확인 |
| `COMPANY_NOT_FOUND` | 404 | 기업 정보 조회 실패 | 회사 설립일 수동 입력 옵션 제공 |
| `FASTAPI_TIMEOUT` | 503 | FastAPI (사주 계산) 타임아웃 | 3-5초 후 재시도, 이후에도 실패 시 오류 메시지 표시 |
| `OPENAI_API_TIMEOUT` | 504 | OpenAI API 타임아웃 | 10-15초 후 재시도, 계속 실패 시 네트워크 상태 확인 |
| `EXTERNAL_API_ERROR` | 503 | 외부 API 일반 오류 | 나중에 재시도하도록 사용자에게 안내 |

### 프론트엔드 에러 처리 전략

```javascript
// 예제: API 호출 시 에러 처리
async function callCareerTimingAPI(birthDate, birthTime) {
  try {
    const response = await fetch(`${API_BASE_URL}/career/timing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate, birthTime })
    });

    const result = await response.json();

    if (!result.success) {
      // 에러 처리
      const errorCode = result.error.code;
      const errorMsg = result.error.message;
      
      switch (errorCode) {
        case 'INVALID_DATE_FORMAT':
          showAlert('생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
          break;
        case 'FASTAPI_TIMEOUT':
          showAlert('사주 데이터 조회 중 시간초과. 잠시 후 다시 시도해주세요.');
          // 3초 후 자동 재시도 로직
          setTimeout(() => callCareerTimingAPI(birthDate, birthTime), 3000);
          break;
        default:
          showAlert(`오류: ${errorMsg}`);
      }
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Network error:', error);
    showAlert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
  }
}
```

---

## TypeScript 타입 정의

```typescript
// 공통 타입
type LocalDate = string; // YYYY-MM-DD
type LocalTime = string; // HH:mm

// 1. Career Timing
interface CareerTimingRequest {
  birthDate: LocalDate;
  birthTime: LocalTime;
}

interface CareerTimingResponse {
  favoredPeriod: 'H1' | 'H2';
  confidenceScore: number; // 0-100
  reasoning: string;
}

// 2. Career Consultation
interface ConsultationRequest {
  birthDate: LocalDate;
  birthTime: LocalTime;
}

interface IndustryRecommendation {
  name: string;
  reason: string;
  recommendedRoles: string[];
}

interface SajuProfile {
  dayMaster: string;
  dayMasterDescription: string;
  fiveElements: Record<string, number>;
  fiveElementsAnalysis: string;
  tenGodDistribution: Record<string, number>;
  keyTenGods: string[];
}

interface WealthStyle {
  incomeSource: string;
  financialAdvice: string;
  investmentTendency: string;
  additionalIncome: string;
}

interface PhaseAdvice {
  goal: string;
  focus: string;
  action: string;
}

interface LongTermRoadmap {
  phase0to2years: PhaseAdvice;
  phase3to5years: PhaseAdvice;
  ultimateGoal: string;
  goalDescription: string;
}

interface PersonalBranding {
  suitColor: string;
  impression: string;
  hairAndMakeup: string;
  brandingKeyword: string;
  taglineForResume: string;
}

interface PowerKeyword {
  keyword: string;
  element: string;
  description: string;
  usageExample: string;
  context: string;
}

interface PowerKeywords {
  keywords: PowerKeyword[];
  selectionGuide: string;
  usageTips: string[];
  avoidanceTip: string;
}

interface MentalCare {
  stressVulnerability: string[];
  rechargeMethod: string[];
  mindsetMantra: string;
  emergencyTactic: string;
}

interface EnvironmentFit {
  workVibe: string;
  companySize: string;
  colleagueType: string;
  conflictApproach: string;
  physicalEnv: string;
  culturalFit: string;
}

interface WorkStyle {
  preferredCompanyType: string;
  leadershipType: string;
  decisionMaking: string;
  conflictResolution: string;
}

interface RelationshipStrategy {
  socialStyle: string;
  networkingApproach: string;
  teamPosition: string;
  conflictResolution: string;
  careerNetworking: string;
}

interface MonthlyAdvice {
  month: number;
  score: number;
  type: 'CAUTION' | 'NORMAL' | 'LUCKY';
  advice: string;
}

interface PivotPoint {
  month: number;
  description: string;
}

interface CareerTimeline {
  year: number;
  months: MonthlyAdvice[];
  pivotPoints: PivotPoint[];
  warningMonths: Array<{ month: number; description: string }>;
  warningDescription: string;
}

interface ConsultationResponse {
  industries: IndustryRecommendation[];
  interviewTips: string[];
  strengths: string[];
  favoredPeriod: 'H1' | 'H2';
  confidenceScore: number;
  reasoning: string;
  sajuProfile: SajuProfile;
  cautions: string[];
  wealthStyle: WealthStyle;
  longTermRoadmap: LongTermRoadmap;
  personalBranding: PersonalBranding;
  powerKeywords: PowerKeywords;
  mentalCare: MentalCare;
  environmentFit: EnvironmentFit;
  workStyle: WorkStyle;
  relationshipStrategy: RelationshipStrategy;
  careerTimeline: CareerTimeline;
  openaiModelVersion: string;
}

// 3. Company Compatibility
interface CompatibilityRequest {
  birthDate: LocalDate;
  birthTime: LocalTime;
  companyName?: string;
  companyFoundingDate?: LocalDate;
  companyFoundingTime?: LocalTime;
}

interface RoleCompatibility {
  roleName: string;
  score: number;
  reason: string;
  recommendation: string;
}

interface ScoreBreakdown {
  tenGodCompatibility: number;
  fiveElementsMatch: number;
  hiddenStemAlignment: number;
  leadershipFit: number;
}

interface MonthlyForecast {
  month: number;
  score: number;
  type: 'CAUTION' | 'NORMAL' | 'LUCKY';
  label: string;
  advice: string;
  details: string;
}

interface Milestone {
  period: string;
  action: string;
  expectedOutcome: string;
}

interface CareerMilestones {
  immediate: Milestone;
  shortTerm: Milestone;
  mediumTerm: Milestone;
}

interface CompatibilityResponse {
  compatibilityScore: number;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
  scoreBreakdown: ScoreBreakdown;
  roleCompatibility: RoleCompatibility[];
  synergies: string[];
  cautions: string[];
  monthlyForecast: MonthlyForecast[];
  careerMilestones: CareerMilestones;
}

// 4. Feedback
interface SatisfactionFeedbackRequest {
  sajuResultId: number;
  feedbackType: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';
  satisfactionStatus: 'SATISFIED' | 'DISSATISFIED';
  feedbackContent?: string; // max 500 chars
}

interface SatisfactionFeedbackResponse {
  feedbackId: number;
  createdAt: number; // milliseconds
  feedbackContent?: string;
}

// 공통 응답 래퍼
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorInfo | null;
  timestamp: number;
}

interface ErrorInfo {
  code: string;
  message: string;
  requestId: string;
}
```

---

## 예제 코드

### JavaScript/TypeScript 예제

#### 1. 관운 분석 요청

```typescript
async function analyzeCareerTiming() {
  const request = {
    birthDate: '1990-10-10',
    birthTime: '14:30'
  };

  const response = await fetch('http://localhost:8080/api/career/timing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  const result: ApiResponse<CareerTimingResponse> = await response.json();
  
  if (result.success) {
    console.log(`채용 운 좋은 시기: ${result.data.favoredPeriod}`);
    console.log(`신뢰도: ${result.data.confidenceScore}%`);
    console.log(`분석: ${result.data.reasoning}`);
  } else {
    console.error(`에러 [${result.error.code}]: ${result.error.message}`);
  }
}
```

#### 2. AI 커리어 컨설팅 요청

```typescript
async function getCareerConsultation() {
  const request = {
    birthDate: '1990-10-10',
    birthTime: '14:30'
  };

  try {
    const response = await fetch('http://localhost:8080/api/career/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const result: ApiResponse<ConsultationResponse> = await response.json();

    if (result.success) {
      const consultation = result.data;
      
      // 추천 산업
      console.log('추천 산업:');
      consultation.industries.forEach(industry => {
        console.log(`- ${industry.name}: ${industry.reason}`);
      });

      // 면접 팁
      console.log('면접 팁:');
      consultation.interviewTips.forEach(tip => {
        console.log(`- ${tip}`);
      });

      // 월별 운세
      console.log('행운의 달:');
      consultation.careerTimeline.months
        .filter(m => m.type === 'LUCKY')
        .forEach(m => {
          console.log(`- ${m.month}월: ${m.advice}`);
        });
    } else {
      console.error(`에러: ${result.error.message}`);
    }
  } catch (error) {
    console.error('요청 실패:', error);
  }
}
```

#### 3. 기업 궁합 분석 요청

```typescript
async function analyzeCompanyCompatibility() {
  const request = {
    birthDate: '1990-10-10',
    birthTime: '14:30',
    companyName: 'Samsung Electronics'
    // companyFoundingDate와 companyFoundingTime은 선택 (자동 조회됨)
  };

  const response = await fetch('http://localhost:8080/api/company/compatibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  const result: ApiResponse<CompatibilityResponse> = await response.json();

  if (result.success) {
    const compat = result.data;
    
    console.log(`종합 궁합 점수: ${compat.compatibilityScore}/100`);
    console.log(`신뢰도: ${compat.confidenceLevel}`);
    
    // 직무별 매칭도
    console.log('직무별 매칭도:');
    compat.roleCompatibility.forEach(role => {
      console.log(`- ${role.roleName}: ${role.score}점 (${role.recommendation})`);
    });

    // 행운의 달 (상위 2개)
    const luckMonths = compat.monthlyForecast
      .filter(m => m.type === 'LUCKY')
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    
    console.log('행운의 달:');
    luckMonths.forEach(m => {
      console.log(`- ${m.month}월: ${m.advice}`);
    });
  }
}
```

#### 4. 만족도 피드백 제출

```typescript
async function submitFeedback(
  sajuResultId: number,
  feedbackType: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY',
  satisfaction: 'SATISFIED' | 'DISSATISFIED',
  content?: string
) {
  const request: SatisfactionFeedbackRequest = {
    sajuResultId,
    feedbackType,
    satisfactionStatus: satisfaction,
    feedbackContent: content
  };

  const response = await fetch('http://localhost:8080/api/feedback/satisfaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  const result: ApiResponse<SatisfactionFeedbackResponse> = await response.json();

  if (result.success) {
    console.log('피드백이 저장되었습니다.');
    console.log(`피드백 ID: ${result.data.feedbackId}`);
  } else {
    console.error(`저장 실패: ${result.error.message}`);
  }
}
```

### React Hook 예제

```typescript
import { useState } from 'react';

function useCareerAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAPI = async <T,>(
    endpoint: string,
    data: unknown
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        setError(result.error?.message || '알 수 없는 오류');
        return null;
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : '네트워크 오류';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, callAPI };
}

// 사용 예
function CareerTimingComponent() {
  const { loading, error, callAPI } = useCareerAPI();

  const handleAnalyze = async () => {
    const result = await callAPI<CareerTimingResponse>('/career/timing', {
      birthDate: '1990-10-10',
      birthTime: '14:30'
    });

    if (result) {
      console.log(`채용 운: ${result.favoredPeriod}`);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? '분석 중...' : '분석'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## 주의사항

1. **응답 시간 차이**:
   - Career Timing: 약 3-5초
   - Consultation: 약 15-20초 (OpenAI API 호출)
   - Compatibility: 약 5-8초
   - Feedback: 약 1-2초

2. **birthTime의 중요성**:
   - 정확한 사주 분석을 위해 태어난 시간이 필수
   - 미상인 경우: 정오(12:00) 입력 권장
   - 1시간만 달라도 십신 분포가 변할 수 있음

3. **에러 재시도**:
   - FastAPI/OpenAI 타임아웃 시 3-5초 후 자동 재시도 권장
   - 3회 재시도 후에도 실패 시 사용자에게 알림

4. **CORS 설정**:
   - 로컬 개발: 모든 출처 허용 (localhost:3000, localhost:5173 등)
   - 프로덕션: 도메인 제한 필요 (별도 설정)

5. **Date/Time 형식**:
   - 반드시 `YYYY-MM-DD` / `HH:mm` 형식 사용
   - 자동 변환 불가, 정확한 입력 필수
   - 타임존: 모든 시간은 한국 시간(KST) 기준

---

**문의**: 백엔드 팀 (backend@ssaju.com)
