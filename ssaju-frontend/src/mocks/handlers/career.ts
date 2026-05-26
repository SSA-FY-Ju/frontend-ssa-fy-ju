/**
 * MSW 커리어 API 핸들러
 */

import { http, HttpResponse, delay } from 'msw';
import { mockCareerTimingResult, mockConsultationData } from '../data/career';

export const careerHandlers = [
  // 관운 분석
  http.post('/api/career/timing', async () => {
    await delay(1200);
    return HttpResponse.json({
      success: true,
      data: mockCareerTimingResult,
      error: null,
      timestamp: Date.now(),
    });
  }),

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
