/**
 * Zod 스키마 유닛 테스트 (T019c)
 */

import {
  CareerTimingResultSchema,
  CareerTimingResponseSchema,
  ConsultationDataSchema,
  CompatibilityResultSchema,
  AnalysisRecordSchema,
} from '@/lib/api/schemas';

// ─── 픽스처 ────────────────────────────────────────────────────────────────────

const validCareerTimingResult = {
  favoredPeriod: '2025년 하반기',
  confidenceScore: 85,
  reasoning: '경금 일주가 을사년 하반기 운과 합을 이룹니다.',
};

const validConsultationData = {
  analysisSummary: '경금 일주의 분석력이 강점입니다.',
  pivotPoints: [
    {
      month: '2025년 9월',
      type: 'LUCKY',
      score: 91,
      description: '관성이 활성화되는 최고의 시기입니다.',
    },
  ],
  warningMonths: ['2025년 6월'],
  warningDescription: '형충의 기운으로 대인 갈등이 생기기 쉽습니다.',
};

const validCompatibilityResult = {
  potentialSynergy: 78,
  longTermStability: 72,
  actionableStrategy: {
    interviewKeywords: ['혁신', '성과 중심'],
    weaknessDefense: '단기 성과보다 장기적 비전을 강조하세요.',
    bestTiming: { luckyDays: ['2025년 9월 15일'] },
  },
};

// ─── 관운 분석 스키마 ──────────────────────────────────────────────────────────

describe('CareerTimingResultSchema', () => {
  it('유효한 관운 분석 결과를 파싱한다', () => {
    expect(CareerTimingResultSchema.safeParse(validCareerTimingResult).success).toBe(true);
  });

  it('신뢰도 0-100 범위를 벗어나면 실패한다', () => {
    expect(CareerTimingResultSchema.safeParse({ ...validCareerTimingResult, confidenceScore: 150 }).success).toBe(false);
  });

  it('필수 필드 누락 시 실패한다', () => {
    const { favoredPeriod: _, ...without } = validCareerTimingResult;
    expect(CareerTimingResultSchema.safeParse(without).success).toBe(false);
  });
});

describe('CareerTimingResponseSchema (ApiResponse 래퍼)', () => {
  it('success=true, data 있는 응답을 파싱한다', () => {
    const response = { success: true, data: validCareerTimingResult, error: null, timestamp: Date.now() };
    expect(CareerTimingResponseSchema.safeParse(response).success).toBe(true);
  });

  it('success=false, error 있는 응답을 파싱한다', () => {
    const response = {
      success: false, data: null,
      error: { code: 'NOT_FOUND', message: '결과 없음', requestId: 'req-001' },
      timestamp: Date.now(),
    };
    expect(CareerTimingResponseSchema.safeParse(response).success).toBe(true);
  });
});

// ─── AI 컨설팅 스키마 ──────────────────────────────────────────────────────────

describe('ConsultationDataSchema', () => {
  it('유효한 컨설팅 데이터를 파싱한다', () => {
    expect(ConsultationDataSchema.safeParse(validConsultationData).success).toBe(true);
  });

  it('pivotPoints score 범위를 벗어나면 실패한다', () => {
    const invalid = {
      ...validConsultationData,
      pivotPoints: [{ ...validConsultationData.pivotPoints[0], score: 150 }],
    };
    expect(ConsultationDataSchema.safeParse(invalid).success).toBe(false);
  });

  it('필수 필드 누락 시 실패한다', () => {
    const { analysisSummary: _, ...without } = validConsultationData;
    expect(ConsultationDataSchema.safeParse(without).success).toBe(false);
  });
});

// ─── 기업 궁합 스키마 ──────────────────────────────────────────────────────────

describe('CompatibilityResultSchema', () => {
  it('유효한 궁합 결과를 파싱한다', () => {
    expect(CompatibilityResultSchema.safeParse(validCompatibilityResult).success).toBe(true);
  });

  it('potentialSynergy 범위를 벗어나면 실패한다', () => {
    expect(CompatibilityResultSchema.safeParse({ ...validCompatibilityResult, potentialSynergy: 110 }).success).toBe(false);
  });
});

// ─── 분석 기록 스키마 ──────────────────────────────────────────────────────────

describe('AnalysisRecordSchema', () => {
  it('CAREER_TIMING 레코드를 파싱한다', () => {
    const record = {
      recordId: 'rec-001', userId: 'u-001',
      analysisType: 'CAREER_TIMING',
      data: validCareerTimingResult,
      createdAt: Date.now(),
    };
    expect(AnalysisRecordSchema.safeParse(record).success).toBe(true);
  });

  it('CONSULTATION 레코드를 파싱한다', () => {
    const record = {
      recordId: 'rec-002', userId: 'u-001',
      analysisType: 'CONSULTATION',
      data: validConsultationData,
      createdAt: Date.now(),
    };
    expect(AnalysisRecordSchema.safeParse(record).success).toBe(true);
  });
});
