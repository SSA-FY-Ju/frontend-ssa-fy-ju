/**
 * useCompanyInfo 훅 테스트 (T090)
 *
 * 검증:
 * - 기업 조회 성공 → found 상태, suggestions 반환
 * - 기업 조회 실패(빈 배열) → not_found 상태
 * - 기업 조회 API 에러 → not_found 상태 + error 메시지
 * - 수동 입력 전환 → manual 상태
 * - confirmCompany → manual 상태로 전환
 * - reset → idle 상태로 초기화
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';

jest.mock('@/lib/api/company', () => ({
  fetchCompanyAutocomplete: jest.fn(),
  fetchCompatibility: jest.fn(),
}));

const { fetchCompanyAutocomplete } = jest.requireMock('@/lib/api/company');

describe('useCompanyInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태 idle, suggestions 빈 배열', () => {
    const { result } = renderHook(() => useCompanyInfo());

    expect(result.current.status).toBe('idle');
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.companyName).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('lookupCompany 호출 시 loading 상태 → 성공 시 found 상태', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({
      suggestions: ['삼성전자', '삼성SDS'],
    });

    const { result } = renderHook(() => useCompanyInfo());

    await act(async () => {
      await result.current.lookupCompany('삼성');
    });

    expect(result.current.status).toBe('found');
    expect(result.current.suggestions).toEqual(['삼성전자', '삼성SDS']);
    expect(result.current.companyName).toBe('삼성');
    expect(result.current.error).toBeNull();
  });

  it('빈 suggestions 반환 시 not_found 상태', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: [] });

    const { result } = renderHook(() => useCompanyInfo());

    await act(async () => {
      await result.current.lookupCompany('존재하지않는기업xyz');
    });

    expect(result.current.status).toBe('not_found');
    expect(result.current.suggestions).toEqual([]);
  });

  it('API 에러 시 not_found 상태 + error 메시지 (수동 입력 폴백)', async () => {
    fetchCompanyAutocomplete.mockRejectedValueOnce(new Error('네트워크 오류'));

    const { result } = renderHook(() => useCompanyInfo());

    await act(async () => {
      await result.current.lookupCompany('삼성전자');
    });

    expect(result.current.status).toBe('not_found');
    expect(result.current.error).toBeTruthy();
  });

  it('suggestions 최대 10개만 반환', async () => {
    const manySuggestions = Array.from({ length: 15 }, (_, i) => `기업${i}`);
    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: manySuggestions });

    const { result } = renderHook(() => useCompanyInfo());

    await act(async () => {
      await result.current.lookupCompany('기업');
    });

    expect(result.current.suggestions).toHaveLength(10);
  });

  it('switchToManual 호출 시 manual 상태 전환', () => {
    const { result } = renderHook(() => useCompanyInfo());

    act(() => {
      result.current.switchToManual();
    });

    expect(result.current.status).toBe('manual');
    expect(result.current.suggestions).toEqual([]);
  });

  it('confirmCompany 호출 시 컴퍼니명 업데이트 및 manual 상태', () => {
    const { result } = renderHook(() => useCompanyInfo());

    act(() => {
      result.current.confirmCompany('삼성전자');
    });

    expect(result.current.companyName).toBe('삼성전자');
    expect(result.current.status).toBe('manual');
  });

  it('reset 호출 시 전체 초기화', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: ['삼성전자'] });

    const { result } = renderHook(() => useCompanyInfo());

    await act(async () => {
      await result.current.lookupCompany('삼성');
    });

    await waitFor(() => expect(result.current.status).toBe('found'));

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.companyName).toBe('');
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
