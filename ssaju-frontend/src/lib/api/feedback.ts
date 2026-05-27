/**
 * 피드백 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/feedback/satisfaction - 만족도 피드백 제출
 */

import { apiFetch, TIMEOUTS } from './client';
import type { FeedbackRequest, FeedbackResponse } from '@/types/api';

/**
 * 만족도 피드백 제출
 */
export async function submitFeedback(
  request: FeedbackRequest,
): Promise<FeedbackResponse> {
  return apiFetch<FeedbackResponse>('/api/feedback/satisfaction', {
    method: 'POST',
    body: request,
    timeout: TIMEOUTS.DEFAULT,
  });
}
