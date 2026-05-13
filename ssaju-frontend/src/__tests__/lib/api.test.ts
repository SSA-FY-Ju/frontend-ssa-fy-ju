/**
 * API 래퍼 함수 테스트 (career.ts, auth.ts)
 *
 * 커버리지 대상:
 * - src/lib/api/career.ts (fetchCareerTiming, fetchConsultation)
 * - src/lib/api/auth.ts (fetchAuthStatus, logout)
 */

import { fetchCareerTiming, fetchConsultation } from '@/lib/api/career';
import { fetchAuthStatus, logout } from '@/lib/api/auth';
import { submitFeedback } from '@/lib/api/feedback';

// apiFetch 전체 모킹
jest.mock('@/lib/api/client', () => ({
  apiFetch: jest.fn(),
}));

const { apiFetch } = jest.requireMock('@/lib/api/client');

// ─────────────────────────────────────────────────────────────
// career.ts
// ─────────────────────────────────────────────────────────────

describe('fetchCareerTiming', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('올바른 경로와 옵션으로 apiFetch 호출', async () => {
    const mockResult = {
      sajuResultId: 'saju-001',
      h1Period: '2025 상반기',
      h2Period: '2026 하반기',
      h1Confidence: 80,
      h2Confidence: 60,
      recommendation: '상반기가 유리합니다.',
    };
    apiFetch.mockResolvedValueOnce(mockResult);

    const request = { birthDate: '1990-10-10', birthTime: '14:30', solarType: 'SOLAR' as const };
    const result = await fetchCareerTiming(request);

    expect(apiFetch).toHaveBeenCalledWith('/api/career/timing', {
      method: 'POST',
      body: request,
      timeout: 10000,
    });
    expect(result).toEqual(mockResult);
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('타임아웃'));

    await expect(
      fetchCareerTiming({ birthDate: '1990-10-10', birthTime: '14:30', solarType: 'SOLAR' }),
    ).rejects.toThrow('타임아웃');
  });
});

describe('fetchConsultation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('올바른 경로와 옵션으로 apiFetch 호출', async () => {
    const mockData = { sajuResultId: 'saju-001', recommendedIndustries: [] };
    apiFetch.mockResolvedValueOnce(mockData);

    const request = { birthDate: '1990-10-10', birthTime: '14:30', solarType: 'SOLAR' as const };
    const result = await fetchConsultation(request);

    expect(apiFetch).toHaveBeenCalledWith('/api/career/consultation', {
      method: 'POST',
      body: request,
      timeout: 15000,
    });
    expect(result).toEqual(mockData);
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('AI 타임아웃'));

    await expect(
      fetchConsultation({ birthDate: '1990-10-10', solarType: 'SOLAR' }),
    ).rejects.toThrow('AI 타임아웃');
  });
});

// ─────────────────────────────────────────────────────────────
// auth.ts
// ─────────────────────────────────────────────────────────────

describe('fetchAuthStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('로그인 상태 확인 — 비로그인 응답', async () => {
    apiFetch.mockResolvedValueOnce({ isLoggedIn: false, user: null });

    const result = await fetchAuthStatus();

    expect(apiFetch).toHaveBeenCalledWith('/api/auth/status', {
      method: 'GET',
      timeout: 5000,
      retry: { maxAttempts: 1 },
    });
    expect(result).toEqual({ isLoggedIn: false, user: null });
  });

  it('로그인 상태 확인 — 로그인 응답', async () => {
    const mockUser = { userId: 'user-001', name: '테스트', socialProvider: 'KAKAO' as const };
    apiFetch.mockResolvedValueOnce({ isLoggedIn: true, user: mockUser });

    const result = await fetchAuthStatus();

    expect(result.isLoggedIn).toBe(true);
    expect(result.user?.userId).toBe('user-001');
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('네트워크 오류'));

    await expect(fetchAuthStatus()).rejects.toThrow('네트워크 오류');
  });
});

// ─────────────────────────────────────────────────────────────
// feedback.ts
// ─────────────────────────────────────────────────────────────

describe('submitFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('올바른 경로와 옵션으로 apiFetch 호출', async () => {
    apiFetch.mockResolvedValueOnce({ success: true });

    const request = {
      sajuResultId: 'saju-001',
      feedbackType: 'CAREER_TIMING' as const,
      satisfactionStatus: 'SATISFIED' as const,
      feedbackContent: '매우 도움이 됐습니다.',
    };
    const result = await submitFeedback(request);

    expect(apiFetch).toHaveBeenCalledWith('/api/feedback/satisfaction', {
      method: 'POST',
      body: request,
      timeout: 10000,
    });
    expect(result).toEqual({ success: true });
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('피드백 제출 실패'));

    await expect(
      submitFeedback({
        sajuResultId: 'saju-001',
        feedbackType: 'CAREER_TIMING',
        satisfactionStatus: 'UNSATISFIED',
      }),
    ).rejects.toThrow('피드백 제출 실패');
  });
});

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('올바른 경로와 옵션으로 apiFetch 호출', async () => {
    apiFetch.mockResolvedValueOnce(undefined);

    await logout();

    expect(apiFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      timeout: 5000,
      retry: { maxAttempts: 1 },
    });
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('서버 오류'));

    await expect(logout()).rejects.toThrow('서버 오류');
  });
});
