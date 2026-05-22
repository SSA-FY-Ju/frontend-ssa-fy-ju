/**
 * API 래퍼 함수 테스트 (career.ts, auth.ts)
 *
 * 커버리지 대상:
 * - src/lib/api/career.ts (fetchCareerTiming, fetchConsultation)
 * - src/lib/api/auth.ts (fetchAuthStatus, logout)
 */

import { fetchCareerTiming, fetchConsultation } from '@/lib/api/career';
import { login, logout } from '@/lib/api/auth';
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
      fetchCareerTiming({ birthDate: '1990-10-10', birthTime: '14:30' }),
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

    const request = { birthDate: '1990-10-10', birthTime: '14:30' };
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
      fetchConsultation({ birthDate: '1990-10-10' }),
    ).rejects.toThrow('AI 타임아웃');
  });
});

// ─────────────────────────────────────────────────────────────
// auth.ts
// ─────────────────────────────────────────────────────────────

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('올바른 경로와 옵션으로 apiFetch 호출', async () => {
    apiFetch.mockResolvedValueOnce({ accessToken: 'tok', accessTokenExpiresIn: 3600 });

    const result = await login({ email: 'a@b.com', password: 'password1' });

    expect(apiFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: { email: 'a@b.com', password: 'password1' },
    }));
    expect(result.accessToken).toBe('tok');
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('이메일 또는 비밀번호 오류'));

    await expect(login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow('이메일 또는 비밀번호 오류');
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
      sajuResultId: 1001,
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
        sajuResultId: 1001,
        feedbackType: 'CAREER_TIMING',
        satisfactionStatus: 'DISSATISFIED',
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
