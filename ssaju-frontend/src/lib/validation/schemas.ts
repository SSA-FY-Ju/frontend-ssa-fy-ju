import { z } from 'zod';

/**
 * Session Data Schema - sessionStorage에 저장되는 사용자 세션 데이터 검증
 *
 * 필드:
 * - birthDate: YYYY-MM-DD 형식 (필수)
 * - birthTime: HH:mm 형식 (선택, 기본값: 12:00)
 */
export const SessionDataSchema = z.object({
  birthDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      '생년월일은 YYYY-MM-DD 형식이어야 합니다'
    ),
  birthTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, '생년시간은 HH:mm 형식이어야 합니다')
    .optional()
    .default('12:00'),
});

export type SessionData = z.infer<typeof SessionDataSchema>;

/**
 * Session Data를 검증하고 파싱
 *
 * @param raw - JSON 문자열 또는 객체
 * @returns 검증된 SessionData
 * @throws ZodError - 검증 실패 시
 */
export function parseSessionData(raw: unknown): SessionData {
  if (typeof raw === 'string') {
    return SessionDataSchema.parse(JSON.parse(raw));
  }
  return SessionDataSchema.parse(raw);
}
