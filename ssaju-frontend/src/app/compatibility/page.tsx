'use client';

/**
 * 기업 궁합 분석 페이지 (T087)
 * SEO 메타데이터는 app/compatibility/layout.tsx에서 관리
 *
 * 흐름: 생년월일 입력 → 기업명 입력/자동완성 → 확인 모달
 *   → 고지 문구(1.5초) → 로딩 → 결과(CompatibilityResult 컴포넌트)
 */

import { useState } from 'react';
import { useCompatibility } from '@/hooks/useCompatibility';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { InputForm } from '@/components/forms/InputForm';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { CompanyConfirmModal } from '@/components/modals/CompanyConfirmModal';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { CompatibilityResult } from '@/components/results/CompatibilityResult';

export default function CompatibilityPage() {
  const { phase, result, error, disclaimerVisible, disclaimerFading, submitCompatibility, reset } =
    useCompatibility();
  const { lookupCompany, suggestions, status: companyStatus, reset: resetCompanyInfo } =
    useCompanyInfo();

  const [formValues, setFormValues] = useState<{ birthDate: string; birthTime: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCompany, setPendingCompany] = useState('');

  const handleDateSubmit = (birthDate: string, birthTime: string) => {
    setFormValues({ birthDate, birthTime });
  };

  const handleCompanySelect = async (companyName: string) => {
    setPendingCompany(companyName);
    await lookupCompany(companyName);
    setShowConfirmModal(true);
  };

  const handleConfirm = (confirmedCompany: string) => {
    setShowConfirmModal(false);
    if (!formValues) return;
    submitCompatibility(formValues.birthDate, formValues.birthTime, confirmedCompany);
  };

  const handleManualInput = () => {
    setShowConfirmModal(false);
    if (!formValues) return;
    submitCompatibility(formValues.birthDate, formValues.birthTime, pendingCompany);
  };

  const handleReset = () => {
    reset();
    resetCompanyInfo();
    setFormValues(null);
    setShowConfirmModal(false);
    setPendingCompany('');
  };

  return (
    <main className="min-h-screen bg-night-900 text-white">
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />

      {showConfirmModal && (
        <CompanyConfirmModal
          suggestions={suggestions}
          originalInput={pendingCompany}
          onConfirm={handleConfirm}
          onManualInput={handleManualInput}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-star-500 text-3xl font-bold text-center mb-2">기업 궁합 분석</h1>
        <p className="text-star-300 text-sm text-center mb-8">
          생년월일과 기업명으로 취업 궁합을 분석해드립니다
        </p>

        {(phase === 'idle' || phase === 'error') && !formValues && (
          <>
            <div className="bg-night-800 rounded-lg p-5 mb-4">
              <h2 className="text-star-400 text-sm font-medium mb-4">① 생년월일 입력</h2>
              <InputForm onSubmit={handleDateSubmit} isLoading={false} />
            </div>
            {phase === 'error' && error && (
              <ErrorMessage message={error} onRetry={handleReset} retryLabel="처음부터 다시" />
            )}
          </>
        )}

        {(phase === 'idle' || phase === 'error') && formValues && (
          <div className="bg-night-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-star-400 text-sm font-medium">② 기업명 입력</h2>
              <button
                onClick={() => setFormValues(null)}
                className="text-night-700 text-xs hover:text-white transition-colors"
              >
                ← 생년월일 다시 입력
              </button>
            </div>
            <CompanyForm onCompanySelect={handleCompanySelect} isLoading={companyStatus === 'loading'} />
          </div>
        )}

        {phase === 'loading' && <LoadingProgress message="기업 궁합을 분석하고 있습니다..." />}

        {phase === 'result' && result && (
          <CompatibilityResult result={result} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
