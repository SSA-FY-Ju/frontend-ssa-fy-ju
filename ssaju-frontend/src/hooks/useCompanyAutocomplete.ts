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
import type { DartCompany } from '@/lib/api/company';

export type { DartCompany };

// 클라이언트 메모리 캐시 — 같은 쿼리는 네트워크 요청 없이 즉시 반환
const clientCache = new Map<string, DartCompany[]>();

/** 더 이상 프리로드가 필요 없지만 호출부 하위 호환을 위해 유지 */
export function preloadCorpList() {
  // no-op: FSC API는 요청 시 호출
}

export function useCompanyAutocomplete() {
  const [suggestions, setSuggestions] = useState<DartCompany[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
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

  const search = (query: string) => {
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    // 검색창을 비우거나 캐시에서 즉시 표시하는 경우에도 이전 요청은 무효화해야 한다
    const seq = invalidatePending();

    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    const key = query.trim().toLowerCase();

    // 클라이언트 캐시 히트 → 즉시 표시 (네트워크 요청 없음)
    const hit = clientCache.get(key);
    if (hit) {
      setSuggestions(hit);
      setIsOpen(hit.length > 0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await axiosInstance.get<{ list: { corpName: string }[] }>('/api/company/search', {
          params: { q: query.trim() },
          signal: controller.signal,
        });
        const data = res.data;
        const result: DartCompany[] = data.list.map((item) => ({
          corpName: item.corpName,
          corpCode: '',
          stockCode: '',
        }));
        // 늦게 온 응답도 그 검색어에 대해서는 맞는 데이터이므로 캐시에는 넣고, 화면 반영만 버린다
        clientCache.set(key, result);
        if (seq !== requestSeqRef.current) return;
        setSuggestions(result);
        setIsOpen(result.length > 0);
      } catch {
        if (seq !== requestSeqRef.current) return;
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        if (seq === requestSeqRef.current) setIsLoading(false);
      }
    }, 300);
  };

  const close = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    invalidatePending();
    setSuggestions([]);
    setIsOpen(false);
    setIsLoading(false);
    setHighlightedIndex(-1);
  };

  const navigateUp = () => setHighlightedIndex((i) => Math.max(i - 1, 0));
  const navigateDown = () => setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));

  return { suggestions, isOpen, isLoading, highlightedIndex, search, close, navigateUp, navigateDown };
}
