'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCompatibility } from '@/hooks/useCompatibility';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { fetchDartCompanyDetail } from '@/lib/api/company';
import type { DartCompany } from '@/hooks/useCompanyAutocomplete';
import { preloadCorpList } from '@/hooks/useCompanyAutocomplete';
import { useSessionStore } from '@/stores/sessionStore';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { CompanyAutocomplete } from '@/components/forms/CompanyAutocomplete';
import { CompanyConfirmModal } from '@/components/modals/CompanyConfirmModal';
import type { RoleCategory, TargetRole } from '@/types/api';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Swiper는 브라우저 전용 — SSR 비활성화
const FullPageCompatibility = dynamic(
  () => import('@/components/compatibility/FullPageCompatibility').then((m) => ({ default: m.FullPageCompatibility })),
  { ssr: false }
);

const ROLE_CATEGORIES: { value: RoleCategory; label: string }[] = [
  { value: 'TECH_BACKEND',   label: '백엔드 개발' },
  { value: 'TECH_FRONTEND',  label: '프론트엔드 개발' },
  { value: 'TECH_FULLSTACK', label: '풀스택 개발' },
  { value: 'TECH_DATA',      label: '데이터/AI' },
  { value: 'TECH_DEVOPS',    label: 'DevOps/인프라' },
  { value: 'TECH_MOBILE',    label: '모바일 개발' },
  { value: 'PLANNING',       label: '기획' },
  { value: 'DESIGN',         label: '디자인' },
  { value: 'MARKETING',      label: '마케팅' },
  { value: 'SALES',          label: '영업' },
  { value: 'HR',             label: '인사/HR' },
  { value: 'FINANCE',        label: '재무/회계' },
  { value: 'MANAGEMENT',     label: '경영/전략' },
  { value: 'OTHER',          label: '기타' },
];

