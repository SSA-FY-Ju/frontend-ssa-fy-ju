/**
 * MSW 피드백 API 핸들러
 */

import { http, HttpResponse, delay } from 'msw';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const feedbackHandlers = [
  http.post(`${BASE_URL}/api/feedback/satisfaction`, async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        feedbackId: `feedback-${Date.now()}`,
      },
      error: null,
      timestamp: Date.now(),
    });
  }),
];
