/**
 * useHistoryDetail 훅 테스트 (T111)
 *
 * - fetchDetail 호출 후 record 설정 확인
 * - 에러 처리 확인
 * - reset 동작 확인
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useHistoryDetail } from '@/hooks/useHistoryDetail';

jest.mock('@/lib/api/mypage', () => ({
  fetchAnalysisRecord: jest.fn(),
}));

const { fetchAnalysisRecord } = jest.requireMock('@/lib/api/mypage');

const mockRecord = {
  recordId: 'record-001',
  userId: 'user-001',
  analysisType: 'CAREER_TIMING' as const,
  data: {
    sajuResultId: 'saju-001',
    h1Period: '2025년 상반기',
    h2Period: '2026년 하반기',
    h1Confidence: 82,
    h2Confidence: 65,
    recommendation: '상반기가 유리합니다.',
  },
  createdAt: Date.now(),
};

describe('useHistoryDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태: record null, isLoading false, error null', () => {
    const { result } = renderHook(() => useHistoryDetail());

    expect(result.current.record).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetchDetail 호출 중 isLoading true', async () => {
    fetchAnalysisRecord.mockReturnValueOnce(new Promise(() => {})); // 무한 대기

    const { result } = renderHook(() => useHistoryDetail());

    act(() => {
      result.current.fetchDetail('record-001');
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('fetchDetail 성공 후 record 설정됨', async () => {
    fetchAnalysisRecord.mockResolvedValueOnce(mockRecord);

    const { result } = renderHook(() => useHistoryDetail());

    await act(async () => {
      await result.current.fetchDetail('record-001');
    });

    expect(result.current.record).toEqual(mockRecord);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetchAnalysisRecord).toHaveBeenCalledWith('record-001');
  });

  it('fetchDetail 실패 시 error 설정됨', async () => {
    fetchAnalysisRecord.mockRejectedValueOnce(new Error('기록을 찾을 수 없습니다.'));

    const { result } = renderHook(() => useHistoryDetail());

    await act(async () => {
      await result.current.fetchDetail('invalid-id');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('기록을 찾을 수 없습니다.');
    expect(result.current.record).toBeNull();
  });

  it('reset 호출 시 상태 초기화', async () => {
    fetchAnalysisRecord.mockResolvedValueOnce(mockRecord);

    const { result } = renderHook(() => useHistoryDetail());

    await act(async () => {
      await result.current.fetchDetail('record-001');
    });

    expect(result.current.record).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.record).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
