/**
 * 커리어 분석 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/career/timing   - 관운 기반 채용 시기 분석
 * - POST /api/career/consultation - AI 커리어 컨설팅
 */

import { apiFetch } from './client';
import type {
  CareerTimingRequest,
  CareerTimingResult,
  ConsultationRequest,
  ConsultationData,
} from '@/types/api';

const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * 관운 기반 채용 시기 분석
 * 타임아웃: 10초
 */
export async function fetchCareerTiming(
  _request: CareerTimingRequest,
): Promise<CareerTimingResult> {
  if (IS_DEV) {
    const { mockCareerTimingResult } = await import('@/mocks/data/career');
    await new Promise((r) => setTimeout(r, 600));
    return mockCareerTimingResult;
  }
  return apiFetch<CareerTimingResult>('/api/career/timing', {
    method: 'POST',
    body: _request,
    timeout: 10000,
  });
}

/**
 * AI 기반 커리어 컨설팅
 * 타임아웃: 15초 (AI 분석)
 */
export async function fetchConsultation(
  _request: ConsultationRequest,
): Promise<ConsultationData> {
  if (IS_DEV) {
    const { mockConsultationData } = await import('@/mocks/data/career');
    await new Promise((r) => setTimeout(r, 1200));
    return mockConsultationData;
  }
  return apiFetch<ConsultationData>('/api/career/consultation', {
    method: 'POST',
    body: _request,
    timeout: 15000,
  });
}
