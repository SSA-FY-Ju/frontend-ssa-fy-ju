'use client';

import { useState, useEffect, useRef } from 'react';

interface CompanyConfirmModalProps {
  suggestions: string[];
  originalInput: string;
  onConfirm: (companyName: string) => void;
  onManualInput: () => void;
  onClose: () => void;
}

export function CompanyConfirmModal({
  suggestions,
  originalInput,
  onConfirm,
  onManualInput: _onManualInput,
  onClose,
}: CompanyConfirmModalProps) {
  const [selected, setSelected] = useState(suggestions[0] ?? originalInput);
  const [showManual, setShowManual] = useState(suggestions.length === 0);
  const [manualValue, setManualValue] = useState(originalInput);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
  }, []);

  const switchMode = (toManual: boolean) => {
    setAnimating(true);
    setTimeout(() => {
      setShowManual(toManual);
      setAnimating(false);
      if (toManual) setTimeout(() => inputRef.current?.focus(), 30);
    }, 160);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-confirm-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
      }}
    >
      {/* 오버레이 */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(4,2,18,0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />

      {/* 모달 컨테이너 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          background: 'linear-gradient(150deg, rgba(30,20,60,0.75) 0%, rgba(15,10,35,0.8) 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 24,
          overflow: 'hidden',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 60px rgba(109,40,217,0.1)',
          transition: 'opacity 0.28s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        }}
      >
        {/* 상단 보라색 그라디언트 선 */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(99,102,241,0.6), transparent)',
        }} />

        {/* 헤더 */}
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 16, color: '#a78bfa' }}>✦</span>
              </div>
              <div>
                <h2
                  id="company-confirm-title"
                  style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}
                >
                  {showManual ? '기업명 직접 입력' : '기업 선택'}
                </h2>
                <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.45)', marginTop: 2 }}>
                  {showManual
                    ? '입력한 이름 그대로 분석해요'
                    : `"${originalInput}" 검색 결과`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="닫기"
              style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.35)',
                fontSize: 16, lineHeight: 1,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
              }}
            >×</button>
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: 'rgba(139,92,246,0.1)', marginBottom: 20 }} />
        </div>

        {/* 콘텐츠 영역 — 페이드 전환 */}
        <div
          style={{
            padding: '0 24px 24px',
            transition: 'opacity 0.16s ease',
            opacity: animating ? 0 : 1,
          }}
        >
          {showManual ? (
            /* ── 직접 입력 ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualValue.trim()) onConfirm(manualValue.trim());
                }}
                placeholder="예: 삼성전자, 카카오, 토스..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  color: '#fff', borderRadius: 12,
                  padding: '13px 16px', fontSize: 14,
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              <button
                onClick={() => { if (manualValue.trim()) onConfirm(manualValue.trim()); }}
                disabled={!manualValue.trim()}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: 12, border: 'none',
                  background: manualValue.trim()
                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                    : 'rgba(255,255,255,0.05)',
                  color: manualValue.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                  fontSize: 14, fontWeight: 700,
                  cursor: manualValue.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: manualValue.trim() ? '0 4px 20px rgba(109,40,217,0.35)' : 'none',
                  transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
                  letterSpacing: '0.01em',
                }}
              >
                이 기업으로 분석하기
              </button>

              {suggestions.length > 0 && (
                <button
                  onClick={() => switchMode(false)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'rgba(196,181,253,0.45)',
                    fontSize: 12, cursor: 'pointer',
                    padding: '4px 0',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,181,253,0.45)')}
                >
                  ← 검색 결과로 돌아가기
                </button>
              )}
            </div>
          ) : (
            /* ── 검색 결과 목록 ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {suggestions.map((name) => {
                const isSelected = selected === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelected(name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 14, width: '100%',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(79,70,229,0.12))'
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.06)'}`,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.15s, border-color 0.15s',
                      boxShadow: isSelected ? '0 0 0 1px rgba(139,92,246,0.15) inset' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      }
                    }}
                  >
                    {/* 커스텀 라디오 */}
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${isSelected ? '#a78bfa' : 'rgba(255,255,255,0.18)'}`,
                      background: isSelected ? 'rgba(167,139,250,0.15)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}>
                      {isSelected && (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: '#a78bfa',
                          boxShadow: '0 0 6px rgba(167,139,250,0.6)',
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: 14, fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#fff' : 'rgba(255,255,255,0.65)',
                        display: 'block', lineHeight: 1.3,
                        transition: 'color 0.15s, font-weight 0.15s',
                      }}>
                        {name}
                      </span>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, flexShrink: 0 }}>선택됨</span>
                    )}
                  </button>
                );
              })}

              {/* 액션 버튼 */}
              <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => onConfirm(selected)}
                  style={{
                    width: '100%', padding: '13px',
                    borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 24px rgba(109,40,217,0.35)',
                    transition: 'box-shadow 0.2s, background 0.2s',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 32px rgba(109,40,217,0.55)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #8b46f0, #5b51f5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(109,40,217,0.35)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed, #4f46e5)';
                  }}
                >
                  이 기업으로 분석하기
                </button>

                <button
                  onClick={() => switchMode(true)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'rgba(196,181,253,0.4)',
                    fontSize: 12, cursor: 'pointer',
                    padding: '4px 0',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(196,181,253,0.4)')}
                >
                  목록에 없어요, 직접 입력하기 →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
