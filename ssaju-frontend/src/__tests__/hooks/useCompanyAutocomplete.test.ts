/**
 * useCompanyAutocomplete 훅 테스트
 *
 * 검증:
 * - 초기 상태
 * - search('') 드롭다운 닫기
 * - debounce 300ms 후 fetchCompanyAutocomplete 호출
 * - suggestions/isOpen 설정
 * - close() 상태 초기화
 * - navigateDown / navigateUp
 * - fetch 에러 시 초기화
 */

import { renderHook, act } from '@testing-library/react';
import { useCompanyAutocomplete } from '@/hooks/useCompanyAutocomplete';

jest.mock('@/lib/api/company', () => ({
  fetchCompanyAutocomplete: jest.fn(),
}));

const { fetchCompanyAutocomplete } = jest.requireMock('@/lib/api/company');

/** debounce 300ms 실행 후 pending 마이크로태스크 flush */
async function runDebounce() {
  jest.advanceTimersByTime(300);
  // 프로미스 체인이 완료될 때까지 다수의 마이크로태스크 tick 처리
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('useCompanyAutocomplete', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.useRealTimers();
  });

  it('초기 상태: 빈 suggestions, isOpen=false, highlightedIndex=-1', () => {
    const { result } = renderHook(() => useCompanyAutocomplete());

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.highlightedIndex).toBe(-1);
  });

  it("search('') 호출 시 suggestions 비우고 isOpen=false, API 호출 없음", async () => {
    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(fetchCompanyAutocomplete).not.toHaveBeenCalled();
  });

  it('공백만 입력 시 드롭다운 닫고 API 호출 안 함', async () => {
    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('   ');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(fetchCompanyAutocomplete).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });

  it('search(query) 호출 후 300ms 전에는 API 호출 안 함', () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: ['삼성전자'] });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성');
      jest.advanceTimersByTime(299);
    });

    expect(fetchCompanyAutocomplete).not.toHaveBeenCalled();
  });

  it('search(query) 호출 후 300ms 후 fetchCompanyAutocomplete 호출', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: ['삼성전자'] });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(fetchCompanyAutocomplete).toHaveBeenCalledWith({ query: '삼성' });
  });

  it('fetch 성공 시 suggestions 설정, isOpen=true', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({
      suggestions: ['삼성전자', '삼성SDS', '삼성생명'],
    });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.suggestions).toEqual(['삼성전자', '삼성SDS', '삼성생명']);
    expect(result.current.isOpen).toBe(true);
  });

  it('suggestions 최대 10개만 반환', async () => {
    const manySuggestions = Array.from({ length: 15 }, (_, i) => `기업${i}`);
    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: manySuggestions });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('기업');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.suggestions).toHaveLength(10);
  });

  it('빈 suggestions 반환 시 isOpen=false', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: [] });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('존재하지않는기업');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.suggestions).toEqual([]);
  });

  it('close() 호출 시 모든 상태 초기화', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: ['삼성전자'] });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.highlightedIndex).toBe(-1);
  });

  it('navigateDown 호출 시 highlightedIndex 증가', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({
      suggestions: ['삼성전자', '삼성SDS', '삼성생명'],
    });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.suggestions).toHaveLength(3);

    act(() => {
      result.current.navigateDown();
    });
    expect(result.current.highlightedIndex).toBe(0);

    act(() => {
      result.current.navigateDown();
    });
    expect(result.current.highlightedIndex).toBe(1);
  });

  it('navigateDown 호출 시 마지막 인덱스(suggestions.length-1)를 넘지 않음', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({
      suggestions: ['삼성전자', '삼성SDS'],
    });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.suggestions).toHaveLength(2);

    act(() => {
      result.current.navigateDown(); // 0
    });
    act(() => {
      result.current.navigateDown(); // 1
    });
    act(() => {
      result.current.navigateDown(); // 1 (마지막)
    });

    expect(result.current.highlightedIndex).toBe(1);
  });

  it('navigateUp 호출 시 highlightedIndex 감소, 0 미만으로 내려가지 않음', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({
      suggestions: ['삼성전자', '삼성SDS', '삼성생명'],
    });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.suggestions).toHaveLength(3);

    act(() => {
      result.current.navigateDown(); // 0
    });
    act(() => {
      result.current.navigateDown(); // 1
    });
    expect(result.current.highlightedIndex).toBe(1);

    act(() => {
      result.current.navigateUp(); // 0
    });
    expect(result.current.highlightedIndex).toBe(0);

    act(() => {
      result.current.navigateUp(); // 0 (미만으로 내려가지 않음)
    });
    expect(result.current.highlightedIndex).toBe(0);
  });

  it('fetch 에러 시 suggestions 비우고 isOpen=false', async () => {
    fetchCompanyAutocomplete.mockRejectedValueOnce(new Error('네트워크 오류'));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);
  });

  it('연속 검색 시 마지막 debounce만 실행됨 (이전 타이머 취소)', async () => {
    fetchCompanyAutocomplete.mockResolvedValue({ suggestions: ['결과'] });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼');
      jest.advanceTimersByTime(100);
      result.current.search('삼성');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(fetchCompanyAutocomplete).toHaveBeenCalledTimes(1);
    expect(fetchCompanyAutocomplete).toHaveBeenCalledWith({ query: '삼성' });
  });

  it('search 호출 시 highlightedIndex -1로 즉시 초기화', async () => {
    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: ['삼성전자', '삼성SDS'] });

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성');
    });

    await act(async () => {
      await runDebounce();
    });

    act(() => {
      result.current.navigateDown(); // 0
    });
    expect(result.current.highlightedIndex).toBe(0);

    fetchCompanyAutocomplete.mockResolvedValueOnce({ suggestions: ['LG전자'] });

    act(() => {
      result.current.search('LG');
    });

    // search 즉시 highlightedIndex 리셋
    expect(result.current.highlightedIndex).toBe(-1);
  });
});
