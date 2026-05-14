/**
 * Zod 스키마 유닛 테스트 (T019c)
 */

import {
  CareerTimingResultSchema,
  CareerTimingResponseSchema,
  ConsultationDataSchema,
  CompatibilityResultSchema,
  AnalysisRecordSchema,
  MonthlyForecastSchema,
} from '@/lib/api/schemas';

// ─── 픽스처 ────────────────────────────────────────────────────────────────────

const validCareerTimingResult = {
  sajuResultId: 'result-001',
  h1Period: '2025-03 ~ 2025-06',
  h2Period: '2025-09 ~ 2025-12',
  h1Confidence: 85,
  h2Confidence: 72,
  recommendation: '봄철에 이직 도전을 권장합니다.',
};

const validMonthlyForecast = {
  month: 3,
  score: 88,
  type: 'LUCKY' as const,
  advice: '새로운 기회를 적극적으로 잡으세요.',
};

const validConsultationData = {
  sajuResultId: 'result-001',
  recommendedIndustries: [
    {
      industryName: 'IT/소프트웨어',
      reason: '분석력과 창의성이 높음',
      recommendedRoles: ['백엔드 개발자', '데이터 엔지니어'],
    },
  ],
  interviewTips: ['자신감 있게 말하세요', '구체적인 사례를 들어 설명하세요'],
  strengths: ['분석적 사고', '문제 해결 능력'],
  sajuProfile: {
    dayMaster: '丙',
    personality: '열정적이고 카리스마 있음',
    oHangDistribution: { 木: 2, 火: 3, 土: 1, 金: 1, 水: 1 },
    sipShinDistribution: { 比肩: 1, 食神: 2, 正官: 1 },
  },
  wealthStyle: {
    incomeSource: '급여 소득',
    financialAdvice: '안정적 투자를 권장합니다.',
    investmentStyle: '보수적',
    additionalIncome: '부업 가능',
  },
  careerRoadmap: {
    shortTerm: '현재 역량 강화',
    midTerm: '시니어 포지션 도전',
    longTerm: '리더십 역할 수행',
  },
  branding: {
    suitColor: '네이비',
    imageStyle: '전문적이고 신뢰감 있는',
    hairMakeup: '단정하고 깔끔한',
    powerKeywords: ['전문성', '신뢰', '혁신'],
  },
  monthlyForecasts: [validMonthlyForecast],
};

const validCompatibilityResult = {
  sajuResultId: 'result-001',
  companyName: '삼성전자',
  compatibilityScore: 78,
  confidenceLevel: 'HIGH' as const,
  sipShinScore: 80,
  oHangScore: 75,
  jijangGanScore: 70,
  leadershipScore: 85,
  jobMatchCards: [
    {
      jobTitle: '소프트웨어 엔지니어',
      score: 90,
      reason: '기술적 역량과 부합',
      recommendation: '추천',
      isRecommended: true,
    },
  ],
  monthlyForecasts: [validMonthlyForecast],
  careerMilestone: {
    shortTerm: '온보딩 완료',
    midTerm: '프로젝트 리드',
    longTerm: '팀장 승진',
  },
  recommendation: '이 기업은 당신의 역량과 잘 맞습니다.',
};

// ─── 관운 분석 스키마 ──────────────────────────────────────────────────────────

describe('CareerTimingResultSchema', () => {
  it('유효한 관운 분석 결과를 파싱한다', () => {
    const result = CareerTimingResultSchema.safeParse(validCareerTimingResult);
    expect(result.success).toBe(true);
  });

  it('신뢰도 0-100 범위를 벗어나면 실패한다', () => {
    const invalid = { ...validCareerTimingResult, h1Confidence: 150 };
    const result = CareerTimingResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('필수 필드 누락 시 실패한다', () => {
    const { sajuResultId: _, ...withoutId } = validCareerTimingResult;
    const result = CareerTimingResultSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });
});

describe('CareerTimingResponseSchema (ApiResponse 래퍼)', () => {
  it('success=true, data 있는 응답을 파싱한다', () => {
    const response = {
      success: true,
      data: validCareerTimingResult,
      error: null,
      timestamp: Date.now(),
    };
    const result = CareerTimingResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('success=false, error 있는 응답을 파싱한다', () => {
    const response = {
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: '결과를 찾을 수 없습니다.', requestId: 'req-001' },
      timestamp: Date.now(),
    };
    const result = CareerTimingResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });
});

// ─── 월별 운세 스키마 ──────────────────────────────────────────────────────────

describe('MonthlyForecastSchema', () => {
  it('유효한 월별 운세를 파싱한다', () => {
    const result = MonthlyForecastSchema.safeParse(validMonthlyForecast);
    expect(result.success).toBe(true);
  });

  it('month 1-12 범위를 벗어나면 실패한다', () => {
    const invalid = { ...validMonthlyForecast, month: 13 };
    const result = MonthlyForecastSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('type이 허용된 enum 이외의 값이면 실패한다', () => {
    const invalid = { ...validMonthlyForecast, type: 'UNKNOWN' };
    const result = MonthlyForecastSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ─── AI 컨설팅 스키마 ──────────────────────────────────────────────────────────

describe('ConsultationDataSchema', () => {
  it('유효한 컨설팅 데이터를 파싱한다', () => {
    const result = ConsultationDataSchema.safeParse(validConsultationData);
    expect(result.success).toBe(true);
  });

  it('monthlyForecasts 중 잘못된 항목이 있으면 실패한다', () => {
    const invalid = {
      ...validConsultationData,
      monthlyForecasts: [{ ...validMonthlyForecast, score: -10 }],
    };
    const result = ConsultationDataSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ─── 기업 궁합 스키마 ──────────────────────────────────────────────────────────

describe('CompatibilityResultSchema', () => {
  it('유효한 기업 궁합 결과를 파싱한다', () => {
    const result = CompatibilityResultSchema.safeParse(validCompatibilityResult);
    expect(result.success).toBe(true);
  });

  it('confidenceLevel이 허용 값 이외이면 실패한다', () => {
    const invalid = { ...validCompatibilityResult, confidenceLevel: 'VERY_HIGH' };
    const result = CompatibilityResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('compatibilityScore가 0-100 범위를 벗어나면 실패한다', () => {
    const invalid = { ...validCompatibilityResult, compatibilityScore: -5 };
    const result = CompatibilityResultSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

// ─── 분석 기록 스키마 ──────────────────────────────────────────────────────────

describe('AnalysisRecordSchema', () => {
  it('CAREER_TIMING 타입 기록을 파싱한다', () => {
    const record = {
      recordId: 'rec-001',
      userId: 'user-001',
      analysisType: 'CAREER_TIMING',
      data: validCareerTimingResult,
      createdAt: Date.now(),
    };
    const result = AnalysisRecordSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it('savedAt은 선택 필드다', () => {
    const record = {
      recordId: 'rec-002',
      userId: 'user-001',
      analysisType: 'CONSULTATION',
      data: validConsultationData,
      createdAt: Date.now(),
      savedAt: Date.now(),
    };
    const result = AnalysisRecordSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it('잘못된 analysisType이면 실패한다', () => {
    const record = {
      recordId: 'rec-003',
      userId: 'user-001',
      analysisType: 'UNKNOWN_TYPE',
      data: validCareerTimingResult,
      createdAt: Date.now(),
    };
    const result = AnalysisRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });
});
