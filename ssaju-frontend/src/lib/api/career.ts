/**
 * 커리어 분석 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/career/timing       - 관운 기반 채용 시기 분석
 * - POST /api/career/consultation - AI 커리어 컨설팅
 */

import { apiFetch, TIMEOUTS } from './client';
import type {
  CareerTimingRequest,
  CareerTimingResult,
  ConsultationRequest,
  ConsultationData,
} from '@/types/api';

/**
 * 관운 기반 채용 시기 분석
 */
export async function fetchCareerTiming(
  request: CareerTimingRequest,
): Promise<CareerTimingResult> {
  return apiFetch<CareerTimingResult>('/api/career/timing', {
    method: 'POST',
    body: request,
    timeout: TIMEOUTS.DEFAULT,
  });
}

/**
 * AI 기반 커리어 컨설팅
 * 타임아웃: 60초 (AI 분석은 시간이 오래 걸림)
 */
export async function fetchConsultation(
  request: ConsultationRequest,
): Promise<ConsultationData> {
  return apiFetch<ConsultationData>('/api/career/consultation', {
    method: 'POST',
    body: request,
    timeout: TIMEOUTS.LONG,
  });
}
