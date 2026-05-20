/**
 * MSW 커리어 API 핸들러
 */

import { http, HttpResponse, delay } from 'msw';
import { mockCareerTimingResult } from '../data/career';

export const careerHandlers = [
  // 관운 분석
  http.post('/api/career/timing', async () => {
    await delay(1800);
    return HttpResponse.json({
      success: true,
      data: mockCareerTimingResult,
      error: null,
      timestamp: Date.now(),
    });
  }),
];
