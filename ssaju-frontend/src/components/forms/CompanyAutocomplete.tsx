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
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(139,92,246,0.25)',
          color: '#fff',
          borderRadius: 12,
          padding: '12px 16px',
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)')}
      />

      {isOpen && suggestions.length > 0 && (
        <ul
          id="company-autocomplete-list"
          role="listbox"
          aria-label="기업명 자동완성 목록"
          style={{
            position: 'absolute',
            zIndex: 50,
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 6,
            background: 'rgba(10,12,28,0.95)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            maxHeight: 240,
            overflowY: 'auto',
            listStyle: 'none',
            padding: '6px',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`autocomplete-item-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(suggestion);
              }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 14,
                borderRadius: 8,
                color: index === highlightedIndex ? '#c4b5fd' : 'rgba(255,255,255,0.75)',
                background: index === highlightedIndex ? 'rgba(139,92,246,0.15)' : 'transparent',
                transition: 'all 0.12s',
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
