'use client';

import { useEffect, useRef, useState } from 'react';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { BaseModal } from '@/components/common/BaseModal';

interface WithdrawalModalProps {
  onClose: () => void;
}

export function WithdrawalModal({ onClose }: WithdrawalModalProps) {
  const { password, setPassword, isDeleting, error, submit } = useDeleteAccount();
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);

  // 마운트 직후 visible=true → 열림 트랜지션
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    inputRef.current?.focus();
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
    if (e.key === 'Enter') submit();
  };

  return (
    <BaseModal
      onClose={handleClose}
      maxWidth={320}
      zIndex={9999}
      accentBar={false}
      backdropStyle={{
        background: 'rgba(4,2,18,0.78)',
        transition: 'opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}
      containerStyle={{
        background: 'linear-gradient(135deg, rgba(30,20,60,0.9) 0%, rgba(15,10,35,0.95) 100%)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        padding: '28px',
        transition: 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
      }}
    >
      <div onKeyDown={handleKeyDown}>
        {/* 경고 아이콘 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
          }}>
            ⚠️
          </div>
        </div>

        <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
          회원 탈퇴
        </h2>
        <p style={{ fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 1.65, color: 'rgba(148,163,184,0.65)' }}>
          탈퇴 후 모든 분석 기록이 삭제되며<br />
          복구할 수 없습니다.<br />
          비밀번호를 입력하여 확인해주세요.
        </p>

        {/* 비밀번호 입력 */}
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="현재 비밀번호"
          disabled={isDeleting}
          style={{
            width: '100%',
            borderRadius: 12,
            padding: '10px 16px',
            fontSize: 13,
            outline: 'none',
            background: 'rgba(255,255,255,0.05)',
            border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(139,92,246,0.2)',
            color: '#fff',
            boxSizing: 'border-box',
            marginBottom: 4,
            opacity: isDeleting ? 0.5 : 1,
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)'; }}
          onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; }}
        />

        {error && (
          <p style={{ fontSize: 12, color: '#f87171', marginBottom: 8, paddingLeft: 4 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: error ? 12 : 16 }}>
          {/* 취소 */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            style={{
              flex: 1, padding: '10px 0', fontSize: 13, borderRadius: 12,
              border: '1px solid rgba(139,92,246,0.25)', color: 'rgba(196,181,253,0.7)',
              background: 'transparent', cursor: 'pointer', transition: 'background 0.15s',
              opacity: isDeleting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            취소
          </button>

          {/* 탈퇴 확인 */}
          <button
            type="button"
            onClick={submit}
            disabled={isDeleting || !password.trim()}
            style={{
              flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 600, borderRadius: 12,
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
              color: '#f87171', cursor: isDeleting || !password.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s', opacity: isDeleting || !password.trim() ? 0.4 : 1,
            }}
            onMouseEnter={(e) => { if (!isDeleting && password.trim()) e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
          >
            {isDeleting ? '처리 중...' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
