/**
 * MSW 커리어 API 핸들러
 */

import { http, HttpResponse, delay } from 'msw';
import { mockConsultationData } from '../data/career';

export const careerHandlers = [
  // 관운 분석 — 실제 API 사용 (MSW 핸들러 제거)

  // AI 커리어 컨설팅
  http.post('/api/career/consultation', async () => {
    await delay(2400);
    return HttpResponse.json({
      success: true,
      data: mockConsultationData,
      error: null,
      timestamp: Date.now(),
    });
  }),
];
