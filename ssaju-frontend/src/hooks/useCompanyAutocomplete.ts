'use client';

/**
 * 기업명 자동완성 훅 (C2 아키텍처 수정)
 *
 * Component → Hook → API 계층 준수:
 * CompanyAutocomplete 컴포넌트가 API를 직접 호출하던 것을 이 훅으로 이전
 *
 * 기능:
 * - debounce 300ms로 백엔드 자동완성 API 호출
 * - 최대 10개 suggestions 반환
 * - 키보드 네비게이션 상태 (highlightedIndex) 관리
 */

import { useState, useRef } from 'react';
import { fetchCompanyAutocomplete } from '@/lib/api/company';

export function useCompanyAutocomplete() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 검색어 변경 시 debounce 후 API 호출
   * 빈 문자열 입력 시 드롭다운 닫기
   */
  const search = (query: string) => {
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await fetchCompanyAutocomplete({ query: query.trim() });
        // 최대 10개만 표시
        setSuggestions(result.suggestions.slice(0, 10));
        setIsOpen(result.suggestions.length > 0);
      } catch {
        // 자동완성 실패 시 조용히 무시 (수동 입력 계속 허용)
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);
  };

  /** 드롭다운 닫기 및 상태 초기화 */
  const close = () => {
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  /** 키보드 위 방향 네비게이션 */
  const navigateUp = () => {
    setHighlightedIndex((i) => Math.max(i - 1, 0));
  };

  /** 키보드 아래 방향 네비게이션 */
  const navigateDown = () => {
    setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
  };

  return {
    suggestions,
    isOpen,
    highlightedIndex,
    search,
    close,
    navigateUp,
    navigateDown,
  };
}
