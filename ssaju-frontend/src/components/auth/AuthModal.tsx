'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { checkEmail } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { toastUtils } from '@/lib/toast';

type AuthTab = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1px solid rgba(139,92,246,0.25)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: 'rgba(196,181,253,0.6)',
  marginBottom: 6,
  letterSpacing: '0.03em',
};

/** API 에러 코드 → 사용자 친화적 메시지 변환 */
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
    return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
  }
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const setLoginError = useAuthStore((s) => s.setLoginError);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const [localError, setLocalError] = useState<string | null>(null);

  // useAuth의 isLoading과 분리 — check-email 단계까지 버튼 비활성 유지
  const [submitting, setSubmitting] = useState(false);

  // 로그인 폼
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 회원가입 폼
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTab(defaultTab);
      setLoginError(null);
      setLocalError(null);
      setSubmitting(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, defaultTab, setLoginError]);

  const handleTabChange = (t: AuthTab) => {
    setTab(t);
    setLocalError(null);
    setLoginError(null);
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
      // 성공: 모달 닫고 토스트 → /chat 이동
      onClose();
      toastUtils.success('로그인이 완료되었습니다.', { duration: 2000 });
      router.push('/chat');
    } catch (err) {
      // 로그인 실패 시 check-email로 원인 판별
      try {
        const { available } = await checkEmail(loginEmail);
        if (available) {
          setLocalError('등록되지 않은 이메일입니다. 회원가입을 먼저 해주세요.');
        } else {
          setLocalError('비밀번호가 올바르지 않습니다.');
        }
      } catch {
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
      await signup({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        termsAgreed,
        privacyAgreed,
      });
      // 성공: 모달 닫고 토스트 → /chat 이동
      onClose();
      toastUtils.success('회원가입이 완료되었습니다.', { duration: 2000 });
      router.push('/chat');
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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
      }}
    >
      {/* 오버레이 */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(4,2,18,0.2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'opacity 0.3s ease',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* 카드 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 440,
          background: 'linear-gradient(160deg, rgba(30,20,60,0.45) 0%, rgba(12,8,30,0.52) 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 28,
          overflow: 'hidden',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset, 0 32px 80px rgba(0,0,0,0.35), 0 0 80px rgba(109,40,217,0.15)',
          transition: 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
        }}
      >
        {/* 상단 그라디언트 선 */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(139,92,246,0.8), rgba(99,102,241,0.6), transparent)',
        }} />

        {/* 배경 glow */}
        <div aria-hidden="true" style={{ position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: -60, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: 20, left: 24, color: 'rgba(167,139,250,0.25)', fontSize: 10, pointerEvents: 'none' }}>✦</div>
        <div aria-hidden="true" style={{ position: 'absolute', top: 36, right: 48, color: 'rgba(167,139,250,0.15)', fontSize: 8, pointerEvents: 'none' }}>★</div>

        <div style={{ padding: '32px 28px 28px' }}>
          {/* 닫기 */}
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 30, height: 30, borderRadius: 9,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.3)', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s', lineHeight: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >×</button>

          {/* 로고 + 타이틀 */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(79,70,229,0.15) 100%)',
              border: '1px solid rgba(139,92,246,0.35)', marginBottom: 14,
              boxShadow: '0 0 24px rgba(109,40,217,0.2)',
            }}>
              <span style={{ fontSize: 22 }}>✦</span>
            </div>
            <h2
              id="auth-modal-title"
              style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 0, letterSpacing: '-0.01em' }}
            >
              SSAju 시작하기
            </h2>
          </div>

          {/* 탭 */}
          <div style={{
            display: 'flex', borderRadius: 12, overflow: 'hidden',
            border: '1px solid rgba(139,92,246,0.2)', marginBottom: 24,
          }}>
            {(['login', 'signup'] as AuthTab[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                style={{
                  flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', border: 'none', transition: 'background 0.2s, color 0.2s',
                  background: tab === t ? 'rgba(139,92,246,0.25)' : 'transparent',
                  color: tab === t ? '#c4b5fd' : 'rgba(255,255,255,0.35)',
                }}
              >
                {t === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          {/* 에러 */}
          {localError && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              fontSize: 13, color: '#fca5a5',
            }}>
              {localError}
            </div>
          )}

          {/* 로그인 폼 */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>이메일</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>비밀번호</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="비밀번호를 입력해주세요"
                  autoComplete="current-password"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: 4, padding: '13px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, rgba(109,40,217,0.8) 0%, rgba(79,70,229,0.8) 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'opacity 0.15s, transform 0.15s',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {submitting ? '확인 중...' : '로그인'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                계정이 없으신가요?{' '}
                <button type="button" onClick={() => handleTabChange('signup')}
                  style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.7)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                  회원가입
                </button>
              </p>
            </form>
          )}

          {/* 회원가입 폼 */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>이름</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="이름을 입력해주세요"
                  autoComplete="name"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>이메일</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>비밀번호 (8자 이상)</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="비밀번호를 입력해주세요"
                  autoComplete="new-password"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>비밀번호 확인</label>
                <input
                  type="password"
                  value={signupPasswordConfirm}
                  onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력해주세요"
                  autoComplete="new-password"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    style={{ accentColor: '#8b5cf6', width: 15, height: 15 }}
                  />
                  <span><span style={{ color: 'rgba(167,139,250,0.8)' }}>이용약관</span>에 동의합니다 (필수)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    style={{ accentColor: '#8b5cf6', width: 15, height: 15 }}
                  />
                  <span><span style={{ color: 'rgba(167,139,250,0.8)' }}>개인정보처리방침</span>에 동의합니다 (필수)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: 4, padding: '13px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, rgba(109,40,217,0.8) 0%, rgba(79,70,229,0.8) 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'opacity 0.15s, transform 0.15s',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {submitting ? '처리 중...' : '회원가입'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                이미 계정이 있으신가요?{' '}
                <button type="button" onClick={() => handleTabChange('login')}
                  style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.7)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                  로그인
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
