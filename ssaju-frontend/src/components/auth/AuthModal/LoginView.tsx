'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api/client';
import { toastUtils } from '@/lib/toast';
import { inputStyle, labelStyle, toUserMessage, focusInput, blurInput } from './AuthModal.utils';
import { ErrorBanner, SubmitButton, ViewSwitchLink } from './AuthModal.shared';

interface LoginViewProps {
  onClose: () => void;
  onGoSignup: () => void;
}

/**
 * 로그인 폼. 이메일·비밀번호 등 입력 상태를 이 뷰 안에 지역화해서
 * 타이핑 리렌더가 AuthModal 전체(장식 레이어·다른 뷰)로 번지지 않게 한다.
 */
export function LoginView({ onClose, onGoSignup }: LoginViewProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email, password });
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

  return (
    <>
      {localError && <ErrorBanner message={localError} style={{ marginBottom: 18 }} />}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com" autoComplete="email" style={inputStyle}
            onFocus={focusInput} onBlur={blurInput} />
        </div>
        <div>
          <label style={labelStyle}>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요" autoComplete="current-password" style={inputStyle}
            onFocus={focusInput} onBlur={blurInput} />
        </div>

        <SubmitButton submitting={submitting} label="로그인" busyLabel="확인 중..." style={{ marginTop: 4 }} />

        <ViewSwitchLink question="계정이 없으신가요?" action="회원가입하기" onClick={onGoSignup} />
      </form>
    </>
  );
}
