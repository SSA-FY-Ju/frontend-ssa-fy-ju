# SSAju 프론트엔드 UI/화면 구조 가이드

> **⚠️ 주의**: 이 문서는 프론트엔드 팀 내부용 가이드이며, Git에 커밋되지 않습니다.

**마지막 업데이트**: 2026-05-04  
**화면 구성**: 4개 메인 화면 + 피드백 모달

---

## 📋 목차

1. [화면 구조 개요](#화면-구조-개요)
2. [Screen 1: 관운 분석 (Career Timing)](#screen-1-관운-분석-career-timing)
3. [Screen 2: AI 커리어 컨설팅 (Consultation)](#screen-2-ai-커리어-컨설팅-consultation)
4. [Screen 3: 기업 궁합 분석 (Compatibility)](#screen-3-기업-궁합-분석-compatibility)
5. [Screen 4: 피드백 제출 (Feedback)](#screen-4-피드백-제출-feedback)
6. [공통 컴포넌트](#공통-컴포넌트)
7. [상태 관리 가이드](#상태-관리-가이드)

---

## 화면 구조 개요

### 네비게이션 플로우

```
┌─────────────────────────────────────────┐
│        SSAju 메인 페이지                 │
│  (생년월일/시간 입력 폼 또는 네비)       │
└────────────┬────────────────────────────┘
             │
    ┌────────┼────────┬──────────┐
    │        │        │          │
    ▼        ▼        ▼          ▼
┌─────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│관운 │ │컨설  │ │기업  │ │피드백    │
│분석 │ │팅    │ │궁합  │ │(모달)    │
└──┬──┘ └──┬───┘ └──┬───┘ └──────────┘
   │       │       │
   └───┬───┴───┬───┘
       │       │
   ┌───▼───────▼────────┐
   │ 피드백 제출 모달    │
   └────────────────────┘
```

---

## Screen 1: 관운 분석 (Career Timing)

**목적**: 사용자의 생년월일/시간을 입력받아 채용 운(H1/H2)을 분석

### 화면 레이아웃

```
┌────────────────────────────────────────────┐
│ SSAju - 관운 분석                          │
├────────────────────────────────────────────┤
│                                            │
│  생년월일과 태어난 시간을 입력하세요       │
│  (정확한 분석을 위해 필수입니다)           │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ 생년월일 (YYYY-MM-DD)               │  │
│  │ [예: 1990-10-10________________]    │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ 태어난 시간 (HH:mm)                  │  │
│  │ [예: 14:30_____________]            │  │
│  └──────────────────────────────────────┘  │
│                                            │
│                  [분석하기]               │
│                                            │
├─ 분석 결과 ────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ 채용 운: H1 (상반기)                │  │
│  │                                     │  │
│  │ 신뢰도: 75%                         │  │
│  │ ▓▓▓▓▓▓▓▓░░ (신뢰도 시각화)          │  │
│  │                                     │  │
│  │ 분석 근거:                           │  │
│  │ 정관이 강하고 현재 대운이 상반기와   │  │
│  │ 궁합하여 상반기에 좋은 기회가 많을  │  │
│  │ 것 같습니다. 특히 3월-5월이 최고조  │  │
│  │ 입니다.                             │  │
│  │                                     │  │
│  │ [이 결과에 대해 의견을 알려주세요▼] │  │
│  └──────────────────────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

### 입력 폼 (InputForm 컴포넌트)

```typescript
interface CareerTimingFormProps {
  onSubmit: (data: CareerTimingRequest) => void;
  isLoading: boolean;
  error?: string;
}

// 컴포넌트 구조
<div className="form-container">
  <label htmlFor="birthDate">생년월일</label>
  <input
    id="birthDate"
    type="date"
    placeholder="YYYY-MM-DD"
    value={formData.birthDate}
    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
  />
  
  <label htmlFor="birthTime">태어난 시간</label>
  <input
    id="birthTime"
    type="time"
    value={formData.birthTime}
    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
  />
  
  <button onClick={handleSubmit} disabled={isLoading}>
    {isLoading ? '분석 중...' : '분석하기'}
  </button>
  
  {error && <ErrorMessage message={error} />}
</div>
```

### 결과 표시 (ResultDisplay 컴포넌트)

```typescript
interface CareerTimingResultProps {
  data: CareerTimingResponse;
  onFeedback: () => void;
}

// 주요 표시 요소
- favoredPeriod: 큰 텍스트로 "H1" 또는 "H2" 강조 표시
- confidenceScore: 진행 바(progress bar)로 시각화 (0-100)
- reasoning: 텍스트 상자에 줄바꿈 보존하여 표시
- 하단 버튼: "피드백 제출" (클릭 시 피드백 모달 열기)
```

### 기술적 고려사항

```typescript
// 날짜 입력 유효성 검증
const validateBirthDate = (date: string): boolean => {
  const d = new Date(date);
  return d < new Date() && d.getFullYear() >= 1900;
};

// 시간 입력 유효성 검증
const validateBirthTime = (time: string): boolean => {
  return /^([0-1]\d|2[0-3]):[0-5]\d$/.test(time);
};

// API 호출 (3-5초 대기)
const handleAnalyze = async () => {
  setLoading(true);
  try {
    const result = await callAPI<CareerTimingResponse>(
      '/career/timing',
      { birthDate, birthTime }
    );
    setResult(result);
  } finally {
    setLoading(false);
  }
};
```

---

## Screen 2: AI 커리어 컨설팅 (Consultation)

**목적**: 생년월일/시간 기반 상세한 AI 커리어 컨설팅 제공 (19개 필드)

### 화면 레이아웃

```
┌─────────────────────────────────────────────┐
│ SSAju - AI 커리어 컨설팅                    │
├─────────────────────────────────────────────┤
│                                             │
│ [생년월일/시간 입력 폼 - InputForm]         │
│                                             │
├─ 분석 결과 (탭형 UI) ──────────────────────┤
│                                             │
│ [추천산업] [면접팁] [강점] [사주프로필]    │
│ [부의운] [경력로드맵] [브랜딩] [월별운세]  │
│                                             │
├─ 추천산업 탭 ────────────────────────────────┤
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 1. 금융/핀테크                       │   │
│ │    ├─ 이유: 오행 金 강세로 재무 ...  │   │
│ │    ├─ 추천 직무:                     │   │
│ │    │  • 재무분석가                   │   │
│ │    │  • 리스크 관리자                │   │
│ │    │  • 핀테크 개발자                │   │
│ │    └─ [상세 보기]                    │   │
│ │                                     │   │
│ │ 2. IT/소프트웨어                    │   │
│ │    ├─ 이유: 오행 水 분포로 논리력..  │   │
│ │    ├─ 추천 직무:                     │   │
│ │    │  • 시스템 설계자                │   │
│ │    │  • 데이터 엔지니어              │   │
│ │    │  • 백엔드 개발자                │   │
│ │    └─ [상세 보기]                    │   │
│ └──────────────────────────────────────┘   │
│                                             │
├─ 면접팁 탭 ─────────────────────────────────┤
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ • 일관성 있는 자기소개 준비 (정관 특성) │
│ │ • 데이터 기반 성과 사례 강조           │
│ │ • 팀 협력 능력 어필                    │
│ └──────────────────────────────────────┘   │
│                                             │
├─ 사주프로필 탭 ──────────────────────────────┤
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 일주(日主): 丙화                      │   │
│ │ 성격: 리더십과 추진력 강함, 창의적   │   │
│ │                                     │   │
│ │ 오행 분포:                           │   │
│ │ ◼ 木(2) ◼◼ 火(3) ◼ 土(1)           │   │
│ │ ◼◼ 金(2) ◼◼ 水(2)                  │   │
│ │                                     │   │
│ │ 오행 분석:                           │   │
│ │ 火가 과도하면 성급할 수 있음. 水 보충 필요 │
│ │                                     │   │
│ │ 십신 분포:                           │   │
│ │ 正官(1) 偏官(1) 正財(2) 偏財(1)      │   │
│ │                                     │   │
│ │ 핵심 십신: 正官, 正財                │   │
│ └──────────────────────────────────────┘   │
│                                             │
├─ 부의운 탭 ──────────────────────────────────┤
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 소득원: 정규직 및 부업으로 다원화   │   │
│ │                                     │   │
│ │ 재무 조언: 안정적 자산 운용.        │   │
│ │ 장기 투자에 강함                    │   │
│ │                                     │   │
│ │ 투자 성향: 보수적이나 기회 발굴   │   │
│ │ 에 민첩                             │   │
│ │                                     │   │
│ │ 추가 수입: 전문성을 활용한         │   │
│ │ 자문료 수익 가능                    │   │
│ └──────────────────────────────────────┘   │
│                                             │
├─ 경력로드맵 탭 ──────────────────────────────┤
│                                             │
│ 0-2년: 기본 역량 확립                       │
│ └─ 목표: 업무 습숙과 신뢰 구축             │
│ └─ 행동: 주요 프로젝트 적극 참여           │
│                                             │
│ 3-5년: 리더십 개발                          │
│ └─ 목표: 팀 관리 경험 축적                 │
│ └─ 행동: 중간 관리자 역할 수행             │
│                                             │
│ 최종목표: 최고경영진(Executive) 진출       │
│ └─ 35세까지 임원 반열 진입 가능성 높음     │
│                                             │
├─ 브랜딩 탁 ──────────────────────────────────┤
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 정장 색상: 진청색 또는 짙은 회색    │   │
│ │ 이미지: 신뢰감 있고 전문적          │   │
│ │ 헤어/메이크업: 정돈되고 깔끔한      │   │
│ │ 브랜딩 키워드: 정직함, 추진력, 신뢰│   │
│ │                                     │   │
│ │ 이력서 태그라인:                     │   │
│ │ "신뢰로 시작하여 성과로 증명하는    │   │
│ │  리더"                              │   │
│ │                                     │   │
│ │ 파워 키워드 (최대 3개 선택):       │   │
│ │ ☐ 조직력 (체계적 구조화 능력)      │   │
│ │ ☐ 추진력 (목표 달성의 강한 의지)    │   │
│ │ ☐ 신뢰감 (일관성 있는 업무 추진)    │   │
│ │                                     │   │
│ │ 활용법:                              │   │
│ │ • 자기소개서 주제문에 1회 이상      │   │
│ │ • 면접 답변에서 구체적 사례와 함께  │   │
│ │ • 포트폴리오 요약에서 강조          │   │
│ └──────────────────────────────────────┘   │
│                                             │
├─ 월별운세 탭 ────────────────────────────────┤
│                                             │
│ 행운의 달:                                  │
│ ┌────────────────────────────────────────┐ │
│ │ 3월 - 최고조 ★★★★★                  │ │
│ │ 점수: 95/100                           │ │
│ │ 조언: 이 시기에 집중적으로 지원 권장  │ │
│ │ 상세: 정관 기운이 정점, 면접관의      │ │
│ │ 평가가 매우 호의적                   │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ ┌────────────────────────────────────────┐ │
│ │ 6월 - 매우 높음 ★★★★☆               │ │
│ │ 점수: 88/100                           │ │
│ │ 조언: 중요 면접 일정 잡기 좋음        │ │
│ │ 상세: 오행의 균형이 가장 잘 맞는 시기│ │
│ └────────────────────────────────────────┘ │
│                                             │
│ 주의의 달:                                  │
│ ┌────────────────────────────────────────┐ │
│ │ 1월 - 주의 ⚠️                         │ │
│ │ 점수: 35/100                           │ │
│ │ 조언: 안정적인 현 상황 유지, 급격한  │ │
│ │ 변화 지양                             │ │
│ │ 상세: 기운 전환기, 현재 역량 강화에  │ │
│ │ 집중할 시기                           │ │
│ └────────────────────────────────────────┘ │
│                                             │
│          [이 분석에 대해 피드백하기]      │
│                                             │
└─────────────────────────────────────────────┘
```

### 주요 컴포넌트

```typescript
// 탭 네비게이션
interface TabNavigationProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// 산업 추천 카드
interface IndustryCardProps {
  industry: IndustryRecommendation;
}

// 사주 프로필 시각화
interface SajuProfileVisualizerProps {
  profile: SajuProfile;
}

// 월별 운세 달력
interface MonthlyTimelineProps {
  timeline: CareerTimeline;
}

// 경력 로드맵 타임라인
interface CareerTimelineVisualProps {
  roadmap: LongTermRoadmap;
}
```

### 기술적 고려사항

```typescript
// 탭 상태 관리
const [activeTab, setActiveTab] = useState<string>('industries');

// 응답 시간이 길어서 로딩 상태 표시
const [isLoading, setIsLoading] = useState(false);
const [consultationData, setConsultationData] = useState<ConsultationResponse | null>(null);

// 응답 데이터가 매우 복잡하므로 각 섹션별 컴포넌트로 분리
// - IndustriesTab: industries 배열 렌더링
// - InterviewTipsTab: interviewTips 배열 렌더링
// - SajuProfileTab: sajuProfile 객체 시각화
// - CareerTimelineTab: careerTimeline 데이터를 달력/타임라인으로 표시
```

---

## Screen 3: 기업 궁합 분석 (Compatibility)

**목적**: 사용자와 특정 기업의 궁합 분석, 직무별 매칭도 제시

### 화면 레이아웃

```
┌─────────────────────────────────────────────┐
│ SSAju - 기업 궁합 분석                      │
├─────────────────────────────────────────────┤
│                                             │
│ 사용자 정보 입력:                           │
│ ┌──────────────────────────────────────┐   │
│ │ 생년월일: [1990-10-10________]      │   │
│ │ 태어난시간: [14:30_______]          │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ 기업 정보 입력:                             │
│ ┌──────────────────────────────────────┐   │
│ │ 기업명: [Samsung Electronics____]   │   │
│ │ (공공데이터에서 자동 조회됩니다)    │   │
│ │                                     │   │
│ │ 또는 수동 입력:                      │   │
│ │ 설립일: [1938-01-13________]       │   │
│ │ 설립시간: [12:00_______]            │   │
│ │                                     │   │
│ └──────────────────────────────────────┘   │
│                                             │
│              [궁합 분석하기]                │
│                                             │
├─ 분석 결과 ───────────────────────────────┤
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 종합 궁합 점수                        │   │
│ │                                     │   │
│ │        78 / 100                     │   │
│ │        ▓▓▓▓▓▓▓▓░░                  │   │
│ │                                     │   │
│ │ 신뢰도: HIGH (높음) ✓               │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ 점수 분석 (각 항목별):                     │
│ ┌──────────────────────────────────────┐   │
│ │ 십신 궁합:      82점 ▓▓▓▓▓▓▓▓░░   │   │
│ │ 오행 궁합:      75점 ▓▓▓▓▓▓▓░░░   │   │
│ │ 지장간 궁합:    76점 ▓▓▓▓▓▓▓░░░   │   │
│ │ 리더십 매칭:    80점 ▓▓▓▓▓▓▓▓░░   │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ 종합 평가:                                  │
│ ┌──────────────────────────────────────┐   │
│ │ 사용자의 정관(正官) 기운과 기업     │   │
│ │ 설립일의 오행(金/水)이 강한         │   │
│ │ 상호보완적 시너지를 냅니다. 특히   │   │
│ │ 체계적인 시스템 안에서 능력을      │   │
│ │ 발휘하는 데 유리한 명식입니다.     │   │
│ └──────────────────────────────────────┘   │
│                                             │
├─ 직무별 매칭도 ──────────────────────────┤
│                                             │
│ ┌──────────────────────────────────────┐   │
│ │ 1. 제조 관리자 - 85점 (추천!)       │   │
│ │    ├─ 이유: 조직력 강점과 정확히 매치 │   │
│ │    └─ 조언: 즉시 지원 권장          │   │
│ │                                     │   │
│ │ 2. 공급망 담당자 - 78점             │   │
│ │    ├─ 이유: 체계성 우수하나 유연성   │   │
│ │    │ 보완 필요                       │   │
│ │    └─ 조언: 관련 경험 어필 시 유리  │   │
│ │                                     │   │
│ │ 3. R&D 리더 - 72점                  │   │
│ │    ├─ 이유: 기술력은 있으나 창의적   │   │
│ │    │ 발산보다 관리형 리더십에 가까움 │   │
│ │    └─ 조언: 실무 경력 축적 후      │   │
│ │    │ 매니징 롤 지원 추천             │   │
│ └──────────────────────────────────────┘   │
│                                             │
├─ 시너지 & 주의사항 ──────────────────────┤
│                                             │
│ 강점:                                       │
│ ✓ 정관 기운이 회사의 체계적 조직 문화 부합 │
│ ✓ 오행 金 분포가 제조 및 IT 산업 특성과 일치│
│ ✓ 지장간 분석 결과 장기 근속 시 안정성    │
│                                             │
│ 주의:                                       │
│ ⚠ 회사의 급격한 조직 개편 시 적응 스트레스  │
│ ⚠ 상반기보다 하반기에 뚜렷한 성과 기대     │
│                                             │
├─ 월별 운세 (채용/면접 최적 시기) ──────────┤
│                                             │
│ 최고 시기:                                  │
│ ┌────────────────────────────────────────┐ │
│ │ 3월 (95점) - 최고조 ★★★★★         │ │
│ │ └─ 정관 기운이 정점, 면접관 호의적   │ │
│ │                                      │ │
│ │ 6월 (88점) - 매우 높음 ★★★★☆      │ │
│ │ └─ 오행 균형이 가장 잘 맞는 시기    │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ 피해야 할 시기:                             │
│ ┌────────────────────────────────────────┐ │
│ │ 1월 (35점) - 주의 ⚠️                │ │
│ │ └─ 기운 전환기, 현 상황 유지 필요   │ │
│ │                                      │ │
│ │ 7월 (42점) - 주의 ⚠️                │ │
│ │ └─ 회사와의 에너지 충돌 가능         │ │
│ └────────────────────────────────────────┘ │
│                                             │
├─ 경력 발전 마일스톤 ─────────────────────┤
│                                             │
│ Immediate (1-3개월):                       │
│ └─ 집중 채용 기간 대비 지원                │
│    └─ 예상: 서류 및 1차 면접 80% 이상    │
│                                             │
│ Short-term (3-12개월):                      │
│ └─ 신규 팀 적응 및 프로세스 파악          │
│    └─ 예상: 조기 적응 & 신뢰 구축        │
│                                             │
│ Medium-term (1-3년):                        │
│ └─ 주요 프로젝트 주도 및 성과 창출        │
│    └─ 예상: 빠른 진급 기회 확보          │
│                                             │
│          [이 분석에 대해 피드백하기]      │
│                                             │
└─────────────────────────────────────────────┘
```

### 주요 컴포넌트

```typescript
// 궁합 점수 카드
interface CompatibilityScoreCardProps {
  score: number;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
}

// 점수 분석 막대
interface ScoreBreakdownChartProps {
  breakdown: ScoreBreakdown;
}

// 직무별 카드
interface RoleCardProps {
  role: RoleCompatibility;
}

// 월별 운세 캘린더
interface MonthlyForecastCalendarProps {
  forecast: MonthlyForecast[];
}

// 타임라인
interface CareerMilestonesTimelineProps {
  milestones: CareerMilestones;
}
```

---

## Screen 4: 피드백 제출 (Feedback)

**목적**: 분석 결과에 대한 만족도 및 상세 의견 수집

### 화면 레이아웃 (모달)

```
┌────────────────────────────────────────┐
│ 분석 결과 피드백                   [×]  │
├────────────────────────────────────────┤
│                                        │
│ 이 분석 결과가 도움이 되었나요?       │
│                                        │
│ 만족도 선택 (필수):                    │
│ ┌────────────────────────────────────┐ │
│ │ ○ 만족함 (도움이 됨)               │ │
│ │ ○ 만족하지 않음 (개선 필요)        │ │
│ └────────────────────────────────────┘ │
│                                        │
│ 피드백 유형 (필수):                    │
│ ┌────────────────────────────────────┐ │
│ │ ○ 관운 분석                        │ │
│ │ ○ AI 커리어 컨설팅                 │ │
│ │ ○ 기업 궁합 분석                   │ │
│ └────────────────────────────────────┘ │
│                                        │
│ 상세 의견 (선택, 최대 500자):         │
│ ┌────────────────────────────────────┐ │
│ │ ┌──────────────────────────────────┐ │ │
│ │ │ 분석 결과가 매우 정확했습니다.   │ │ │
│ │ │ 다만 면접 팁이 좀 더 자세하면   │ │ │
│ │ │ 좋을 것 같습니다.               │ │ │
│ │ │                                  │ │ │
│ │ │ (462 / 500자)                   │ │ │
│ │ └──────────────────────────────────┘ │ │
│ │ ☑ 추가 피드백이 있으면 이메일로   │ │ │
│ │   연락해주세요.                    │ │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [취소]  [제출하기]                     │
│                                        │
└────────────────────────────────────────┘
```

### 컴포넌트 구조

```typescript
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  sajuResultId: number;
  defaultFeedbackType?: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';
  onSubmitSuccess?: () => void;
}

// 내부 상태
const [satisfaction, setSatisfaction] = useState<'SATISFIED' | 'DISSATISFIED'>('');
const [feedbackType, setFeedbackType] = useState<FeedbackType>('');
const [content, setContent] = useState<string>('');
const [charCount, setCharCount] = useState<number>(0);

// 제출 처리
const handleSubmit = async () => {
  const response = await callAPI<SatisfactionFeedbackResponse>(
    '/feedback/satisfaction',
    {
      sajuResultId,
      feedbackType,
      satisfactionStatus: satisfaction,
      feedbackContent: content.trim() || undefined
    }
  );

  if (response) {
    showSuccessMessage('피드백이 저장되었습니다.');
    onClose();
    onSubmitSuccess?.();
  }
};
```

---

## 공통 컴포넌트

### 1. ErrorMessage (에러 표시)

```typescript
interface ErrorMessageProps {
  message: string;
  code?: string;
  onRetry?: () => void;
}

// 사용 예
<ErrorMessage
  message="생년월일 형식이 올바르지 않습니다"
  code="INVALID_DATE_FORMAT"
  onRetry={handleRetry}
/>
```

### 2. LoadingSpinner (로딩 표시)

```typescript
interface LoadingSpinnerProps {
  message?: string;
  duration?: number; // 예상 로딩 시간 (초)
}

// Consultation 호출 시 (15-20초)
<LoadingSpinner
  message="AI 분석 중입니다..."
  duration={20}
/>
```

### 3. ProgressBar (진행 상태)

```typescript
interface ProgressBarProps {
  value: number;           // 0-100
  label?: string;          // 진행률 텍스트
  color?: 'default' | 'success' | 'warning' | 'danger';
}
```

### 4. ScoreVisualization (점수 시각화)

```typescript
interface ScoreVisualizationProps {
  score: number;
  maxScore?: number; // 기본값 100
  label?: string;
  showPercentage?: boolean;
  chart?: 'bar' | 'circle' | 'gauge';
}
```

### 5. TimelineComponent (타임라인)

```typescript
interface TimelineComponentProps {
  items: Array<{
    label: string;
    title: string;
    description: string;
    type: 'pending' | 'completed' | 'active';
  }>;
  direction?: 'vertical' | 'horizontal';
}
```

---

## 상태 관리 가이드

### 권장 구조 (Redux 또는 Zustand)

```typescript
// Store 정의
interface SajuStore {
  // 사용자 입력
  userBirthDate: string;
  userBirthTime: string;
  
  // 분석 결과 캐시
  timingResult: CareerTimingResponse | null;
  consultationResult: ConsultationResponse | null;
  compatibilityResult: CompatibilityResponse | null;
  
  // 로딩/에러 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setUserBirth: (date: string, time: string) => void;
  fetchTimingAnalysis: () => Promise<void>;
  fetchConsultation: () => Promise<void>;
  fetchCompatibility: (company: CompatibilityRequest) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Zustand 구현 예
import { create } from 'zustand';

export const useSajuStore = create<SajuStore>((set, get) => ({
  userBirthDate: '',
  userBirthTime: '',
  timingResult: null,
  consultationResult: null,
  compatibilityResult: null,
  isLoading: false,
  error: null,

  setUserBirth: (date, time) => set({ userBirthDate: date, userBirthTime: time }),

  fetchTimingAnalysis: async () => {
    const { userBirthDate, userBirthTime } = get();
    set({ isLoading: true, error: null });
    try {
      const result = await callAPI<CareerTimingResponse>(
        '/career/timing',
        { birthDate: userBirthDate, birthTime: userBirthTime }
      );
      set({ timingResult: result, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({
    timingResult: null,
    consultationResult: null,
    compatibilityResult: null,
    error: null
  })
}));
```

### 컴포넌트에서 사용

```typescript
import { useSajuStore } from '@/store/saju';

function CareerTimingScreen() {
  const { userBirthDate, userBirthTime, isLoading, error, timingResult } = useSajuStore();
  const { setUserBirth, fetchTimingAnalysis } = useSajuStore();

  const handleSubmit = async () => {
    setUserBirth(formData.birthDate, formData.birthTime);
    await fetchTimingAnalysis();
  };

  if (isLoading) return <LoadingSpinner message="분석 중..." />;
  if (error) return <ErrorMessage message={error} />;
  if (timingResult) return <ResultDisplay data={timingResult} />;

  return <InputForm onSubmit={handleSubmit} />;
}
```

### 응답 캐싱 전략

```typescript
// 같은 생년월일로 재분석 시 캐시 활용
const getCachedOrFetch = async (
  birthDate: string,
  birthTime: string,
  analysisType: 'timing' | 'consultation' | 'compatibility'
) => {
  const cacheKey = `${birthDate}_${birthTime}_${analysisType}`;
  
  // 로컬 스토리지 확인
  const cached = localStorage.getItem(cacheKey);
  if (cached && isValidCache(cached)) {
    return JSON.parse(cached);
  }
  
  // API 호출
  const result = await callAPI(...);
  
  // 캐시 저장 (24시간)
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      data: result,
      timestamp: Date.now()
    })
  );
  
  return result;
};
```

---

## 요약: 데이터 흐름도

```
┌─────────────────┐
│ Screen 1        │ (생년월일/시간 입력)
│ Timing Analysis │
└────────┬────────┘
         │ 저장 (SajuResultId 받음)
         │
    ┌────▼────────────────────────────────┐
    │ 분석 결과 표시 + 피드백 옵션        │
    │                                     │
    │ [더 알아보기] → Screen 2/3으로 이동 │
    │ [피드백] → Feedback Modal 열기      │
    └──────────────────────────────────────┘
         │
         ├─→ ┌──────────────────┐
         │   │ Screen 2         │
         │   │ Consultation     │ (동일 SajuResultId 사용)
         │   └──────────────────┘
         │
         ├─→ ┌──────────────────┐
         │   │ Screen 3         │
         │   │ Compatibility    │ (신규 회사명 입력)
         │   └──────────────────┘
         │
         └─→ ┌──────────────────┐
             │ Feedback Modal   │
             │ (SajuResultId    │
             │  전달)           │
             └──────────────────┘
```

---

## 성능 최적화

```typescript
// 1. 응답 데이터 최적화 (Consultation의 큰 응답)
const parseConsultationData = (data: ConsultationResponse) => {
  // 각 섹션별로 필요한 데이터만 추출
  return {
    industries: data.industries.slice(0, 3), // 상위 3개만
    careerTimeline: {
      lucky: data.careerTimeline.months.filter(m => m.type === 'LUCKY'),
      caution: data.careerTimeline.months.filter(m => m.type === 'CAUTION')
    }
  };
};

// 2. 이미지 지연 로딩
const useIntersectionObserver = (ref: React.RefObject<HTMLElement>) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return isVisible;
};

// 3. 탭 전환 시 지연 로딩
<Tabs activeTab={activeTab}>
  {activeTab === 'industries' && <IndustriesTab {...props} />}
  {activeTab === 'interview' && <InterviewTab {...props} />}
  {/* 보이지 않는 탭은 렌더링하지 않음 */}
</Tabs>
```

---

**문의**: 프론트엔드 팀  
**마지막 검토**: 2026-05-04
