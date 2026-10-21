'use client';

/**
 * 기업명 자동완성 훅 — 금융위원회 기업기본정보 API (서버 프록시 경유)
 *
 * - 타이핑 시 /api/company/search 호출 (debounce 300ms)
 * - FSC_API_KEY는 서버에서만 사용 — 클라이언트에 노출 없음
 * - 키보드 네비게이션 상태 (highlightedIndex) 관리
 */

import { useState, useRef, useEffect } from 'react';
import { axiosInstance } from '@/lib/api/client';
import type { CompanySuggestion } from '@/lib/api/company';

export type { CompanySuggestion };

// 클라이언트 메모리 캐시 — 같은 쿼리는 네트워크 요청 없이 즉시 반환.
// 금융위 검색은 대소문자를 구분해서 "LG"와 "lg"의 결과가 다르므로 키를 소문자로 합치지 않는다.
const clientCache = new Map<string, CompanySuggestion[]>();

// 서버가 외부 API 를 6초에 끊으므로, 브라우저는 그보다 길게 기다리되 서버 콜드 스타트와
// 네트워크 여유를 더한 만큼만 기다린다. 서버까지 응답하지 못하는 경우의 안전장치다.
const CLIENT_TIMEOUT_MS = 9000;

/**
 * 'TIMEOUT' 은 응답이 너무 늦은 경우, 'UNAVAILABLE' 은 외부 API 장애가 이어져 서버가 잠시 호출을 멈춘 경우,
 * 'FAILED' 는 그 밖의 이유로 불러오지 못한 경우
 */
export type CompanySearchError = 'TIMEOUT' | 'UNAVAILABLE' | 'FAILED';

function classifyError(err: unknown): CompanySearchError {
  const e = err as { response?: { status?: number }; code?: string };
  if (e.response?.status === 504 || e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') return 'TIMEOUT';
  if (e.response?.status === 503) return 'UNAVAILABLE';
  return 'FAILED';
}

export function useCompanyAutocomplete() {
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [error, setError] = useState<CompanySearchError | null>(null);
  const lastQueryRef = useRef('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 응답은 보낸 순서대로 도착하지 않는다. 느린 이전 검색어의 응답이 나중에 도착해 지금 입력에
  // 맞는 목록을 덮어쓰지 않도록, 요청마다 순번을 매기고 가장 최근 순번의 응답만 화면에 반영한다.
  const requestSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  /** 진행 중인 요청을 무효화하고 새 순번을 돌려준다. 취소는 네트워크 낭비를 줄이는 보조 수단이다. */
  const invalidatePending = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    return ++requestSeqRef.current;
  };

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      invalidatePending();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const runRequest = async (query: string, key: string, seq: number) => {
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await axiosInstance.get<{ list: { corpName: string }[] }>('/api/company/search', {
        params: { q: query.trim() },
        signal: controller.signal,
        timeout: CLIENT_TIMEOUT_MS,
      });
      const data = res.data;
      const result: CompanySuggestion[] = data.list.map((item) => ({ corpName: item.corpName }));
      // 늦게 온 응답도 그 검색어에 대해서는 맞는 데이터이므로 캐시에는 넣고, 화면 반영만 버린다
      clientCache.set(key, result);
      if (seq !== requestSeqRef.current) return;
      setSuggestions(result);
      setIsOpen(result.length > 0);
    } catch (err) {
      // 검색어를 바꿔서 취소된 이전 요청은 순번이 달라 여기서 걸러진다 - 취소를 오류로 보여주지 않는다
      if (seq !== requestSeqRef.current) return;
      setSuggestions([]);
      setIsOpen(false);
      setError(classifyError(err));
    } finally {
      if (seq === requestSeqRef.current) setIsLoading(false);
    }
  };

  const search = (query: string) => {
    setHighlightedIndex(-1);
    setError(null);
    lastQueryRef.current = query;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    // 검색창을 비우거나 캐시에서 즉시 표시하는 경우에도 이전 요청은 무효화해야 한다
    const seq = invalidatePending();

    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    const key = query.trim();

    // 클라이언트 캐시 히트 → 즉시 표시 (네트워크 요청 없음)
    const hit = clientCache.get(key);
    if (hit) {
      setSuggestions(hit);
      setIsOpen(hit.length > 0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(() => {
      void runRequest(query, key, seq);
    }, 300);
  };

  /** 실패한 검색어를 입력은 그대로 둔 채 디바운스 없이 바로 다시 요청한다 */
  const retry = () => {
    const query = lastQueryRef.current;
    if (!query.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const seq = invalidatePending();
    setError(null);
    setIsLoading(true);
    void runRequest(query, query.trim(), seq);
  };

  const close = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    invalidatePending();
    setSuggestions([]);
    setIsOpen(false);
    setIsLoading(false);
    setHighlightedIndex(-1);
    setError(null);
  };

  const navigateUp = () => setHighlightedIndex((i) => Math.max(i - 1, 0));
  const navigateDown = () => setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));

  return { suggestions, isOpen, isLoading, error, highlightedIndex, search, retry, close, navigateUp, navigateDown };
}
