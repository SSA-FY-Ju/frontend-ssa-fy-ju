'use client';

import { useEffect, useState } from 'react';
import { BaseModal } from '@/components/common/BaseModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKakaoLogin: () => void;
  onGoogleLogin: () => void;
  isLoading?: boolean;
  error?: string | null;
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3C6.477 3 2 6.588 2 11c0 2.813 1.742 5.29 4.381 6.738l-1.11 4.133a.25.25 0 0 0 .37.278L10.6 19.3A11.7 11.7 0 0 0 12 19.4c5.523 0 10-3.588 10-8s-4.477-8-10-8Z"
        fill="#3A1D1D"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function LoginModal({
  isOpen,
  onClose,
  onKakaoLogin,
  onGoogleLogin,
  isLoading = false,
  error = null,
}: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <BaseModal
      onClose={onClose}
      maxWidth={460}
      zIndex={9999}
      accentBar={false}
      backdropStyle={{
        background: 'rgba(4,2,18,0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}
      containerStyle={{
        background: 'linear-gradient(160deg, rgba(30,20,60,0.45) 0%, rgba(12,8,30,0.52) 100%)',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: 28,
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

        {/* 배경 glow 장식 */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute',
          bottom: -60,
          left: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* 별빛 장식 */}
        <div aria-hidden="true" style={{ position: 'absolute', top: 20, left: 24, color: 'rgba(167,139,250,0.25)', fontSize: 10, pointerEvents: 'none' }}>✦</div>
        <div aria-hidden="true" style={{ position: 'absolute', top: 36, right: 48, color: 'rgba(167,139,250,0.15)', fontSize: 8, pointerEvents: 'none' }}>★</div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 60, right: 20, color: 'rgba(99,102,241,0.2)', fontSize: 10, pointerEvents: 'none' }}>✦</div>

        <div style={{ padding: '36px 28px 32px' }}>
          {/* 닫기 */}
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 30,
              height: 30,
              borderRadius: 9,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >
            ×
          </button>

          {/* 헤더 */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {/* 로고 아이콘 */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(79,70,229,0.15) 100%)',
              border: '1px solid rgba(139,92,246,0.35)',
              marginBottom: 18,
              boxShadow: '0 0 24px rgba(109,40,217,0.2)',
            }}>
              <span style={{ fontSize: 24 }}>✦</span>
            </div>
            <h2
              id="login-modal-title"
              style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}
            >
              SSAju 시작하기
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(196,181,253,0.5)', lineHeight: 1.6 }}>
              소셜 계정으로 간편하게 시작하세요
            </p>
          </div>

          {/* 에러 */}
          {error && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: 13,
              color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          {/* 소셜 버튼 */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
            {/* 카카오 — 공식 스펙 */}
            <button
              onClick={onKakaoLogin}
              disabled={isLoading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 12px',
                borderRadius: 12,
                border: 'none',
                background: '#FEE500',
                color: '#191919',
                fontSize: 14,
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'filter 0.15s, transform 0.15s',
                letterSpacing: '-0.01em',
                position: 'relative',
              }}
              onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.filter = 'brightness(0.95)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            >
              <KakaoIcon />
              카카오로 계속하기
            </button>

            {/* 구글 — 공식 스펙 */}
            <button
              onClick={onGoogleLogin}
              disabled={isLoading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.96)',
                color: '#3c3c3c',
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'filter 0.15s, transform 0.15s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.filter = 'brightness(0.97)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            >
              <GoogleIcon />
              Google로 계속하기
            </button>
          </div>

          {isLoading && (
            <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'rgba(196,181,253,0.4)' }}>
              로그인 중...
            </p>
          )}

          {/* 하단 안내 */}
          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.18)', lineHeight: 1.6 }}>
            로그인 시 <span style={{ color: 'rgba(167,139,250,0.5)' }}>이용약관</span> 및 <span style={{ color: 'rgba(167,139,250,0.5)' }}>개인정보처리방침</span>에 동의한 것으로 간주합니다.
          </p>
        </div>
    </BaseModal>
  );
}
