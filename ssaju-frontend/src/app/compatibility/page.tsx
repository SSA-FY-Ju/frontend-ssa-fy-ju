'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCompatibility } from '@/hooks/useCompatibility';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { fetchDartCompanyDetail } from '@/lib/api/company';
import type { DartCompany } from '@/hooks/useCompanyAutocomplete';
import { preloadCorpList } from '@/hooks/useCompanyAutocomplete';
import { useSessionStore } from '@/stores/sessionStore';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { CompanyAutocomplete } from '@/components/forms/CompanyAutocomplete';
import type { RoleCategory, TargetRole } from '@/types/api';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
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
  const { isAllowed } = useRouteGuard(true);
  const { phase, result, error, disclaimerVisible, disclaimerFading, submitCompatibility, reset } =
    useCompatibility();
  const [companyLookupLoading, setCompanyLookupLoading] = useState(false);

  const sessionBirthDate = useSessionStore((s) => s.birthDate);
  const sessionBirthTime = useSessionStore((s) => s.birthTime);
  const sajuResultId = useSessionStore((s) => s.sajuResultId);
  const feedbackGivenIds = useSessionStore((s) => s.feedbackGivenIds);
  const setFeedbackGiven = useSessionStore((s) => s.setFeedbackGiven);
  const exitRequestPending = useSessionStore((s) => s.exitRequestPending);
  const clearExitRequest = useSessionStore((s) => s.clearExitRequest);
  const hasFeedback = !!sajuResultId && feedbackGivenIds.includes(`${sajuResultId}_COMPATIBILITY`);

  const [selectedCompany, setSelectedCompany] = useState<DartCompany | null>(null);
  const [directMode, setDirectMode] = useState(false);
  const [directInput, setDirectInput] = useState('');
  const [roleCategory, setRoleCategory] = useState<RoleCategory>('TECH_BACKEND');
  const [roleDetailName, setRoleDetailName] = useState('');

  // 최종 기업명·corpCode (직접 입력 or 드롭다운 선택)
  const finalCompanyName = selectedCompany?.corpName ?? (directMode ? directInput : '');
  const finalCorpCode = selectedCompany?.corpCode ?? null;

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackIsExitMode, setFeedbackIsExitMode] = useState(false);

  const { confirmExit } = usePageExitGuard({
    onExitAttempt: () => {
      if (phase === 'result' && !hasFeedback) {
        setFeedbackIsExitMode(true);
        setFeedbackModalOpen(true);
      } else {
        confirmExit();
      }
    },
  });

  const { getDisplayMessage } = useErrorHandler();

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
    if (phase === 'result' && !hasFeedback) {
      setFeedbackIsExitMode(true);
      setFeedbackModalOpen(true);
    } else {
      confirmExit();
    }
  }, [exitRequestPending, phase, hasFeedback, clearExitRequest, confirmExit]);

  // 드롭다운에서 기업 선택 → 바로 확정 (모달 없음)
  const handleCompanySelect = (company: DartCompany) => {
    setSelectedCompany(company);
    setDirectMode(false);
    setDirectInput('');
  };

  // "궁합 분석 시작하기" 버튼 클릭 → 분석 시작
  const handleManualSubmit = async () => {
    const trimmed = finalCompanyName.trim();
    if (!trimmed) return;

    setCompanyLookupLoading(true);

    const defaultLabel = ROLE_CATEGORIES.find(r => r.value === roleCategory)?.label ?? '';
    const targetRole: TargetRole = { category: roleCategory, detailName: roleDetailName || defaultLabel };

    let foundingDate: string | undefined;
    if (finalCorpCode) {
      try {
        const detail = await fetchDartCompanyDetail(finalCorpCode);
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
      trimmed,
      foundingDate,
    );
  };

  const handleReset = () => {
    reset();
    setSelectedCompany(null);
    setDirectMode(false);
    setDirectInput('');
    setCompanyLookupLoading(false);
  };

  // 기업 목록 백그라운드 프리로드 (타이핑 전에 준비)
  useEffect(() => { preloadCorpList(); }, []);

  if (!isAllowed) return null;

  // 결과 단계에서는 FullPageCompatibility가 전체 화면을 제어
  if (phase === 'result' && result) {
    return (
      <main className="relative z-10 text-white" style={{ height: '100vh', overflow: 'hidden' }}>
        <FullPageCompatibility
          result={result}
          companyName={finalCompanyName}
          hasFeedback={hasFeedback}
          onFeedbackOpen={() => { setFeedbackIsExitMode(false); setFeedbackModalOpen(true); }}
        />

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
            <div style={{ width: '100%', maxWidth: 480 }}>

              {/* 헤더 */}
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: 100, padding: '5px 14px',
                  marginBottom: 20,
                }}>
                  <span style={{ fontSize: 10, color: '#a78bfa' }}>✦</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#a78bfa', textTransform: 'uppercase' }}>
                    Compatibility Analysis
                  </span>
                </div>
                <h1 style={{
                  fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  marginBottom: 12,
                  textShadow: '0 0 60px rgba(139,92,246,0.5)',
                }}>
                  기업 궁합 분석
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(196,181,253,0.5)', lineHeight: 1.7 }}>
                  사주로 보는 나와 기업의 별빛 인연
                </p>
              </div>

              {/* 에러 카드 */}
              {phase === 'error' && error && (
                <div style={{
                  marginBottom: 20,
                  borderRadius: 16,
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  padding: '20px 22px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 16 }}>⚠</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5', marginBottom: 4 }}>
                        분석에 실패했습니다
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(252,165,165,0.7)', lineHeight: 1.6 }}>
                        {getDisplayMessage(new Error(error))}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    style={{
                      width: '100%', padding: '11px',
                      borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.1)',
                      color: '#fca5a5', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                      letterSpacing: '0.02em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                    }}
                  >
                    ↺ &nbsp;처음부터 다시
                  </button>
                </div>
              )}

              {/* 폼 카드 */}
              <div
                style={{
                  position: 'relative',
                  backdropFilter: 'blur(20px)',
                  background: 'linear-gradient(160deg, rgba(30,20,60,0.6) 0%, rgba(10,8,30,0.65) 100%)',
                  border: '1px solid rgba(139,92,246,0.22)',
                  borderRadius: 24,
                  overflow: 'hidden',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.06) inset',
                }}
              >
                {/* 상단 장식선 */}
                <div style={{
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(99,102,241,0.7), transparent)',
                }} />

                <div style={{ padding: '30px 28px 28px' }}>

                  {/* Step 1 — 기업명 */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: 'rgba(139,92,246,0.2)',
                        border: '1px solid rgba(139,92,246,0.4)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: '#a78bfa', flexShrink: 0,
                      }}>1</span>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(196,181,253,0.75)', letterSpacing: '0.05em' }}>
                        기업명
                      </label>
                    </div>

                    {directMode ? (
                      /* 직접 입력 모드 */
                      <div>
                        <input
                          type="text"
                          value={directInput}
                          onChange={(e) => setDirectInput(e.target.value)}
                          placeholder="기업명을 직접 입력하세요"
                          autoFocus
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: 12,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(139,92,246,0.35)',
                            color: '#fff', fontSize: 14, outline: 'none',
                            boxSizing: 'border-box', transition: 'border-color 0.2s',
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)')}
                        />
                        <button
                          onClick={() => { setDirectMode(false); setDirectInput(''); }}
                          style={{
                            marginTop: 8, fontSize: 11, color: 'rgba(196,181,253,0.45)',
                            cursor: 'pointer', background: 'none', border: 'none', paddingLeft: 4,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,181,253,0.45)')}
                        >
                          ← 검색으로 돌아가기
                        </button>
                      </div>
                    ) : (
                      /* 자동완성 검색 모드 */
                      <div>
                        <CompanyAutocomplete
                          selectedName={selectedCompany?.corpName}
                          onSelect={handleCompanySelect}
                          onClear={() => setSelectedCompany(null)}
                          disabled={companyLookupLoading}
                        />
                        {!selectedCompany && (
                          <button
                            onClick={() => setDirectMode(true)}
                            style={{
                              marginTop: 8, fontSize: 11, color: 'rgba(196,181,253,0.4)',
                              cursor: 'pointer', background: 'none', border: 'none', paddingLeft: 4,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,181,253,0.4)')}
                          >
                            목록에 없는 기업이라면?
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 구분선 */}
                  <div style={{ height: 1, background: 'rgba(139,92,246,0.1)', marginBottom: 20 }} />

                  {/* Step 2 — 직군 선택 */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: 'rgba(139,92,246,0.2)',
                        border: '1px solid rgba(139,92,246,0.4)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: '#a78bfa', flexShrink: 0,
                      }}>2</span>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(196,181,253,0.75)', letterSpacing: '0.05em' }}>
                        직군 선택
                      </label>
                    </div>
                    <select
                      value={roleCategory}
                      onChange={(e) => setRoleCategory(e.target.value as RoleCategory)}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 12,
                        background: 'rgba(139,92,246,0.07)',
                        border: '1px solid rgba(139,92,246,0.22)',
                        color: '#e2e8f0', fontSize: 13, fontWeight: 500,
                        outline: 'none', cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a78bfa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        paddingRight: 36,
                      }}
                    >
                      {ROLE_CATEGORIES.map((r) => (
                        <option key={r.value} value={r.value} style={{ background: '#1a1040' }}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 3 — 세부 직무명 */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: 'rgba(139,92,246,0.12)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: 'rgba(167,139,250,0.6)', flexShrink: 0,
                      }}>3</span>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(196,181,253,0.5)', letterSpacing: '0.05em' }}>
                        세부 직무명 <span style={{ fontWeight: 400, opacity: 0.6 }}>(선택)</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={roleDetailName}
                      onChange={(e) => setRoleDetailName(e.target.value)}
                      placeholder="예: Spring Boot 백엔드 개발자"
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(139,92,246,0.15)',
                        color: '#e2e8f0', fontSize: 13, outline: 'none',
                        boxSizing: 'border-box', transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)')}
                    />
                  </div>

                  {/* 분석 시작 버튼 */}
                  <button
                    onClick={handleManualSubmit}
                    disabled={!finalCompanyName.trim() || companyLookupLoading}
                    style={{
                      position: 'relative',
                      width: '100%',
                      padding: '15px',
                      borderRadius: 14,
                      background: finalCompanyName.trim()
                        ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                        : 'rgba(255,255,255,0.04)',
                      border: finalCompanyName.trim()
                        ? '1px solid rgba(139,92,246,0.5)'
                        : '1px solid rgba(255,255,255,0.07)',
                      color: finalCompanyName.trim() ? '#fff' : 'rgba(255,255,255,0.18)',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: finalCompanyName.trim() && !companyLookupLoading ? 'pointer' : 'not-allowed',
                      boxShadow: finalCompanyName.trim()
                        ? '0 8px 32px rgba(109,40,217,0.45), 0 0 0 1px rgba(139,92,246,0.2) inset'
                        : 'none',
                      transition: 'all 0.25s',
                      letterSpacing: '0.04em',
                    }}
                    onMouseEnter={(e) => {
                      if (finalCompanyName.trim() && !companyLookupLoading) {
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(109,40,217,0.6), 0 0 0 1px rgba(139,92,246,0.3) inset';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = finalCompanyName.trim()
                        ? '0 8px 32px rgba(109,40,217,0.45), 0 0 0 1px rgba(139,92,246,0.2) inset'
                        : 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {companyLookupLoading
                      ? '⏳  설립일 조회 중...'
                      : finalCompanyName.trim()
                        ? '✦  궁합 분석 시작하기'
                        : '기업명을 먼저 선택해주세요'}
                  </button>

                </div>
              </div>

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
