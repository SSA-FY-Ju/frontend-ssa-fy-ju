/**
 * MSW 마이페이지 API 핸들러 (T109)
 *
 * 엔드포인트:
 * - POST /api/my-page/history       — 분석 기록 목록
 * - GET  /api/my-page/history/:id   — 분석 기록 상세
 * - DELETE /api/my-page/history/:id — 분석 기록 삭제
 */

import { http, HttpResponse, delay } from 'msw';
import type { AnalysisRecord, AnalysisHistoryResponse } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/** 목 분석 기록 데이터 (CAREER_TIMING 3개) */
export const mockAnalysisRecords: AnalysisRecord[] = [
  {
    recordId: 'record-001',
    userId: 'user-001',
    analysisType: 'CAREER_TIMING',
    data: {
      sajuResultId: 'saju-001',
      h1Period: '2025년 상반기',
      h2Period: '2026년 하반기',
      h1Confidence: 82,
      h2Confidence: 65,
      recommendation: '2025년 상반기가 취업 활동에 가장 유리한 시기입니다.',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3일 전
  },
  {
    recordId: 'record-002',
    userId: 'user-001',
    analysisType: 'CAREER_TIMING',
    data: {
      sajuResultId: 'saju-002',
      h1Period: '2025년 하반기',
      h2Period: '2026년 상반기',
      h1Confidence: 70,
      h2Confidence: 88,
      recommendation: '2026년 상반기에 더 큰 기회가 열립니다.',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10일 전
  },
  {
    recordId: 'record-003',
    userId: 'user-001',
    analysisType: 'CAREER_TIMING',
    data: {
      sajuResultId: 'saju-003',
      h1Period: '2024년 하반기',
      h2Period: '2025년 하반기',
      h1Confidence: 55,
      h2Confidence: 75,
      recommendation: '2025년 하반기를 목표로 준비하세요.',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30일 전
  },
];

export const mypageHandlers = [
  /** 분석 기록 목록 */
  http.post(`${BASE_URL}/api/my-page/history`, async () => {
    await delay(300);
    const response: AnalysisHistoryResponse = {
      records: mockAnalysisRecords,
      hasMore: false,
      total: mockAnalysisRecords.length,
    };
    return HttpResponse.json({
      success: true,
      data: response,
      error: null,
      timestamp: Date.now(),
    });
  }),

  /** 분석 기록 상세 */
  http.get(`${BASE_URL}/api/my-page/history/:id`, async ({ params }) => {
    await delay(200);
    const { id } = params;
    const record = mockAnalysisRecords.find((r) => r.recordId === id);

    if (!record) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'NOT_FOUND', message: '기록을 찾을 수 없습니다.', requestId: 'req-001' },
          timestamp: Date.now(),
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: record,
      error: null,
      timestamp: Date.now(),
    });
  }),

  /** 분석 기록 삭제 */
  http.delete(`${BASE_URL}/api/my-page/history/:id`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: null,
      error: null,
      timestamp: Date.now(),
    });
  }),
];
