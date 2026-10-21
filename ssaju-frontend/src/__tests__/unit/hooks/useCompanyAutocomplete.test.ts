/**
 * useCompanyAutocomplete 훅 테스트
 *
 * 현재 구현 기준: fetchCompanyAutocomplete API 래퍼가 아니라
 * axiosInstance.get('/api/company/search', { params: { q } })를 직접 호출하고,
 * CompanySuggestion[]({corpName}) 형태로 결과를 저장한다.
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
  return { corpName };
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

    expect(mockGet).toHaveBeenCalledWith('/api/company/search', expect.objectContaining({ params: { q: '현대차_B' } }));
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
    expect(result.current.error).toBe('FAILED');
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
    expect(mockGet).toHaveBeenCalledWith('/api/company/search', expect.objectContaining({ params: { q: '삼성_G' } }));
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

  // 외부 API 가 느리거나 실패했을 때 "결과 없음"과 구분해 안내하고, 입력을 유지한 채 다시 시도한다
  describe('느리거나 실패한 응답', () => {
    it('요청에 브라우저 쪽 대기 상한을 함께 보낸다', async () => {
      mockGet.mockResolvedValueOnce(companyListResponse(['삼성전자']));
      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('느린응답_1'); });
      await act(async () => { await runDebounce(); });

      expect(mockGet).toHaveBeenCalledWith('/api/company/search', expect.objectContaining({ timeout: 9000 }));
    });

    it('서버가 504 로 응답하면 시간 초과로 안내한다', async () => {
      mockGet.mockRejectedValueOnce({ response: { status: 504 } });
      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('느린응답_2'); });
      await act(async () => { await runDebounce(); });

      expect(result.current.error).toBe('TIMEOUT');
      expect(result.current.isLoading).toBe(false);
    });

    it('브라우저 대기 상한을 넘기면 시간 초과로 안내한다', async () => {
      mockGet.mockRejectedValueOnce({ code: 'ECONNABORTED' });
      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('느린응답_3'); });
      await act(async () => { await runDebounce(); });

      expect(result.current.error).toBe('TIMEOUT');
    });

    it('새로 검색하면 이전 오류 안내를 지운다', async () => {
      mockGet.mockRejectedValueOnce({ response: { status: 502 } });
      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('느린응답_4'); });
      await act(async () => { await runDebounce(); });
      expect(result.current.error).toBe('FAILED');

      act(() => { result.current.search('느린응답_4_수정'); });

      expect(result.current.error).toBeNull();
    });

    it('다시 시도하면 디바운스 없이 같은 검색어로 바로 요청하고, 성공하면 안내를 지운다', async () => {
      mockGet
        .mockRejectedValueOnce({ response: { status: 504 } })
        .mockResolvedValueOnce(companyListResponse(['삼성전자']));
      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('느린응답_5'); });
      await act(async () => { await runDebounce(); });
      expect(result.current.error).toBe('TIMEOUT');

      await act(async () => {
        result.current.retry();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(mockGet).toHaveBeenLastCalledWith('/api/company/search', expect.objectContaining({ params: { q: '느린응답_5' } }));
      expect(result.current.suggestions).toEqual([company('삼성전자')]);
      expect(result.current.error).toBeNull();
    });

    it('검색어를 바꿔서 취소된 이전 요청의 실패는 오류로 보여주지 않는다', async () => {
      let rejectFirst!: (reason: unknown) => void;
      mockGet
        .mockReturnValueOnce(new Promise((_, reject) => { rejectFirst = reject; }))
        .mockResolvedValueOnce(companyListResponse(['LG전자']));
      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('취소_삼성'); });
      await act(async () => { await runDebounce(); });
      act(() => { result.current.search('취소_LG'); });
      await act(async () => { await runDebounce(); });

      await act(async () => { rejectFirst({ code: 'ERR_CANCELED' }); await Promise.resolve(); });

      expect(result.current.error).toBeNull();
      expect(result.current.suggestions).toEqual([company('LG전자')]);
    });

    it('서버가 연속 장애로 호출을 멈춘 503 이면 잠시 멈춤으로 안내한다', async () => {
      mockGet.mockRejectedValueOnce({ response: { status: 503 } });
      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('느린응답_7'); });
      await act(async () => { await runDebounce(); });

      expect(result.current.error).toBe('UNAVAILABLE');
    });

    it('목록을 닫으면 오류 안내도 지운다', async () => {
      mockGet.mockRejectedValueOnce({ response: { status: 504 } });
      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('느린응답_6'); });
      await act(async () => { await runDebounce(); });
      act(() => { result.current.close(); });

      expect(result.current.error).toBeNull();
    });
  });

  it('대소문자가 다른 검색어는 캐시를 따로 쓴다 - 금융위 검색은 대소문자를 구분한다', async () => {
    mockGet
      .mockResolvedValueOnce(companyListResponse(['(주)lg소문자']))
      .mockResolvedValueOnce(companyListResponse(['LG전자(주)']));
    const { result } = renderHook(() => useCompanyAutocomplete());

    act(() => { result.current.search('lg'); });
    await act(async () => { await runDebounce(); });
    act(() => { result.current.search('LG'); });
    await act(async () => { await runDebounce(); });

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result.current.suggestions).toEqual([company('LG전자(주)')]);
  });

  // 응답이 보낸 순서와 다르게 도착하는 경우. 이전 요청의 응답을 직접 늦게 풀어 순서를 통제한다.
  describe('늦게 도착하는 응답', () => {
    function deferred<T>() {
      let resolve!: (v: T) => void;
      const promise = new Promise<T>((r) => { resolve = r; });
      return { promise, resolve };
    }

    it('이전 검색어의 응답이 나중에 와도 현재 검색어의 목록을 덮어쓰지 않는다', async () => {
      const slow = deferred<ReturnType<typeof companyListResponse>>();
      mockGet
        .mockReturnValueOnce(slow.promise)
        .mockResolvedValueOnce(companyListResponse(['LG전자']));

      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('늦은응답_삼성_1'); });
      await act(async () => { await runDebounce(); });
      act(() => { result.current.search('늦은응답_LG_1'); });
      await act(async () => { await runDebounce(); });
      expect(result.current.suggestions).toEqual([company('LG전자')]);

      await act(async () => { slow.resolve(companyListResponse(['삼성전자'])); await Promise.resolve(); });

      expect(result.current.suggestions).toEqual([company('LG전자')]);
    });

    it('검색창을 비운 뒤 도착한 응답은 목록을 다시 열지 않는다', async () => {
      const slow = deferred<ReturnType<typeof companyListResponse>>();
      mockGet.mockReturnValueOnce(slow.promise);

      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('늦은응답_삼성_2'); });
      await act(async () => { await runDebounce(); });
      act(() => { result.current.search(''); });

      await act(async () => { slow.resolve(companyListResponse(['삼성전자'])); await Promise.resolve(); });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.suggestions).toEqual([]);
    });

    it('목록을 닫은 뒤 도착한 응답은 목록을 다시 열지 않고 로딩도 끝낸다', async () => {
      const slow = deferred<ReturnType<typeof companyListResponse>>();
      mockGet.mockReturnValueOnce(slow.promise);

      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('늦은응답_삼성_3'); });
      await act(async () => { await runDebounce(); });
      act(() => { result.current.close(); });

      await act(async () => { slow.resolve(companyListResponse(['삼성전자'])); await Promise.resolve(); });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('화면에 반영하지 않은 늦은 응답도 그 검색어의 캐시에는 저장한다', async () => {
      const slow = deferred<ReturnType<typeof companyListResponse>>();
      mockGet.mockReturnValueOnce(slow.promise);

      const { result } = renderHook(() => useCompanyAutocomplete());

      act(() => { result.current.search('늦은응답_삼성_4'); });
      await act(async () => { await runDebounce(); });
      act(() => { result.current.search(''); });
      await act(async () => { slow.resolve(companyListResponse(['삼성전자'])); await Promise.resolve(); });

      act(() => { result.current.search('늦은응답_삼성_4'); });

      expect(result.current.suggestions).toEqual([company('삼성전자')]);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });
});
