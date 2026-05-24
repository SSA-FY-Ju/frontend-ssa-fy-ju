'use client';

// 파일 크기 예외: 입력 필드·드롭다운·키보드 접근성(WAI-ARIA)이 하나의 자동완성
// 위젯을 구성하므로 분리 시 aria-controls 등 접근성 연결이 끊김
/**
 * 기업명 자동완성 드롭다운
 *
 * 기능:
 * - 내부 query 상태로 검색 — 부모에게 직접 입력값을 올리지 않음
 * - 드롭다운 항목 선택 시에만 onSelect 콜백 호출 (선택만 허용)
 * - selectedName이 있으면 chip 표시 모드로 전환 (onClear로 초기화)
 * - 최대 10개 항목 드롭다운 표시
 * - 키보드 접근성 (ArrowUp/Down, Enter, Escape)
 */

import { useState, useRef, useEffect } from 'react';
import { useCompanyAutocomplete } from '@/hooks/useCompanyAutocomplete';
import type { DartCompany } from '@/hooks/useCompanyAutocomplete';

interface CompanyAutocompleteProps {
  selectedName?: string;
  onSelect: (company: DartCompany) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function CompanyAutocomplete({
  selectedName,
  onSelect,
  onClear,
  disabled = false,
}: CompanyAutocompleteProps) {
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { suggestions, isOpen, highlightedIndex, search, close, navigateUp, navigateDown } =
    useCompanyAutocomplete();

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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  const handleSelect = (company: DartCompany) => {
    onSelect(company);
    setQuery('');
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); navigateDown(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); navigateUp(); }
    else if (e.key === 'Enter' && highlightedIndex >= 0) { e.preventDefault(); handleSelect(suggestions[highlightedIndex]); }
    else if (e.key === 'Escape') { close(); }
  };

  /** 선택된 기업이 있으면 chip 표시 */
  if (selectedName) {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', borderRadius: 12,
          background: 'rgba(139,92,246,0.1)',
          border: '1px solid rgba(139,92,246,0.4)',
        }}
      >
        <span style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedName}
        </span>
        {onClear && (
          <button
            onClick={onClear}
            aria-label="선택 취소"
            style={{ color: 'rgba(196,181,253,0.45)', fontSize: 18, lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none', padding: '0 2px', flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,181,253,0.45)')}
          >×</button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id="companyName"
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="기업명을 검색하세요 (예: 삼성전자)"
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
          {suggestions.map((company, index) => (
            <li
              key={`${company.corpName}-${index}`}
              id={`autocomplete-item-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(company);
              }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 14,
                borderRadius: 8,
                color: index === highlightedIndex ? '#c4b5fd' : 'rgba(255,255,255,0.75)',
                background: index === highlightedIndex ? 'rgba(139,92,246,0.15)' : 'transparent',
                transition: 'all 0.12s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{company.corpName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
