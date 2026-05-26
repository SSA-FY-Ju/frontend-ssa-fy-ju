'use client';

/**
 * 기업명 자동완성 훅 — 금융위원회 기업기본정보 API (서버 프록시 경유)
 *
 * - 타이핑 시 /api/company/search 호출 (debounce 300ms)
 * - FSC_API_KEY는 서버에서만 사용 — 클라이언트에 노출 없음
 * - 키보드 네비게이션 상태 (highlightedIndex) 관리
 */

import { useState, useRef } from 'react';
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = (query: string) => {
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const key = query.trim().toLowerCase();

    // 클라이언트 캐시 히트 → 즉시 표시 (네트워크 요청 없음)
    const hit = clientCache.get(key);
    if (hit) {
      setSuggestions(hit);
      setIsOpen(hit.length > 0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/company/search?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) throw new Error('search failed');
        const data: { list: { corpName: string }[] } = await res.json();
        const result: DartCompany[] = data.list.map((item) => ({
          corpName: item.corpName,
          corpCode: '',
          stockCode: '',
        }));
        clientCache.set(key, result);
        setSuggestions(result);
        setIsOpen(result.length > 0);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);
  };

  const close = () => {
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const navigateUp = () => setHighlightedIndex((i) => Math.max(i - 1, 0));
  const navigateDown = () => setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));

  return { suggestions, isOpen, highlightedIndex, search, close, navigateUp, navigateDown };
}
