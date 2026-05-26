'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { checkEmail } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { toastUtils } from '@/lib/toast';

type View = 'select' | 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(139,92,246,0.2)',
  background: 'rgba(255,255,255,0.03)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  boxSizing: 'border-box',
  letterSpacing: '0.01em',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'rgba(196,181,253,0.5)',
  marginBottom: 7,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

function toUserMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.errorCode) {
      case 'UNAUTHORIZED':
      case 'INVALID_CREDENTIALS':
        return '비밀번호가 올바르지 않습니다.';
      case 'USER_NOT_FOUND':
        return '등록되지 않은 이메일입니다.';
      case 'EMAIL_ALREADY_EXISTS':
      case 'DUPLICATE_EMAIL':
        return '이미 사용 중인 이메일입니다.';
      case 'VALIDATION_FAILED':
        return '입력값을 다시 확인해주세요.';
      default:
        return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }
  if (err instanceof Error && (err.message.includes('fetch') || err.message.includes('Failed'))) {
    return '네트워크 오류가 발생했습니다.';
  }
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

export function AuthModal({ isOpen, onClose, defaultTab }: AuthModalProps) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const setLoginError = useAuthStore((s) => s.setLoginError);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<View>(defaultTab ?? 'select');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setView(defaultTab ?? 'select');
      setLoginError(null);
      setLocalError(null);
      setSubmitting(false);
      setEmailChecked(false);
      setEmailChecking(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, defaultTab, setLoginError]);

  const goTo = (v: View) => {
    setLocalError(null);
    setLoginError(null);
    setEmailChecked(false);
    setEmailChecking(false);
    setView(v);
  };

  const handleCheckEmail = async () => {
    if (!signupEmail) {
      setLocalError('이메일을 입력해주세요.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setLocalError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    setLocalError(null);
    setEmailChecking(true);
    try {
      // 성공(200) = 사용 가능, 중복이면 409 → ApiError 로 throw
      await checkEmail(signupEmail);
      setEmailChecked(true);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setLocalError('이미 사용 중인 이메일입니다.');
      } else {
        setLocalError(toUserMessage(err));
      }
    } finally {
      setEmailChecking(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!loginEmail || !loginPassword) {
      setLocalError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      onClose();
      toastUtils.success('로그인이 완료되었습니다.', { duration: 2000 });
      router.push('/select');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setLocalError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setLocalError(toUserMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!signupName || !signupEmail || !signupPassword || !signupPasswordConfirm) {
      setLocalError('모든 필드를 입력해주세요.');
      return;
    }
    if (!emailChecked) {
      setLocalError('이메일 중복 확인을 해주세요.');
      return;
    }
    if (signupPassword !== signupPasswordConfirm) {
      setLocalError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (signupPassword.length < 8) {
      setLocalError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (!termsAgreed || !privacyAgreed) {
      setLocalError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await signup({ email: signupEmail, password: signupPassword, name: signupName, termsAgreed, privacyAgreed });
      onClose();
      toastUtils.success('회원가입이 완료되었습니다.', { duration: 2000 });
      router.push('/select');
    } catch (err) {
      setLocalError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}
    >
      {/* 오버레이 */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(2,1,12,0.55)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          transition: 'opacity 0.35s ease', opacity: visible ? 1 : 0,
        }}
      />

      {/* 카드 */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 420,
        borderRadius: 32, overflow: 'hidden',
        transition: 'opacity 0.35s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.94)',
      }}>

        {/* ── 배경 레이어 ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(22,14,50,0.92) 0%, rgba(8,5,24,0.96) 100%)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        }} />
        {/* 테두리 */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 32,
          border: '1px solid rgba(139,92,246,0.25)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 100px rgba(0,0,0,0.5), 0 0 120px rgba(88,28,220,0.12)',
          pointerEvents: 'none',
        }} />

        {/* 상단 빛줄기 */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.7), rgba(139,92,246,1), rgba(167,139,250,0.7), transparent)',
        }} />

        {/* 배경 glow orbs */}
        <div aria-hidden="true" style={{ position: 'absolute', top: -100, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(79,70,229,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* 별빛 파티클 */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 22, left: 28, color: 'rgba(167,139,250,0.3)', fontSize: 9, pointerEvents: 'none' }}>✦</div>
        <div aria-hidden="true" style={{ position: 'absolute', top: 44, right: 52, color: 'rgba(167,139,250,0.18)', fontSize: 7, pointerEvents: 'none' }}>★</div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 48, right: 28, color: 'rgba(99,102,241,0.22)', fontSize: 9, pointerEvents: 'none' }}>✦</div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 80, left: 22, color: 'rgba(167,139,250,0.15)', fontSize: 6, pointerEvents: 'none' }}>●</div>

        <div style={{ position: 'relative', padding: '36px 32px 32px' }}>

          {/* 닫기 */}
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.25)', fontSize: 19, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
          >×</button>

          {/* 뒤로가기 */}
          {view !== 'select' && (
            <button
              onClick={() => goTo('select')}
              aria-label="뒤로"
              style={{
                position: 'absolute', top: 18, left: 18,
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.25)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
            >←</button>
          )}

          {/* ── 헤더 ── */}
          <div style={{ textAlign: 'center', marginBottom: view === 'select' ? 32 : 24 }}>
            {/* 아이콘 */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 60, height: 60, borderRadius: 20, marginBottom: 16,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(79,70,229,0.2) 100%)',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 0 32px rgba(109,40,217,0.25), 0 0 64px rgba(109,40,217,0.1)',
            }}>
              <span style={{ fontSize: 26, filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.6))' }}>✦</span>
            </div>

            <h2 id="auth-modal-title" style={{
              fontSize: view === 'select' ? '1.4rem' : '1.2rem',
              fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em',
              textShadow: '0 0 24px rgba(167,139,250,0.3)',
            }}>
              {view === 'select' ? 'SSAju 시작하기' : view === 'login' ? '로그인' : '회원가입'}
            </h2>

            {view === 'select' && (
              <p style={{ fontSize: 13.5, color: 'rgba(196,181,253,0.4)', lineHeight: 1.7, letterSpacing: '0.01em' }}>
                별자리 분석을 시작하려면<br/>로그인 또는 회원가입이 필요합니다
              </p>
            )}
          </div>

          {/* ══════════ SELECT ══════════ */}
          {view === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* 로그인 버튼 */}
              <button
                onClick={() => goTo('login')}
                style={{
                  width: '100%', padding: '0 20px', height: 64, borderRadius: 16,
                  border: '1px solid rgba(139,92,246,0.45)',
                  background: 'linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(79,70,229,0.2) 100%)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.75)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(109,40,217,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* 아이콘 */}
                <div style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>🔑</div>
                {/* 텍스트 */}
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#e9d5ff', letterSpacing: '-0.01em' }}>로그인</div>
                  <div style={{ fontSize: 12, color: 'rgba(196,181,253,0.45)', marginTop: 1 }}>기존 계정으로 계속하기</div>
                </div>
                <span style={{ color: 'rgba(167,139,250,0.4)', fontSize: 18 }}>›</span>
              </button>

              {/* 회원가입 버튼 */}
              <button
                onClick={() => goTo('signup')}
                style={{
                  width: '100%', padding: '0 20px', height: 64, borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.09)',
                  background: 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'transform 0.2s, border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>✨</div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.01em' }}>회원가입</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>새 계정 만들기</div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>›</span>
              </button>

              {/* 구분선 + 약관 */}
              <div style={{ marginTop: 6, textAlign: 'center' }}>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.16)', lineHeight: 1.7 }}>
                  계속하면{' '}
                  <span style={{ color: 'rgba(167,139,250,0.5)', cursor: 'pointer' }}>이용약관</span>
                  {' '}및{' '}
                  <span style={{ color: 'rgba(167,139,250,0.5)', cursor: 'pointer' }}>개인정보처리방침</span>
                  에 동의하는 것으로 간주합니다
                </p>
              </div>
            </div>
          )}

          {/* ══════════ LOGIN ══════════ */}
          {view === 'login' && (
            <>
              {localError && (
                <div style={{
                  marginBottom: 18, padding: '11px 15px', borderRadius: 12,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>⚠</span>
                  {localError}
                </div>
              )}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>이메일</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@email.com" autoComplete="email" style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }} />
                </div>
                <div>
                  <label style={labelStyle}>비밀번호</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호를 입력해주세요" autoComplete="current-password" style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }} />
                </div>

                <button type="submit" disabled={submitting} style={{
                  marginTop: 4, padding: '14px', borderRadius: 14, border: 'none',
                  background: submitting
                    ? 'rgba(109,40,217,0.4)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  letterSpacing: '-0.01em',
                  boxShadow: submitting ? 'none' : '0 4px 20px rgba(109,40,217,0.4)',
                }}
                  onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(109,40,217,0.5)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = submitting ? 'none' : '0 4px 20px rgba(109,40,217,0.4)'; }}>
                  {submitting ? '확인 중...' : '로그인'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
                  계정이 없으신가요?{' '}
                  <button type="button" onClick={() => goTo('signup')}
                    style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.65)', cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 600 }}>
                    회원가입하기
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ══════════ SIGNUP ══════════ */}
          {view === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* 성공/에러 배너 */}
              {emailChecked && (
                <div style={{
                  padding: '11px 15px', borderRadius: 12,
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.28)',
                  fontSize: 13, color: '#86efac', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>✓</span>
                  사용 가능한 이메일입니다.
                </div>
              )}
              {localError && (
                <div style={{
                  padding: '11px 15px', borderRadius: 12,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>⚠</span>
                  {localError}
                </div>
              )}

              {/* ── 이름 (폼 외부 — Enter 키 폼 제출 방지) ── */}
              <div>
                <label style={labelStyle}>이름</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  placeholder="홍길동"
                  autoComplete="name"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                />
              </div>

              {/* ── 이메일 + 중복 확인 (폼 외부 — 버튼·Enter 폼 제출 완전 차단) ── */}
              <div>
                <label style={labelStyle}>이메일</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={signupEmail}
                    onChange={(e) => { setSignupEmail(e.target.value); setEmailChecked(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCheckEmail(); } }}
                    placeholder="example@email.com"
                    autoComplete="email"
                    readOnly={emailChecked}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      ...(emailChecked ? {
                        borderColor: 'rgba(34,197,94,0.35)',
                        background: 'rgba(34,197,94,0.04)',
                        color: 'rgba(255,255,255,0.55)',
                        cursor: 'default',
                      } : {}),
                    }}
                    onFocus={(e) => { if (!emailChecked) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                    onBlur={(e) => { if (!emailChecked) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
                  />
                  <button
                    type="button"
                    onClick={handleCheckEmail}
                    disabled={emailChecking || emailChecked || !signupEmail}
                    style={{
                      padding: '0 14px',
                      borderRadius: 12,
                      border: emailChecked
                        ? '1px solid rgba(34,197,94,0.4)'
                        : '1px solid rgba(139,92,246,0.4)',
                      background: emailChecked
                        ? 'rgba(34,197,94,0.12)'
                        : 'rgba(109,40,217,0.22)',
                      color: emailChecked
                        ? 'rgba(134,239,172,0.9)'
                        : 'rgba(196,181,253,0.85)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: (emailChecking || emailChecked || !signupEmail) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                      opacity: (!emailChecked && (emailChecking || !signupEmail)) ? 0.5 : 1,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {emailChecking ? '확인 중...' : emailChecked ? '✓ 확인됨' : '중복 확인'}
                  </button>
                </div>
              </div>

              {/* ── 비밀번호 / 약관 / 제출 (폼 내부) ── */}
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>비밀번호 (8자 이상)</label>
                    <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••" autoComplete="new-password" style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>비밀번호 확인</label>
                    <input type="password" value={signupPasswordConfirm} onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                      placeholder="••••••••" autoComplete="new-password" style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }} />
                  </div>
                </div>

                {/* 약관 */}
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  {[
                    { checked: termsAgreed, onChange: setTermsAgreed, label: '이용약관', suffix: '에 동의합니다' },
                    { checked: privacyAgreed, onChange: setPrivacyAgreed, label: '개인정보처리방침', suffix: '에 동의합니다' },
                  ].map(({ checked, onChange, label, suffix }) => (
                    <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        background: checked ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.05)',
                        border: checked ? '1px solid rgba(139,92,246,0.9)' : '1px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {checked && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
                        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                      </div>
                      <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                        <span style={{ color: 'rgba(167,139,250,0.75)', fontWeight: 600 }}>{label}</span>{suffix}
                        <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>(필수)</span>
                      </span>
                    </label>
                  ))}
                </div>

                <button type="submit" disabled={submitting} style={{
                  padding: '14px', borderRadius: 14, border: 'none',
                  background: submitting
                    ? 'rgba(109,40,217,0.4)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  letterSpacing: '-0.01em',
                  boxShadow: submitting ? 'none' : '0 4px 20px rgba(109,40,217,0.4)',
                }}
                  onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(109,40,217,0.5)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = submitting ? 'none' : '0 4px 20px rgba(109,40,217,0.4)'; }}>
                  {submitting ? '처리 중...' : '회원가입'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
                이미 계정이 있으신가요?{' '}
                <button type="button" onClick={() => goTo('login')}
                  style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.65)', cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 600 }}>
                  로그인하기
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
