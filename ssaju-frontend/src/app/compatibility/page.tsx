'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompatibility } from '@/hooks/useCompatibility';
import type { DartCompany } from '@/hooks/useCompanyAutocomplete';
import { useSessionStore } from '@/stores/sessionStore';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { CompanyAutocomplete } from '@/components/forms/CompanyAutocomplete';
import { FoundingDatePicker } from '@/components/forms/FoundingDatePicker';
import type { RoleCategory, TargetRole } from '@/types/api';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const ROLE_CATEGORIES: { value: RoleCategory; label: string }[] = [
  { value: 'TECH_BACKEND',   label: '백엔드 개발' },
  { value: 'TECH_FRONTEND',  label: '프론트엔드 개발' },
  { value: 'TECH_MOBILE',    label: '모바일 개발' },
  { value: 'TECH_DATA',      label: '데이터/AI' },
  { value: 'TECH_INFRA',     label: '인프라/DevOps' },
  { value: 'FINANCE',        label: '재무/회계' },
  { value: 'MARKETING',      label: '마케팅' },
  { value: 'HR',             label: '인사/HR' },
  { value: 'OPERATIONS',     label: '운영/기획' },
  { value: 'SALES',          label: '영업' },
  { value: 'STRATEGY',       label: '전략/경영' },
  { value: 'RESEARCH',       label: '연구개발' },
  { value: 'OTHER',          label: '기타' },
];

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
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.08))',
                  border: '1px solid rgba(139,92,246,0.28)',
                  borderRadius: 100, padding: '6px 18px',
                  marginBottom: 24,
                  backdropFilter: 'blur(8px)',
                }}>
                  <span style={{ fontSize: 9, color: '#c4b5fd', opacity: 0.7 }}>✦</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: '#c4b5fd', textTransform: 'uppercase' }}>
                    Compatibility Analysis
                  </span>
                  <span style={{ fontSize: 9, color: '#c4b5fd', opacity: 0.7 }}>✦</span>
                </div>
                <h1 style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3rem)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 45%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  marginBottom: 14,
                }}>
                  기업 궁합 분석
                </h1>
                <p style={{ fontSize: 13, color: 'rgba(196,181,253,0.4)', lineHeight: 1.7 }}>
                  사주로 보는 나와 기업의 별빛 인연
                </p>
              </div>

              {/* 에러 메시지 */}
              {phase === 'error' && error && (
                <div style={{
                  marginBottom: 28,
                  borderRadius: 14,
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
                  <p style={{ fontSize: 12, color: 'rgba(252,165,165,0.8)', flex: 1 }}>
                    {getDisplayMessage(new Error(error))}
                  </p>
                  <button
                    onClick={handleReset}
                    style={{
                      padding: '6px 14px', borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.1)',
                      color: '#fca5a5', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {/* ── 기업명 ── */}
              <div style={{ marginBottom: 44 }}>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(196,181,253,0.6)', marginBottom: 12 }}>
                  기업명
                </p>

                {directMode ? (
                  <div>
                    <input
                      type="text"
                      value={directInput}
                      onChange={(e) => setDirectInput(e.target.value)}
                      placeholder="기업명을 직접 입력하세요"
                      autoFocus
                      style={{
                        width: '100%', padding: '15px 20px', borderRadius: 16,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(139,92,246,0.35)',
                        color: '#fff', fontSize: 15, outline: 'none',
                        boxSizing: 'border-box', transition: 'border-color 0.2s',
                        backdropFilter: 'blur(12px)',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)')}
                    />
                    <button
                      onClick={() => { setDirectMode(false); setDirectInput(''); }}
                      style={{
                        marginTop: 10, fontSize: 11, color: 'rgba(196,181,253,0.38)',
                        cursor: 'pointer', background: 'none', border: 'none', paddingLeft: 4,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,181,253,0.38)')}
                    >
                      ← 검색으로 돌아가기
                    </button>
                  </div>
                ) : (
                  <div>
                    <CompanyAutocomplete
                      selectedName={selectedCompany?.corpName}
                      onSelect={handleCompanySelect}
                      onClear={() => setSelectedCompany(null)}
                      disabled={false}
                    />
                    {!selectedCompany && (
                      <button
                        onClick={() => setDirectMode(true)}
                        style={{
                          marginTop: 10, fontSize: 11, color: 'rgba(196,181,253,0.35)',
                          cursor: 'pointer', background: 'none', border: 'none', paddingLeft: 4,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,181,253,0.35)')}
                      >
                        목록에 없는 기업이라면?
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── 직군 선택 — 칩 그리드 ── */}
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(196,181,253,0.6)', marginBottom: 14 }}>
                  직군
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ROLE_CATEGORIES.map((r) => {
                    const active = roleCategory === r.value;
                    return (
                      <button
                        key={r.value}
                        onClick={() => setRoleCategory(r.value)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 100,
                          background: active
                            ? 'linear-gradient(135deg, rgba(124,58,237,0.9) 0%, rgba(99,102,241,0.85) 100%)'
                            : 'rgba(255,255,255,0.04)',
                          border: active
                            ? '1px solid rgba(139,92,246,0.6)'
                            : '1px solid rgba(139,92,246,0.18)',
                          color: active ? '#fff' : 'rgba(196,181,253,0.5)',
                          fontSize: 12,
                          fontWeight: active ? 700 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.18s',
                          boxShadow: active ? '0 4px 20px rgba(109,40,217,0.4)' : 'none',
                          letterSpacing: active ? '0.02em' : '0',
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                            e.currentTarget.style.color = 'rgba(196,181,253,0.8)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.18)';
                            e.currentTarget.style.color = 'rgba(196,181,253,0.5)';
                          }
                        }}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── 세부 직무명 ── */}
              <div style={{ marginBottom: 48 }}>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(196,181,253,0.6)', marginBottom: 12 }}>
                  세부 직무명 <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(196,181,253,0.35)', letterSpacing: 0 }}>(선택)</span>
                </p>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={roleDetailName}
                    onChange={(e) => setRoleDetailName(e.target.value)}
                    placeholder="예: Spring Boot 백엔드, UI/UX 디자이너"
                    style={{
                      width: '100%',
                      background: 'rgba(139,92,246,0.05)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      borderRadius: 12,
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: 13,
                      padding: '12px 16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                      e.currentTarget.style.background = 'rgba(139,92,246,0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)';
                      e.currentTarget.style.background = 'rgba(139,92,246,0.05)';
                    }}
                  />
                </div>
              </div>

              {/* ── 분석 시작 버튼 ── */}
              <div style={{ position: 'relative' }}>
                {/* 버튼 아래 ambient glow */}
                {finalCompanyName.trim() && (
                  <div style={{
                    position: 'absolute', bottom: -12, left: '10%', right: '10%', height: 40,
                    background: 'radial-gradient(ellipse, rgba(109,40,217,0.55) 0%, transparent 70%)',
                    filter: 'blur(16px)',
                    pointerEvents: 'none',
                  }} />
                )}
                <button
                  onClick={handleManualSubmit}
                  disabled={!finalCompanyName.trim()}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%',
                    padding: '18px 24px',
                    borderRadius: 20,
                    background: finalCompanyName.trim()
                      ? 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 40%, #4f46e5 100%)'
                      : 'rgba(255,255,255,0.03)',
                    border: finalCompanyName.trim()
                      ? '1px solid rgba(167,139,250,0.45)'
                      : '1px solid rgba(255,255,255,0.06)',
                    color: finalCompanyName.trim() ? '#fff' : 'rgba(255,255,255,0.18)',
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    cursor: finalCompanyName.trim() ? 'pointer' : 'default',
                    transition: 'all 0.28s cubic-bezier(0.22,1,0.36,1)',
                  }}
                  onMouseEnter={(e) => {
                    if (finalCompanyName.trim()) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.filter = 'brightness(1.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                >
                  {/* 상단 유리 반사 */}
                  {finalCompanyName.trim() && (
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '52%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)',
                      borderRadius: '20px 20px 0 0',
                      pointerEvents: 'none',
                    }} />
                  )}
                  {/* 텍스트 */}
                  <span style={{
                    position: 'relative', zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}>
                    {finalCompanyName.trim() ? (
                      <>
                        <span style={{ fontSize: 11, opacity: 0.75, letterSpacing: '0.1em' }}>✦</span>
                        <span>궁합 분석 시작하기</span>
                        <span style={{ fontSize: 11, opacity: 0.75, letterSpacing: '0.1em' }}>✦</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 13 }}>기업명을 먼저 선택해주세요</span>
                    )}
                  </span>
                </button>
              </div>

            </div>
          </div>
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
