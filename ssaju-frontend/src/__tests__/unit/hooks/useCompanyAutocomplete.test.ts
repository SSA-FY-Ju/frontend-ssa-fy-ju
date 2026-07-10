/**
 * useCompanyAutocomplete 훅 테스트
 *
 * 현재 구현 기준: fetchCompanyAutocomplete API 래퍼가 아니라
 * axiosInstance.get('/api/company/search', { params: { q } })를 직접 호출하고,
 * DartCompany[]({corpName, corpCode, stockCode}) 형태로 결과를 저장한다.
 * 조회 결과는 모듈 레벨 clientCache에 쿼리별로 캐시되므로, 테스트마다
 * 서로 다른 검색어를 써서 캐시 충돌(=axios 재호출 안 됨)을 피한다.
 *
 * 검증:
 * - 초기 상태
 * - search('') 드롭다운 닫기
 * - debounce 300ms 후 axiosInstance.get 호출
 * - suggestions/isOpen 설정
 * - close() 상태 초기화
 * - navigateDown / navigateUp
 * - fetch 에러 시 초기화
 */

import { renderHook, act } from '@testing-library/react';
import { useCompanyAutocomplete } from '@/hooks/useCompanyAutocomplete';
import { axiosInstance } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  axiosInstance: { get: jest.fn() },
}));

const mockGet = axiosInstance.get as jest.Mock;

function companyListResponse(names: string[]) {
  return { data: { list: names.map((corpName) => ({ corpName })) } };
}

function company(corpName: string) {
  return { corpName, corpCode: '', stockCode: '' };
}

/** debounce 300ms 실행 후 pending 마이크로태스크 flush */
async function runDebounce() {
  jest.advanceTimersByTime(300);
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
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('공백만 입력 시 드롭다운 닫고 API 호출 안 함', async () => {
    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('   ');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });

  it('search(query) 호출 후 300ms 전에는 API 호출 안 함', () => {
    mockGet.mockResolvedValueOnce(companyListResponse(['현대자동차']));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('현대차_A');
      jest.advanceTimersByTime(299);
    });

    expect(mockGet).not.toHaveBeenCalled();
  });

  it('search(query) 호출 후 300ms 후 axiosInstance.get 호출', async () => {
    mockGet.mockResolvedValueOnce(companyListResponse(['현대자동차']));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('현대차_B');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(mockGet).toHaveBeenCalledWith('/api/company/search', { params: { q: '현대차_B' } });
  });

  it('fetch 성공 시 suggestions 설정, isOpen=true', async () => {
    mockGet.mockResolvedValueOnce(companyListResponse(['삼성전자', '삼성SDS', '삼성생명']));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성_A');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.suggestions).toEqual([
      company('삼성전자'),
      company('삼성SDS'),
      company('삼성생명'),
    ]);
    expect(result.current.isOpen).toBe(true);
  });

  it('빈 suggestions 반환 시 isOpen=false', async () => {
    mockGet.mockResolvedValueOnce(companyListResponse([]));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('존재하지않는기업_A');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.suggestions).toEqual([]);
  });

  it('close() 호출 시 모든 상태 초기화', async () => {
    mockGet.mockResolvedValueOnce(companyListResponse(['삼성전자']));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성_B');
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
    mockGet.mockResolvedValueOnce(companyListResponse(['삼성전자', '삼성SDS', '삼성생명']));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성_C');
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
    mockGet.mockResolvedValueOnce(companyListResponse(['삼성전자', '삼성SDS']));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성_D');
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
    mockGet.mockResolvedValueOnce(companyListResponse(['삼성전자', '삼성SDS', '삼성생명']));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성_E');
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
    mockGet.mockRejectedValueOnce(new Error('네트워크 오류'));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성_F');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);
  });

  it('연속 검색 시 마지막 debounce만 실행됨 (이전 타이머 취소)', async () => {
    mockGet.mockResolvedValue(companyListResponse(['결과']));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼_G');
      jest.advanceTimersByTime(100);
      result.current.search('삼성_G');
    });

    await act(async () => {
      await runDebounce();
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/api/company/search', { params: { q: '삼성_G' } });
  });

  it('search 호출 시 highlightedIndex -1로 즉시 초기화', async () => {
    mockGet.mockResolvedValueOnce(companyListResponse(['삼성전자', '삼성SDS']));

    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => {
      result.current.search('삼성_H');
    });

    await act(async () => {
      await runDebounce();
    });

    act(() => {
      result.current.navigateDown(); // 0
    });
    expect(result.current.highlightedIndex).toBe(0);

    mockGet.mockResolvedValueOnce(companyListResponse(['LG전자']));

    act(() => {
      result.current.search('LG_H');
    });

    // search 즉시 highlightedIndex 리셋
    expect(result.current.highlightedIndex).toBe(-1);
  });
});
