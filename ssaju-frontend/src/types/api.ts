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
  solarType: 'SOLAR' | 'LUNAR';
  birthCity?: string;
  gender?: 'M' | 'F' | 'UNKNOWN';
}

/**
 * 관운 분석 결과
 */
export interface CareerTimingResult {
  sajuResultId: string;
  h1Period: string;
  h2Period: string;
  h1Confidence: number; // 0-100
  h2Confidence: number; // 0-100
  recommendation: string;
}

/**
 * AI 컨설팅 요청
 */
export interface ConsultationRequest {
  sajuResultId: string;
  userInput: string;
  fieldId: string; // 8개 탭 중 하나
}

/**
 * AI 컨설팅 응답 (8개 탭)
 */
export interface ConsultationData {
  sajuResultId: string;
  careerPath: string;
  timing: string;
  marketTrend: string;
  skillGap: string;
  networkStrategy: string;
  riskManagement: string;
  psychologicalPrepare: string;
  alternativePlans: string;
}

/**
 * 기업 호환성 요청
 */
export interface CompatibilityRequest {
  sajuResultId: string;
  companyName: string;
}

/**
 * 기업 호환성 결과
 */
export interface CompatibilityResult {
  sajuResultId: string;
  companyName: string;
  compatibilityScore: number; // 0-100
  cultureFit: number;
  careerGrowthScore: number;
  jobTypeMatch: string;
  matchedJobPositions: string[];
  recommendation: string;
}

/**
 * 피드백 요청
 */
export interface FeedbackRequest {
  satisfactionScore: number; // 1-5
  comment?: string;
  analysisType: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';
  sajuResultId?: string;
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
  socialProvider: 'KAKAO' | 'GOOGLE';
  email?: string;
  name: string;
  profileImage?: string;
  createdAt: number; // Unix timestamp
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
