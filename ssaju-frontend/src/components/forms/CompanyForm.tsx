'use client';

/**
 * 기업명 입력 폼 (T083)
 *
 * 기능:
 * - 텍스트 입력 + 자동완성 드롭다운 (CompanyAutocomplete)
 * - 입력 시 debounce 300ms로 자동완성 API 호출
 * - 기업 선택 시 onCompanySelect 콜백 호출
 */

import { useState } from 'react';
import { CompanyAutocomplete } from './CompanyAutocomplete';

interface CompanyFormProps {
  /** 기업 선택 완료 콜백 */
  onCompanySelect: (companyName: string) => void;
  /** 폼 제출 중 비활성화 여부 */
  isLoading?: boolean;
}

export function CompanyForm({ onCompanySelect, isLoading = false }: CompanyFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);

  /** 기업명 입력 핸들러 */
  const handleChange = (value: string) => {
    setCompanyName(value);
    if (error) setError(null);
  };

  /** 자동완성 항목 선택 핸들러 */
  const handleAutocompleteSelect = (selected: string) => {
    setCompanyName(selected);
    setError(null);
    onCompanySelect(selected);
  };

  /** 폼 제출 핸들러 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = companyName.trim();
    if (!trimmed) {
      setError('기업명을 입력해주세요.');
      return;
    }
    onCompanySelect(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="기업 궁합 분석 폼" autoComplete="off">
      <div className="mb-4">
        <label htmlFor="companyName" className="block text-star-300 text-sm font-medium mb-1">
          기업명
        </label>
        <CompanyAutocomplete
          value={companyName}
          onChange={handleChange}
          onSelect={handleAutocompleteSelect}
          disabled={isLoading}
        />
        {error && (
          <p role="alert" className="mt-1 text-red-400 text-sm">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!companyName.trim() || isLoading}
        className="w-full bg-star-500 hover:bg-star-400 disabled:bg-night-700 disabled:cursor-not-allowed text-night-900 font-bold py-3 px-6 rounded transition-colors"
      >
        {isLoading ? '분석 중...' : '궁합 분석하기'}
      </button>
    </form>
  );
}
