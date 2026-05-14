'use client';

// 파일 크기 예외: 입력 필드·드롭다운·키보드 접근성(WAI-ARIA)이 하나의 자동완성
// 위젯을 구성하므로 분리 시 aria-controls 등 접근성 연결이 끊김
/**
 * 기업명 자동완성 드롭다운 (T083b)
 *
 * 기능:
 * - useCompanyAutocomplete 훅을 통해 debounce 300ms로 API 호출 (Hook 계층 경유)
 * - 최대 10개 항목 드롭다운 표시
 * - 항목 선택 시 onSelect 콜백 호출
 * - 키보드 접근성 (ArrowUp/Down, Enter, Escape)
 */

import { useRef, useEffect } from 'react';
import { useCompanyAutocomplete } from '@/hooks/useCompanyAutocomplete';

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function CompanyAutocomplete({
  value,
  onChange,
  onSelect,
  disabled = false,
}: CompanyAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { suggestions, isOpen, highlightedIndex, search, close, navigateUp, navigateDown } =
    useCompanyAutocomplete();

  // close는 내부 state setter만 호출하므로 ref를 통해 최신 참조 유지
  const closeRef = useRef(close);
  closeRef.current = close;

  /** 외부 클릭 시 드롭다운 닫기 */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeRef.current();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // closeRef를 통해 최신 함수 참조 — deps 불필요

  /** 입력 변경 시 부모에 알리고 훅에 검색 요청 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    search(e.target.value);
  };

  /** 항목 선택 */
  const handleSelect = (suggestion: string) => {
    onSelect(suggestion);
    close();
  };

  /** 키보드 네비게이션 */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateDown();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateUp();
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      close();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        id="companyName"
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="예: 삼성전자"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={isOpen ? 'company-autocomplete-list' : undefined}
        aria-activedescendant={
          highlightedIndex >= 0 ? `autocomplete-item-${highlightedIndex}` : undefined
        }
        className="w-full bg-night-800 border border-night-700 text-white rounded px-3 py-2 focus:outline-none focus:border-star-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {isOpen && suggestions.length > 0 && (
        <ul
          id="company-autocomplete-list"
          role="listbox"
          aria-label="기업명 자동완성 목록"
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-night-800 border border-night-700 rounded shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`autocomplete-item-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(e) => {
                // mousedown 시 blur 방지 후 선택
                e.preventDefault();
                handleSelect(suggestion);
              }}
              className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                index === highlightedIndex
                  ? 'bg-night-700 text-star-300'
                  : 'text-white hover:bg-night-700'
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
