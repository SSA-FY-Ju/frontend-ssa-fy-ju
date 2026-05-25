// 파일 크기 예외: 타입 정의 파일은 모든 도메인 타입을 한 곳에 모아야
// 가져오기(import) 경로가 단순해지고 타입 간 참조가 명확해짐
/**
 * API 요청/응답 타입 정의
 */

/**
 * 모든 API 응답의 기본 구조
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    requestId: string;
  } | null;
  timestamp: number;
}

/**
 * 관운 분석 요청
 */
export interface CareerTimingRequest {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm (기본값: 12:00)
  targetName?: string;
}

/**
 * 관운 분석 결과
 */
export interface CareerTimingResult {
  analysisId?: number;      // 피드백 연동용 ID
  favoredPeriod: string;    // 채용 운이 좋은 시기 (예: "2025년 상반기")
  confidenceScore: number;  // 신뢰도 0-100
  reasoning: string;        // 분석 근거
}

/**
 * AI 컨설팅 요청
 */
export interface ConsultationRequest {
  birthDate: string;
  birthTime?: string;
  targetName?: string;
}

/** 추천 산업 */
export interface Industry {
  name: string;
  reason: string;
  recommendedRoles: string[];
}

/** 사주 프로필 */
export interface SajuProfile {
  dayMaster: string;
  dayMasterDescription: string;
  fiveElements: Record<string, number>;
  fiveElementsAnalysis: string;
  tenGodDistribution: Record<string, number>;
  keyTenGods: string[];
  tenGodCharacteristics?: Record<string, string>; // 십신별 특성 설명
}

/** 재무 스타일 */
export interface WealthStyle {
  incomeSource: string;
  financialAdvice: string;
  investmentTendency: string;
  additionalIncome: string;
}

/** 로드맵 단계 */
export interface RoadmapPhase {
  goal: string;
  focus: string;
  action: string;
}

/** 장기 로드맵 */
export interface LongTermRoadmap {
  phase0to2years: RoadmapPhase;
  phase3to5years: RoadmapPhase;
  ultimateGoal: string;
  goalDescription: string;
}

/** 개인 브랜딩 */
export interface PersonalBranding {
  suitColor: string;
  impression: string;
  hairAndMakeup: string;
  brandingKeyword: string;
  taglineForResume: string;
}

/** 파워 키워드 아이템 */
export interface PowerKeywordItem {
  keyword: string;
  element: string;
  description: string;
  usageExample: string;
  context: string;
}

/** 파워 키워드 */
export interface PowerKeywords {
  keywords: PowerKeywordItem[];
  selectionGuide: string;
  usageTips: string[];
  avoidanceTip: string;
}

/** 멘탈 케어 */
export interface MentalCare {
  stressVulnerability: string[];
  rechargeMethod: string[];
  mindsetMantra: string;
  emergencyTactic: string;
}

/** 근무환경 적합도 */
export interface EnvironmentFit {
  workVibe: string;
  companySize: string;
  colleagueType: string;
  conflictApproach: string;
  physicalEnv: string;
  culturalFit: string;
}

/** 업무 스타일 */
export interface ConsultationWorkStyle {
  preferredCompanyType: string;
  leadershipType: string;
  decisionMaking: string;
  conflictResolution: string;
}

/** 인간관계 전략 */
export interface RelationshipStrategy {
  socialStyle: string;
  networkingApproach: string;
  teamPosition: string;
  conflictResolution: string;
  careerNetworking: string;
}

/** 월별 예측 */
export interface MonthForecast {
  type: string;
  description: string;
}

/** 커리어 타임라인 전환점 */
export interface CareerPivotPoint {
  month: number;
  type: string;
  score: number;
  description: string;
}

/** 커리어 타임라인 */
export interface CareerTimeline {
  year: number;
  months: Record<string, MonthForecast>;
  pivotPoints: CareerPivotPoint[];
  warningMonths: number[];
  warningDescription: string;
}

/**
 * AI 컨설팅 응답
 */
export interface ConsultationData {
  consultationId?: number;      // 피드백 연동용 ID (= analysisId)
  industries: Industry[];
  interviewTips: string[];
  strengths: string[];
  cautions: string[];
  favoredPeriod: string;        // "H1" | "H2"
  confidenceScore: number;      // 0-100
  reasoning: string;
  sajuProfile: SajuProfile;
  wealthStyle: WealthStyle;
  longTermRoadmap: LongTermRoadmap;
  personalBranding: PersonalBranding;
  powerKeywords: PowerKeywords;
  mentalCare: MentalCare;
  environmentFit: EnvironmentFit;
  workStyle: ConsultationWorkStyle;
  relationshipStrategy: RelationshipStrategy;
  careerTimeline: CareerTimeline;
  analysisSummary?: string;     // 전체 분석 요약
  openaiModelVersion?: string;  // 사용된 OpenAI 모델 버전
}

