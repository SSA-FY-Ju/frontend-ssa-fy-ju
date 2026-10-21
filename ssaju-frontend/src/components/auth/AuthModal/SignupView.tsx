'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { checkEmail } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { toastUtils } from '@/lib/toast';
import { inputStyle, labelStyle, toUserMessage, focusInput, blurInput } from './AuthModal.utils';
import { ErrorBanner, SuccessBanner, SubmitButton, ViewSwitchLink } from './AuthModal.shared';

interface SignupViewProps {
  onClose: () => void;
  onGoLogin: () => void;
}

/**
 * 회원가입 폼. 입력 상태 8개를 전부 이 뷰 안에 지역화해서
 * 타이핑 리렌더가 AuthModal 전체(장식 레이어·다른 뷰)로 번지지 않게 한다.
 */
export function SignupView({ onClose, onGoLogin }: SignupViewProps) {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCheckEmail = async () => {
    if (!email) {
      setLocalError('이메일을 입력해주세요.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    setLocalError(null);
    setEmailChecking(true);
    try {
      // 성공(200) = 사용 가능, 중복이면 409 → ApiError 로 throw
      await checkEmail(email);
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!name || !email || !password || !passwordConfirm) {
      setLocalError('모든 필드를 입력해주세요.');
      return;
    }
    if (!emailChecked) {
      setLocalError('이메일 중복 확인을 해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setLocalError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 8) {
      setLocalError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (!termsAgreed || !privacyAgreed) {
      setLocalError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await signup({ email, password, name, termsAgreed, privacyAgreed });
      onClose();
      toastUtils.success('회원가입이 완료되었습니다.', { duration: 2000 });
      router.push('/select');
    } catch (err) {
      setLocalError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* 성공/에러 배너 */}
      {emailChecked && <SuccessBanner message="사용 가능한 이메일입니다." />}
      {localError && <ErrorBanner message={localError} />}

      {/* ── 이름 (폼 외부 — Enter 키 폼 제출 방지) ── */}
      <div>
        <label style={labelStyle}>이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
          placeholder="홍길동"
          autoComplete="name"
          style={inputStyle}
          onFocus={focusInput}
          onBlur={blurInput}
        />
      </div>

      {/* ── 이메일 + 중복 확인 (폼 외부 — 버튼·Enter 폼 제출 완전 차단) ── */}
      <div>
        <label style={labelStyle}>이메일</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailChecked(false); }}
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
            onFocus={(e) => { if (!emailChecked) focusInput(e); }}
            onBlur={(e) => { if (!emailChecked) blurInput(e); }}
          />
          <button
            type="button"
            onClick={handleCheckEmail}
            disabled={emailChecking || emailChecked || !email}
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
              cursor: (emailChecking || emailChecked || !email) ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s',
              opacity: (!emailChecked && (emailChecking || !email)) ? 0.5 : 1,
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="new-password" style={inputStyle}
              onFocus={focusInput} onBlur={blurInput} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>비밀번호 확인</label>
            <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••••" autoComplete="new-password" style={inputStyle}
              onFocus={focusInput} onBlur={blurInput} />
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

        <SubmitButton submitting={submitting} label="회원가입" busyLabel="처리 중..." />
      </form>

      <ViewSwitchLink question="이미 계정이 있으신가요?" action="로그인하기" onClick={onGoLogin} />
    </div>
  );
}