export default function CompatibilityPage() {
  useRouteGuard(true);
  const router = useRouter();

  const { phase, result, error, disclaimerVisible, disclaimerFading, submitCompatibility, reset } =
    useCompatibility();
  const [companyLookupLoading, setCompanyLookupLoading] = useState(false);

  const sessionBirthDate = useSessionStore((s) => s.birthDate);
  const sessionBirthTime = useSessionStore((s) => s.birthTime);
  const hasHydrated = useSessionStore((s) => s._hasHydrated);
  const sajuResultId = useSessionStore((s) => s.sajuResultId);
  const feedbackGivenIds = useSessionStore((s) => s.feedbackGivenIds);
  const setFeedbackGiven = useSessionStore((s) => s.setFeedbackGiven);
  const exitRequestPending = useSessionStore((s) => s.exitRequestPending);
  const clearExitRequest = useSessionStore((s) => s.clearExitRequest);
  const hasFeedback = !!sajuResultId && feedbackGivenIds.includes(`${sajuResultId}_COMPATIBILITY`);

  useEffect(() => {
    if (hasHydrated && !sessionBirthDate) {
      router.push('/chat');
    }
  }, [hasHydrated, sessionBirthDate, router]);

  const [companyName, setCompanyName] = useState('');
  const [roleCategory, setRoleCategory] = useState<RoleCategory>('TECH_BACKEND');
  const [roleDetailName, setRoleDetailName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCompany, setPendingCompany] = useState('');
  const [pendingCorpCode, setPendingCorpCode] = useState<string | null>(null);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackIsExitMode, setFeedbackIsExitMode] = useState(false);

  const { confirmExit } = usePageExitGuard({
    onExitAttempt: () => {
      if (!hasFeedback) {
        setFeedbackIsExitMode(true);
        setFeedbackModalOpen(true);
      } else {
        confirmExit();
      }
    },
  });

  const { getDisplayMessage } = useErrorHandler();

  // 피드백 넛지 — 마지막 섹션 도달 시 표시
  const [showFeedbackNudge, setShowFeedbackNudge] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const nudgeShownRef = useRef(false);
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
    if (nudgeShownRef.current) return;
    nudgeShownRef.current = true;
    const t = setTimeout(() => {
      setShowFeedbackNudge(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setNudgeVisible(true);
        setTimeout(() => setNudgeVisible(false), 5000);
        setTimeout(() => setShowFeedbackNudge(false), 5500);
      }));
    }, 800);
    return () => clearTimeout(t);
  }, [activeSectionIndex, nudgeShownRef]);

  const handleFeedbackSubmitted = () => {
    if (sajuResultId) setFeedbackGiven(sajuResultId, 'COMPATIBILITY');
    if (feedbackIsExitMode) confirmExit();
  };

  const handleFeedbackClose = () => {
    setFeedbackModalOpen(false);
    setFeedbackIsExitMode(false);
  };

  useEffect(() => {
    if (!exitRequestPending) return;
    clearExitRequest();
    if (!hasFeedback) {
      setFeedbackIsExitMode(true);
      setFeedbackModalOpen(true);
    } else {
      confirmExit();
    }
  }, [exitRequestPending, hasFeedback, clearExitRequest, confirmExit]);

  // DART 드롭다운에서 기업 선택 시 호출
  const handleCompanySelect = (company: DartCompany) => {
    setCompanyName(company.corpName);
    setPendingCompany(company.corpName);
    setPendingCorpCode(company.corpCode);
    setShowConfirmModal(true);
  };

  // 직접 입력 submit 버튼 클릭 (드롭다운 미선택)
  const handleManualSubmit = () => {
    const trimmed = companyName.trim();
    if (!trimmed) return;
    setPendingCompany(trimmed);
    setPendingCorpCode(null);
    setShowConfirmModal(true);
  };

  // 확인 모달에서 "이 기업으로 분석하기" 클릭
  const handleConfirm = async (confirmedCompany: string) => {
    setShowConfirmModal(false);
    setCompanyLookupLoading(true);

    const defaultLabel = ROLE_CATEGORIES.find(r => r.value === roleCategory)?.label ?? '';
    const targetRole: TargetRole = { category: roleCategory, detailName: roleDetailName || defaultLabel };

    let foundingDate: string | undefined;
    if (pendingCorpCode) {
      try {
        const detail = await fetchDartCompanyDetail(pendingCorpCode);
        if (detail?.foundingDate) foundingDate = detail.foundingDate;
      } catch {
        // 설립일 조회 실패 시 없이 진행
      }
    }

    setCompanyLookupLoading(false);
    submitCompatibility(
      sessionBirthDate ?? '',
      sessionBirthTime ?? '12:00',
      targetRole,
      confirmedCompany,
      foundingDate,
    );
  };

  const handleReset = () => {
    reset();
    setCompanyName('');
    setRoleDetailName('');
    setPendingCompany('');
    setPendingCorpCode(null);
    setShowConfirmModal(false);
  };

  // 기업 목록 백그라운드 프리로드 (타이핑 전에 준비)
  useEffect(() => { preloadCorpList(); }, []);

  // 하이드레이션 전: 빈 화면 대신 페이드인으로 부드럽게 처리
  if (!hasHydrated || !sessionBirthDate) {
    return (
      <main className="relative z-10 text-white" style={{ height: '100vh', opacity: 0 }} />
    );
  }

  // 결과 단계에서는 FullPageCompatibility가 전체 화면을 제어
  if (phase === 'result' && result) {
    return (
      <main className="relative z-10 text-white" style={{ height: '100vh', overflow: 'hidden' }}>
        <FullPageCompatibility
          result={result}
          companyName={pendingCompany || companyName}
          onReset={handleReset}
          onSectionChange={setActiveSectionIndex}
        />

        {/* 피드백 넛지 — 피드백 완료 전에만 표시 */}
        {showFeedbackNudge && !hasFeedback && (
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
                onClick={() => { setFeedbackIsExitMode(false); setFeedbackModalOpen(true); }}
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
          <FeedbackModal
            feedbackType="COMPATIBILITY"
            onClose={handleFeedbackClose}
            onSubmitted={handleFeedbackSubmitted}
            exitAction={feedbackIsExitMode ? { onExit: confirmExit } : undefined}
          />
        )}
      </main>
    );
  }

  return (
    <main
      className="relative z-10 text-white"
      style={{ height: '100vh', overflowY: 'auto', paddingTop: '4rem', animation: 'fadeIn 0.3s ease' }}
    >
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />
      {showConfirmModal && (
        <CompanyConfirmModal
          suggestions={[pendingCompany]}
          originalInput={pendingCompany}
          onConfirm={handleConfirm}
          onManualInput={() => handleConfirm(pendingCompany)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
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
                    지원 직무와 기업을 입력해주세요
                  </p>
                </div>

                {/* 직무 카테고리 선택 */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(196,181,253,0.6)', marginBottom: 6, letterSpacing: '0.06em' }}>
                    직군 선택
                  </label>
                  <select
                    value={roleCategory}
                    onChange={(e) => setRoleCategory(e.target.value as RoleCategory)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      background: 'rgba(139,92,246,0.08)',
                      border: '1px solid rgba(139,92,246,0.25)',
                      color: '#fff', fontSize: 13, outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {ROLE_CATEGORIES.map((r) => (
                      <option key={r.value} value={r.value} style={{ background: '#1e1b4b' }}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 세부 직무명 (선택) */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(196,181,253,0.6)', marginBottom: 6, letterSpacing: '0.06em' }}>
                    세부 직무명 <span style={{ opacity: 0.5 }}>(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={roleDetailName}
                    onChange={(e) => setRoleDetailName(e.target.value)}
                    placeholder="예: Spring Boot 백엔드 개발자"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      color: '#fff', fontSize: 13, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 기업명 입력 */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(196,181,253,0.6)', marginBottom: 6, letterSpacing: '0.06em' }}>
                    기업명
                  </label>
                  <CompanyAutocomplete
                    value={companyName}
                    onChange={setCompanyName}
                    onSelect={handleCompanySelect}
                    disabled={companyLookupLoading}
                  />
                </div>

                <button
                  onClick={handleManualSubmit}
                  disabled={!companyName.trim() || companyLookupLoading}
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
                    cursor: companyName.trim() && !companyLookupLoading ? 'pointer' : 'not-allowed',
                    boxShadow: companyName.trim() ? '0 4px 20px rgba(109,40,217,0.4)' : 'none',
                    transition: 'all 0.2s',
                    letterSpacing: '0.02em',
                  }}
                >
                  {companyLookupLoading ? '설립일 조회 중...' : '궁합 분석 시작하기 →'}
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
