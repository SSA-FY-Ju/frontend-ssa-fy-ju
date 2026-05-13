// 파일 크기 예외: 생년월일·시간·기업명·피드백 등 모든 검증 스키마를 한 파일에
// 응집시켜 검증 규칙 변경 시 단일 지점 수정 가능 (Single Source of Truth)
/**
 * 입력 검증 유틸리티 (Zod 스키마)
 *
 * 검증 항목:
 * - 생년월일: YYYY-MM-DD, 과거 날짜
 * - 시간: HH:mm 24시간 형식, 미입력 시 12:00
 * - 기업명: 문자열, XSS 방지
 * - 피드백: 최대 500자, 만족도 필수
 */

import { z } from 'zod';

/**
 * 생년월일 스키마 (YYYY-MM-DD, 과거 날짜)
 */
export const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)')
  .refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, '유효한 날짜가 아닙니다')
  .refine((date) => {
    return new Date(date) < new Date();
  }, '생년월일은 과거 날짜여야 합니다');

/**
 * 시간 스키마 (HH:mm, 미입력 허용 → 12:00 기본값)
 */
export const birthTimeSchema = z
  .string()
  .optional()
  .transform((val) => val || '12:00')
  .refine((time) => {
    if (!time) return true;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  }, '시간 형식이 올바르지 않습니다 (HH:mm)');

/**
 * 기업명 스키마 (XSS 방지 처리)
 */
export const companyNameSchema = z
  .string()
  .min(1, '기업명을 입력해주세요')
  .max(100, '기업명은 100자 이내로 입력해주세요')
  .transform((val) =>
    // XSS 방지: HTML 특수문자 이스케이프
    val
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;'),
  );

/**
 * 피드백 만족도 스키마
 */
export const satisfactionSchema = z.enum(['SATISFIED', 'UNSATISFIED'], {
  errorMap: () => ({ message: '만족도를 선택해주세요' }),
});

/**
 * 피드백 내용 스키마 (최대 500자)
 */
export const feedbackContentSchema = z
  .string()
  .max(500, '피드백은 500자 이내로 입력해주세요')
  .optional();

/**
 * 관운 분석 입력 폼 스키마
 */
export const careerTimingFormSchema = z.object({
  birthDate: birthDateSchema,
  birthTime: birthTimeSchema,
  solarType: z.enum(['SOLAR', 'LUNAR']).default('SOLAR'),
});

export type CareerTimingFormData = z.infer<typeof careerTimingFormSchema>;

/**
 * 기업 궁합 입력 폼 스키마
 */
export const compatibilityFormSchema = z.object({
  birthDate: birthDateSchema,
  birthTime: birthTimeSchema,
  companyName: companyNameSchema,
});

export type CompatibilityFormData = z.infer<typeof compatibilityFormSchema>;

/**
 * 피드백 폼 스키마
 */
export const feedbackFormSchema = z.object({
  satisfactionStatus: satisfactionSchema,
  feedbackContent: feedbackContentSchema,
});

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

/**
 * 폼 데이터 검증 헬퍼
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path.join('.');
    errors[field] = err.message;
  });

  return { success: false, errors };
}
