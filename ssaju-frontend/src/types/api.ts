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
}

/**
 * 관운 분석 결과
 */
export interface CareerTimingResult {
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
}

/** 추천 산업 항목 */
export interface IndustryRecommendation {
  industryName: string;
  reason: string;
  recommendedRoles: string[];
}

/** 사주 프로필 */
export interface SajuProfile {
  dayMaster: string; // 일주 천간 (예: 丙)
  personality: string;
  oHangDistribution: Record<string, number>; // 木火土金水 개수
  sipShinDistribution: Record<string, number>;
}

/** 부의운 */
export interface WealthStyle {
  incomeSource: string;
  financialAdvice: string;
  investmentStyle: string;
  additionalIncome: string;
}

/** 경력 로드맵 */
export interface CareerRoadmap {
  shortTerm: string; // 0-2년
  midTerm: string;   // 3-5년
  longTerm: string;  // 최종 목표
}

/** 브랜딩 */
export interface BrandingInfo {
  suitColor: string;
  imageStyle: string;
  hairMakeup: string;
  powerKeywords: string[];
}

/** 월별 운세 항목 */
export interface MonthlyForecast {
  month: number;        // 1-12
  score: number;        // 0-100
  type: 'LUCKY' | 'CAUTION' | 'NORMAL';
  advice: string;
}

/**
 * AI 컨설팅 응답 (8개 탭 전체 데이터)
 */
export interface ConsultationData {
  sajuResultId: string;
  recommendedIndustries: IndustryRecommendation[]; // 탭1: 추천산업
  interviewTips: string[];                          // 탭2: 면접팁
  strengths: string[];                              // 탭3: 강점
  sajuProfile: SajuProfile;                         // 탭4: 사주프로필
  wealthStyle: WealthStyle;                         // 탭5: 부의운
  careerRoadmap: CareerRoadmap;                     // 탭6: 경력로드맵
  branding: BrandingInfo;                           // 탭7: 브랜딩
  monthlyForecasts: MonthlyForecast[];              // 탭8: 월별운세
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
  detailName: string;
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

/** 면접 최적 시기 */
export interface BestTiming {
  luckyDays: string[];
}

/** 실행 전략 */
export interface ActionableStrategy {
  interviewKeywords: string[];
  weaknessDefense: string;
  bestTiming: BestTiming;
}

/**
 * 기업 호환성 결과
 */
export interface CompatibilityResult {
  potentialSynergy: number;      // 시너지 점수 0-100
  longTermStability: number;     // 장기 안정성 0-100
  actionableStrategy: ActionableStrategy;
}

/**
 * 피드백 요청 (FR-009)
 *
 * satisfactionStatus: 만족함(SATISFIED) / 만족하지 않음(UNSATISFIED) 이진 선택
 * feedbackType: 페이지에 따라 자동 결정 (읽기 전용)
 * feedbackContent: 선택 입력, 최대 500자
 */
export interface FeedbackRequest {
  sajuResultId: number;
  feedbackType: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';
  satisfactionStatus: 'SATISFIED' | 'UNSATISFIED';
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
 * 마이페이지 무한 스크롤 응답
 */
export interface AnalysisHistoryResponse {
  records: AnalysisRecord[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}
