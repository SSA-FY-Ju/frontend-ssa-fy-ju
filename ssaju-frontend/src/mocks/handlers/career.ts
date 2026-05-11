/**
 * MSW 커리어 API 핸들러
 */

import { http, HttpResponse, delay } from 'msw';
import { mockCareerTimingResult, mockConsultationData } from '../data/career';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const careerHandlers = [
  // 관운 분석
  http.post(`${BASE_URL}/api/career/timing`, async () => {
    await delay(500); // 실제 API 지연 시뮬레이션
    return HttpResponse.json({
      success: true,
      data: mockCareerTimingResult,
      error: null,
      timestamp: Date.now(),
    });
  }),

  // AI 컨설팅
  http.post(`${BASE_URL}/api/career/consultation`, async () => {
    await delay(1500); // AI 응답 지연 시뮬레이션
    return HttpResponse.json({
      success: true,
      data: mockConsultationData,
      error: null,
      timestamp: Date.now(),
    });
  }),
];