/** 직무 카테고리 */
export type RoleCategory =
  | 'TECH_BACKEND'
  | 'TECH_FRONTEND'
  | 'TECH_FULLSTACK'
  | 'TECH_DATA'
  | 'TECH_DEVOPS'
  | 'TECH_MOBILE'
  | 'PLANNING'
  | 'DESIGN'
  | 'MARKETING'
  | 'SALES'
  | 'HR'
  | 'FINANCE'
  | 'MANAGEMENT'
  | 'OTHER';

/** 직무 정보 */
export interface TargetRole {
  category: RoleCategory;
  detailName?: string; // 선택사항 (API 명세 기준)
}

/**
 * 기업 호환성 요청
 */
export interface CompatibilityRequest {
  userBirthDate: string;       // YYYY-MM-DD
  userBirthTime?: string;      // HH:mm
  targetRole: TargetRole;
  companyName: string;
  companyFoundingDate?: string; // YYYY-MM-DD (선택)
  companyFoundingTime?: string; // HH:mm (선택)
}

/** 직군별 궁합 분석 */
export interface TargetRoleAnalysis {
  matchScore: number;   // 직군 매칭 점수 0-100
  synergy: string;      // 시너지 설명
  warning: string;      // 주의사항
}

/** 오행 분석 (실제 응답 구조) */
export interface FiveElementsAnalysis {
  userDistribution: Record<string, number>;    // 사용자 오행 (木/火/土/金/水)
  companyDistribution: Record<string, number>; // 기업 오행
  synergyDescription: string;                  // 오행 시너지 설명
}

/** 세부 점수 분석 (실제 응답 구조) */
export interface AnalysisBreakdown {
  characterMatch: number;      // 성향 일치도 0-100
  potentialSynergy: number;    // 잠재 시너지 0-100
  longTermStability: number;   // 장기 안정성 0-100
}

/** 전략 제안 */
export interface ActionableStrategy {
  interviewKeywords: string[];
  weaknessDefense: string;
  bestTiming: {
    luckyDays: string[];
    preferredTime: string;
  };
}

/** 예상 면접 질문 */
export interface InterviewQuestion {
  question: string;
  intent: string;
}

/** 직군별 궁합 */
export interface RoleCompatibility {
  roleName: string;
  score: number;
  reason: string;
  tag?: string;
}

/** 월별 운세 예측 (실제 응답 구조) */
export interface MonthlyForecast {
  month: number;                           // 월 숫자 (5, 6, 7...)
  score: number;                           // 유리도 0-100
  status: 'LUCKY' | 'CAUTION' | 'NORMAL';
  advice: string;
}

/**
 * 기업 호환성 결과 (실제 백엔드 응답 구조)
 */
export interface CompatibilityResult {
  analysisId?: number;                           // 피드백 연동용 ID
  compatibilityId?: number;                      // 하위 호환용
  requestContext?: { companyName: string; targetRole: TargetRole };
  compatibilityScore: number;                    // 종합 궁합 점수 0-100
  summary?: string;                              // 한줄 요약
  targetRoleAnalysis: TargetRoleAnalysis;        // 직군 분석
  fiveElements: FiveElementsAnalysis;            // 오행 분석
  analysisBreakdown: AnalysisBreakdown;          // 세부 점수
  actionableStrategy?: ActionableStrategy;       // 전략 제안
  expectedInterviewQuestions: InterviewQuestion[]; // 예상 면접 질문
  roleCompatibility: RoleCompatibility[];        // 직군별 궁합
  monthlyForecast: MonthlyForecast[];            // 월별 운세
  cautions: string[];                            // 주의사항
}

/**
 * 피드백 요청 — API 스펙 기준 값 사용
 *
 * feedbackType: CAREER_TIMING | CONSULTATION | COMPATIBILITY
 * satisfactionStatus: SATISFIED | DISSATISFIED
 * feedbackContent: 선택 입력, 최대 500자
 */
export interface FeedbackRequest {
  analysisId: number;
  feedbackType: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';
  satisfactionStatus: 'SATISFIED' | 'DISSATISFIED';
  feedbackContent?: string;
}

/**
 * 피드백 응답
 */
export interface FeedbackResponse {
  success: boolean;
  feedbackId: string;
}

/**
 * 사용자 정보
 */
export interface User {
  userId: string;
  email: string;
  name: string;
  profileImage?: string;
  createdAt?: number; // Unix timestamp
}

/**
 * 분석 기록
 */
export interface AnalysisRecord {
  recordId: string;
  userId: string;
  analysisType: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';
  data: CareerTimingResult | ConsultationData | CompatibilityResult;
  createdAt: number;
  savedAt?: number;
}

/**
 * 마이페이지 분석 요약 (API 명세 기준)
 */
export interface MyPageAnalysisSummary {
  id: number;
  type: 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';
  birthDate: string;
  createdAt: string; // ISO 8601
  favoredPeriod?: string;
  confidenceScore?: number;
}

/**
 * 마이페이지 데이터 (실제 응답 기준)
 */
export interface MyPageData {
  profile: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    lastLoginAt: string;
  };
  analyses: MyPageAnalysisSummary[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 마이페이지 무한 스크롤 응답 (기존 호환성 유지용)
 */
export interface AnalysisHistoryResponse {
  records: AnalysisRecord[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}
