'use client';

/**
 * 기업명 자동완성 훅 — 클라이언트 사이드 필터링
 *
 * - 페이지 진입 시 /dart-corps.json 1회 다운로드 후 메모리 캐시
 * - 타이핑 시 API 호출 없이 즉시 필터링 (debounce 150ms)
 * - 키보드 네비게이션 상태 (highlightedIndex) 관리
 */

import { useState, useRef, useEffect } from 'react';
import type { DartCompany } from '@/lib/api/company';

export type { DartCompany };

// 모듈 레벨 캐시 — 한 번 로드하면 앱 수명 내내 유지
type RawCorp = { n: string; c: string; s: string };
let corpListCache: DartCompany[] | null = null;
let loadPromise: Promise<DartCompany[]> | null = null;

async function loadCorpList(): Promise<DartCompany[]> {
  if (corpListCache) return corpListCache;
  if (loadPromise) return loadPromise;

  loadPromise = fetch('/dart-corps.json')
    .then((res) => res.json())
    .then((raw: RawCorp[]) => {
      corpListCache = raw.map((r) => ({ corpName: r.n, corpCode: r.c, stockCode: r.s }));
      return corpListCache;
    })
    .catch(() => []);

  return loadPromise;
}

/** 호환성 페이지 진입 시 미리 데이터 로드 (타이핑 전에 준비) */
export function preloadCorpList() {
  loadCorpList();
}

export function useCompanyAutocomplete() {
  const [suggestions, setSuggestions] = useState<DartCompany[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 컴포넌트 마운트 시 백그라운드 프리로드
  useEffect(() => {
    loadCorpList();
  }, []);

  const search = (query: string) => {
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const list = await loadCorpList();
      const lower = query.trim().toLowerCase();

      const startsWith = list.filter((c) => c.corpName.toLowerCase().startsWith(lower));
      const contains = list.filter(
        (c) =>
          !c.corpName.toLowerCase().startsWith(lower) &&
          c.corpName.toLowerCase().includes(lower),
      );

      const result = [...startsWith, ...contains].slice(0, 10);
      setSuggestions(result);
      setIsOpen(result.length > 0);
    }, 150);
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
