'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompatibility } from '@/hooks/useCompatibility';
import type { DartCompany } from '@/hooks/useCompanyAutocomplete';
import { useSessionStore } from '@/stores/sessionStore';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { FoundingDatePicker } from '@/components/forms/FoundingDatePicker';
import type { RoleCategory, TargetRole } from '@/types/api';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
import { CompatibilityForm, ROLE_CATEGORIES } from '@/components/compatibility/CompatibilityForm';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function CompatibilityPage() {
  const router = useRouter();
  const { isAllowed } = useRouteGuard(true);
  const { phase, error, disclaimerVisible, disclaimerFading, submitCompatibility, submitWithFoundingDate, reset } =
    useCompatibility();

  const sessionBirthDate = useSessionStore((s) => s.birthDate);
  const sessionBirthTime = useSessionStore((s) => s.birthTime);
  const exitRequestPending = useSessionStore((s) => s.exitRequestPending);
  const clearExitRequest = useSessionStore((s) => s.clearExitRequest);

  const [selectedCompany, setSelectedCompany] = useState<DartCompany | null>(null);
  const [directMode, setDirectMode] = useState(false);
  const [directInput, setDirectInput] = useState('');
  const [roleCategory, setRoleCategory] = useState<RoleCategory>('TECH_BACKEND');
  const [roleDetailName, setRoleDetailName] = useState('');

  // 최종 기업명 (직접 입력 or 드롭다운 선택)
  const finalCompanyName = selectedCompany?.corpName ?? (directMode ? directInput : '');

  const { getDisplayMessage } = useErrorHandler();

  // 분석 완료 → 결과 페이지로 이동
  useEffect(() => {
    if (phase === 'result') {
      router.push('/compatibility/result');
    }
  }, [phase, router]);

  // 헤더 "처음으로" 버튼 처리
  useEffect(() => {
    if (!exitRequestPending) return;
    clearExitRequest();
    router.push('/select');
  }, [exitRequestPending, clearExitRequest, router]);

  // 드롭다운에서 기업 선택 → 바로 확정 (모달 없음)
  const handleCompanySelect = (company: DartCompany) => {
    setSelectedCompany(company);
    setDirectMode(false);
    setDirectInput('');
  };

  const handleToggleDirectMode = (enabled: boolean) => {
    setDirectMode(enabled);
    if (!enabled) setDirectInput('');
  };

  // "궁합 분석 시작하기" 버튼 클릭 → 분석 시작
  const handleManualSubmit = () => {
    const trimmed = finalCompanyName.trim();
    if (!trimmed) return;

    const defaultLabel = ROLE_CATEGORIES.find(r => r.value === roleCategory)?.label ?? '';
    const targetRole: TargetRole = { category: roleCategory, detailName: roleDetailName || defaultLabel };

    submitCompatibility(
      sessionBirthDate ?? '',
      sessionBirthTime ?? '12:00',
      targetRole,
      trimmed,
    );
  };

  const handleReset = () => {
    reset();
    setSelectedCompany(null);
    setDirectMode(false);
    setDirectInput('');
  };

  if (!isAllowed) return null;

  return (
    <main
      className="relative z-10 text-white"
      style={{ height: '100vh', overflowY: 'auto', paddingTop: '4rem', animation: 'fadeIn 0.3s ease' }}
    >
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />

      <div style={disclaimerVisible ? { visibility: 'hidden', pointerEvents: 'none' } : {}}>

        {(phase === 'idle' || phase === 'error') && (
          <CompatibilityForm
            hasError={phase === 'error'}
            errorMessage={error ? getDisplayMessage(new Error(error)) : null}
            onRetry={handleReset}
            selectedCompany={selectedCompany}
            directMode={directMode}
            directInput={directInput}
            roleCategory={roleCategory}
            roleDetailName={roleDetailName}
            finalCompanyName={finalCompanyName}
            onSelectCompany={handleCompanySelect}
            onClearCompany={() => setSelectedCompany(null)}
            onToggleDirectMode={handleToggleDirectMode}
            onDirectInputChange={setDirectInput}
            onRoleCategoryChange={setRoleCategory}
            onRoleDetailNameChange={setRoleDetailName}
            onSubmit={handleManualSubmit}
          />
        )}

        {/* ── 로딩 (result 포함 — 결과 페이지로 이동 중) ── */}
        {(phase === 'loading' || phase === 'result') && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - 4rem)', padding: '0 16px',
          }}>
            <div style={{ width: '100%', maxWidth: 480 }}>
              <LoadingProgress message="기업 궁합을 분석하고 있습니다..." />
            </div>
          </div>
        )}

        {/* ── 설립일자 직접 입력 (404 fallback) ── */}
        {phase === 'founding-date-needed' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - 4rem)', padding: '48px 16px',
          }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
              <FoundingDatePicker
                companyName={finalCompanyName}
                onConfirm={submitWithFoundingDate}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
