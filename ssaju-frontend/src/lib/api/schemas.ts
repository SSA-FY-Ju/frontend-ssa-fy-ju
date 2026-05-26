/**
 * Zod 런타임 검증 스키마 (T019b)
 *
 * API 응답 데이터를 런타임에 검증하여 타입 안전성 보장.
 * apiFetch 반환값 검증이나 테스트에서 사용 가능.
 */

import { z } from 'zod';

// ─── 공통 ─────────────────────────────────────────────────────────────────────

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        requestId: z.string(),
      })
      .nullable(),
    timestamp: z.number(),
  });

// ─── 관운 분석 ────────────────────────────────────────────────────────────────

export const CareerTimingResultSchema = z.object({
  sajuResultId: z.string(),
  h1Period: z.string(),
  h2Period: z.string(),
  h1Confidence: z.number().min(0).max(100),
  h2Confidence: z.number().min(0).max(100),
  recommendation: z.string(),
});

export const CareerTimingResponseSchema = ApiResponseSchema(CareerTimingResultSchema);

// ─── AI 컨설팅 ────────────────────────────────────────────────────────────────

export const PivotPointSchema = z.object({
  month: z.string(),
  type: z.string(),
  score: z.number().min(0).max(100),
  description: z.string(),
});

export const ConsultationDataSchema = z.object({
  pivotPoints: z.array(PivotPointSchema),
  warningMonths: z.array(z.string()),
  warningDescription: z.string(),
  analysisSummary: z.string(),
});

export const ConsultationResponseSchema = ApiResponseSchema(ConsultationDataSchema);

// ─── 기업 궁합 ────────────────────────────────────────────────────────────────

const BestTimingSchema = z.object({
  luckyDays: z.array(z.string()),
});

const ActionableStrategySchema = z.object({
  interviewKeywords: z.array(z.string()),
  weaknessDefense: z.string(),
  bestTiming: BestTimingSchema,
});

export const CompatibilityResultSchema = z.object({
  potentialSynergy: z.number().min(0).max(100),
  longTermStability: z.number().min(0).max(100),
  actionableStrategy: ActionableStrategySchema,
});

export const CompatibilityResponseSchema = ApiResponseSchema(CompatibilityResultSchema);

// ─── 분석 기록 (마이페이지) ────────────────────────────────────────────────────

export const AnalysisRecordSchema = z.object({
  recordId: z.string(),
  userId: z.string(),
  analysisType: z.enum(['CAREER_TIMING', 'CONSULTATION', 'COMPATIBILITY']),
  data: z.union([CareerTimingResultSchema, ConsultationDataSchema, CompatibilityResultSchema]),
  createdAt: z.number(),
  savedAt: z.number().optional(),
});

export const AnalysisHistoryResponseSchema = ApiResponseSchema(
  z.object({
    records: z.array(AnalysisRecordSchema),
    hasMore: z.boolean(),
    nextCursor: z.string().optional(),
    total: z.number(),
  }),
);

// ─── 타입 추론 ────────────────────────────────────────────────────────────────

export type CareerTimingResultDto = z.infer<typeof CareerTimingResultSchema>;
export type ConsultationDataDto = z.infer<typeof ConsultationDataSchema>;
export type CompatibilityResultDto = z.infer<typeof CompatibilityResultSchema>;
export type AnalysisRecordDto = z.infer<typeof AnalysisRecordSchema>;
