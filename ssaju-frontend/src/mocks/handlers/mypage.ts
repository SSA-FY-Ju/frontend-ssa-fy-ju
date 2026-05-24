/**
 * MSW 마이페이지 API 핸들러
 * API 명세(GET /api/mypage)에 맞춰 업데이트
 */

import { http, HttpResponse, delay } from 'msw';
import type { MyPageData } from '@/types/api';

/** 목 마이페이지 데이터 */
export const mockMyPageData: MyPageData = {
  profile: {
    id: 1,
    name: '김사주',
    email: 'test@example.com',
    createdAt: '2026-01-01T00:00:00',
    lastLoginAt: '2026-05-24T00:00:00',
  },
  analyses: [
    {
      id: 101,
      type: 'TIMING',
      birthDate: '1995-06-15',
      createdAt: '2026-05-20T14:30:00',
      favoredPeriod: 'H1',
      confidenceScore: 82,
    },
    {
      id: 102,
      type: 'CONSULTATION',
      birthDate: '1995-06-15',
      createdAt: '2026-05-19T10:00:00',
      favoredPeriod: 'H2',
      confidenceScore: 75,
    },
    {
      id: 103,
      type: 'COMPATIBILITY',
      birthDate: '1995-06-15',
      createdAt: '2026-05-18T16:20:00',
    },
    {
      id: 104,
      type: 'TIMING',
      birthDate: '1995-06-15',
      createdAt: '2026-05-10T09:00:00',
      favoredPeriod: 'H2',
      confidenceScore: 68,
    },
    {
      id: 105,
      type: 'CONSULTATION',
      birthDate: '1995-06-15',
      createdAt: '2026-04-28T13:45:00',
      favoredPeriod: 'H1',
      confidenceScore: 91,
    },
    {
      id: 106,
      type: 'COMPATIBILITY',
      birthDate: '1995-06-15',
      createdAt: '2026-04-15T11:30:00',
    },
  ],
  pagination: {
    page: 0,
    size: 10,
    total: 6,
    totalPages: 1,
  },
};

export const mypageHandlers = [
  /** 마이페이지 조회 */
  http.get('/api/mypage', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    let filteredAnalyses = mockMyPageData.analyses;
    if (type) {
      filteredAnalyses = mockMyPageData.analyses.filter((a) => a.type === type);
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...mockMyPageData,
        analyses: filteredAnalyses,
        totalCount: filteredAnalyses.length,
        totalPages: 1,
      },
      message: '마이페이지 조회 성공',
      timestamp: new Date().toISOString(),
    });
  }),

  /** 분석 결과 상세 조회 */
  http.get('/api/mypage/analyses/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    const found = mockMyPageData.analyses.find((a) => a.id === Number(id));

    return HttpResponse.json({
      success: true,
      data: {
        id: Number(id),
        type: type ?? found?.type,
        birthDate: found?.birthDate ?? '1995-06-15',
        createdAt: found?.createdAt ?? new Date().toISOString(),
        favoredPeriod: found?.favoredPeriod,
        confidenceScore: found?.confidenceScore,
      },
      message: '분석 결과 조회 성공',
      timestamp: new Date().toISOString(),
    });
  }),

  /** 기록 삭제 */
  http.delete('/api/my-page/history/:id', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: null,
      message: '삭제 성공',
      timestamp: new Date().toISOString(),
    });
  }),
];
