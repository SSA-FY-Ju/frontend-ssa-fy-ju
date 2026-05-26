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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CompanyAutocomplete } from './CompanyAutocomplete';
import type { DartCompany } from '@/hooks/useCompanyAutocomplete';

interface CompanyFormProps {
  /** 기업 선택 완료 콜백 */
  onCompanySelect: (companyName: string) => void;
  /** 폼 제출 중 비활성화 여부 */
  isLoading?: boolean;
}

export function CompanyForm({ onCompanySelect, isLoading = false }: CompanyFormProps) {
  const [selectedCompany, setSelectedCompany] = useState<DartCompany | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (company: DartCompany) => {
    setSelectedCompany(company);
    setError(null);
  };

  const handleClear = () => {
    setSelectedCompany(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) {
      setError('기업을 목록에서 선택해주세요.');
      return;
    }
    onCompanySelect(selectedCompany.corpName);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="기업 궁합 분석 폼" autoComplete="off">
      <div className="mb-4">
        <label htmlFor="companyName" className="block text-star-300 text-sm font-medium mb-1">
          기업명
        </label>
        <CompanyAutocomplete
          selectedName={selectedCompany?.corpName}
          onSelect={handleSelect}
          onClear={handleClear}
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
        disabled={!selectedCompany || isLoading}
        className="w-full bg-star-500 hover:bg-star-400 disabled:bg-night-700 disabled:cursor-not-allowed text-night-900 font-bold py-3 px-6 rounded transition-colors"
      >
        {isLoading ? '분석 중...' : '궁합 분석하기'}
      </button>
    </form>
  );
}
