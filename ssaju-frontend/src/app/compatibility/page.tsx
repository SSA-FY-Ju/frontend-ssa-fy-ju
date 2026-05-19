'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCompatibility } from '@/hooks/useCompatibility';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useSessionStore } from '@/stores/sessionStore';
import { CompanyAutocomplete } from '@/components/forms/CompanyAutocomplete';
import { CompanyConfirmModal } from '@/components/modals/CompanyConfirmModal';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { PageExitModal } from '@/components/common/PageExitModal';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';

// Swiper는 브라우저 전용 — SSR 비활성화
const FullPageCompatibility = dynamic(
  () => import('@/components/compatibility/FullPageCompatibility').then((m) => ({ default: m.FullPageCompatibility })),
  { ssr: false }
);

export default function CompatibilityPage() {
  const router = useRouter();

  const { phase, result, error, disclaimerVisible, disclaimerFading, submitCompatibility, reset } =
    useCompatibility();
  const { lookupCompany, suggestions, status: companyStatus, reset: resetCompanyInfo } =
    useCompanyInfo();

  const sessionBirthDate = useSessionStore((s) => s.birthDate);
  const sessionBirthTime = useSessionStore((s) => s.birthTime);
  const hasHydrated = useSessionStore((s) => s._hasHydrated);

  // 사용자 정보 없으면 /chat으로 라우팅 + 경고 toast
  useEffect(() => {
    if (hasHydrated && !sessionBirthDate) {
      toast.error('먼저 생년월일을 입력해주세요');
      router.push('/chat');
    }
  }, [hasHydrated, sessionBirthDate, router]);

  const [companyName, setCompanyName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCompany, setPendingCompany] = useState('');

  const { shouldShowExitModal, confirmExit, cancelExit } = usePageExitGuard();
  const { getDisplayMessage } = useErrorHandler();

  // 피드백 넛지 — 마지막 섹션 도달 시 표시
  const [showFeedbackNudge, setShowFeedbackNudge] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const nudgeShownRef = useState(false);
  const LAST_SECTION = 5;

  useEffect(() => {
    if (phase !== 'result') {
      setShowFeedbackNudge(false);
      setNudgeVisible(false);
      return;
    }
  }, [phase]);

  useEffect(() => {
    if (activeSectionIndex !== LAST_SECTION) return;
    if (nudgeShownRef[0]) return;
    nudgeShownRef[0] = true;
    const t = setTimeout(() => {
      setShowFeedbackNudge(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setNudgeVisible(true)));
    }, 800);
    return () => clearTimeout(t);
  }, [activeSectionIndex, nudgeShownRef]);

  const handleCompanySelect = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPendingCompany(trimmed);
    await lookupCompany(trimmed);
    setShowConfirmModal(true);
  };

  const handleConfirm = (confirmedCompany: string) => {
    setShowConfirmModal(false);
    submitCompatibility(sessionBirthDate ?? '', sessionBirthTime ?? '12:00', confirmedCompany);
  };

  const handleManualInput = () => {
    setShowConfirmModal(false);
    submitCompatibility(sessionBirthDate ?? '', sessionBirthTime ?? '12:00', pendingCompany);
  };

  const handleReset = () => {
    reset();
    resetCompanyInfo();
    setCompanyName('');
    setPendingCompany('');
    setShowConfirmModal(false);
  };

  // hydration 전이거나 birthDate 없으면 아무것도 렌더링하지 않음 (redirect 진행 중)
  if (!hasHydrated || !sessionBirthDate) return null;

  // 결과 단계에서는 FullPageCompatibility가 전체 화면을 제어
  if (phase === 'result' && result) {
    return (
      <main className="relative z-10 text-white" style={{ height: '100vh', overflow: 'hidden' }}>
        <PageExitModal
          isOpen={shouldShowExitModal}
          onConfirmExit={confirmExit}
          onCancelExit={cancelExit}
          onLoginAndStay={cancelExit}
        />
        <FullPageCompatibility
          result={result}
          onReset={handleReset}
          onSectionChange={setActiveSectionIndex}
        />

        {/* 피드백 넛지 */}
        {showFeedbackNudge && (
          <div
            role="complementary"
            aria-label="피드백 요청"
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 200,
              transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1)',
              opacity: nudgeVisible ? 1 : 0,
              transform: nudgeVisible ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <div
              style={{
                width: 220,
                display: 'flex', flexDirection: 'column', gap: 10,
                borderRadius: 16, padding: 14,
                backdropFilter: 'blur(12px)',
                background: 'rgba(10,12,28,0.9)',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, color: '#a78bfa' }}>✦</span>
                <button
                  onClick={() => setShowFeedbackNudge(false)}
                  style={{ color: 'rgba(148,163,184,0.45)', fontSize: 16, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148,163,184,0.45)')}
                >×</button>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>이 결과에 대해 의견을 알려주세요</p>
                <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.55)', marginTop: 3 }}>피드백이 서비스 개선에 도움이 됩니다</p>
              </div>
              <button
                onClick={() => setFeedbackModalOpen(true)}
                style={{
                  width: '100%', padding: '7px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(90deg, #6d28d9, #4f46e5)',
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(109,40,217,0.4)',
                }}
              >
                의견 남기기
              </button>
            </div>
          </div>
        )}

        {feedbackModalOpen && (
          <FeedbackModal feedbackType="COMPATIBILITY" onClose={() => setFeedbackModalOpen(false)} />
        )}
      </main>
    );
  }

  return (
    <main
      className="relative z-10 text-white"
      style={{ height: '100vh', overflowY: 'auto', paddingTop: '4rem' }}
    >
      <PageExitModal
        isOpen={shouldShowExitModal}
        onConfirmExit={confirmExit}
        onCancelExit={cancelExit}
        onLoginAndStay={cancelExit}
      />
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

      <div style={disclaimerVisible ? { visibility: 'hidden', pointerEvents: 'none' } : {}}>

        {/* ── 입력 단계 ── */}
        {(phase === 'idle' || phase === 'error') && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 4rem)',
              padding: '48px 16px',
            }}
          >
            <div style={{ width: '100%', maxWidth: 460 }}>

              <p style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.28em',
                color: '#a78bfa', opacity: 0.55, textTransform: 'uppercase',
                textAlign: 'center', marginBottom: 20,
              }}>
                COMPATIBILITY ANALYSIS
              </p>

              <h1 style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                textAlign: 'center',
                marginBottom: 10,
                textShadow: '0 0 50px rgba(139,92,246,0.4)',
              }}>
                기업 궁합 분석
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(196,181,253,0.45)',
                textAlign: 'center',
                lineHeight: 1.6,
                marginBottom: 44,
              }}>
                사주로 보는 나와 기업의 별빛 인연
              </p>

              <div
                style={{
                  backdropFilter: 'blur(16px)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: 20,
                  padding: '28px 24px',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 14, color: '#a78bfa' }}>✦</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                    분석할 기업명을 입력해주세요
                  </p>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <CompanyAutocomplete
                    value={companyName}
                    onChange={setCompanyName}
                    onSelect={handleCompanySelect}
                    disabled={companyStatus === 'loading'}
                  />
                </div>

                <button
                  onClick={() => handleCompanySelect(companyName)}
                  disabled={!companyName.trim() || companyStatus === 'loading'}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    background: companyName.trim()
                      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                      : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: companyName.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: companyName.trim() && companyStatus !== 'loading' ? 'pointer' : 'not-allowed',
                    boxShadow: companyName.trim() ? '0 4px 20px rgba(109,40,217,0.4)' : 'none',
                    transition: 'all 0.2s',
                    letterSpacing: '0.02em',
                  }}
                >
                  {companyStatus === 'loading' ? '기업 정보 확인 중...' : '궁합 분석 시작하기 →'}
                </button>

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 12 }}>
                  예: 삼성전자, 카카오, 토스, 네이버
                </p>
              </div>

              {phase === 'error' && error && (
                <div style={{ marginTop: 20 }}>
                  <ErrorMessage
                    message={getDisplayMessage(new Error(error))}
                    onRetry={handleReset}
                    retryLabel="처음부터 다시"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 로딩 ── */}
        {phase === 'loading' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - 4rem)', padding: '0 16px',
          }}>
            <div style={{ width: '100%', maxWidth: 480 }}>
              <LoadingProgress message="기업 궁합을 분석하고 있습니다..." />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
